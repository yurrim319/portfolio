import { defineConfig, type Plugin, type Connect } from 'vite';
import react from '@vitejs/plugin-react';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

const CONTENT_ROOT = path.resolve(__dirname, '../../src/content');
const PUBLIC_ROOT = path.resolve(__dirname, '../../public');
const IMAGES_ROOT = path.join(PUBLIC_ROOT, 'images');

const COLLECTIONS = ['projects', 'pages'] as const;
type Collection = (typeof COLLECTIONS)[number];

const FILENAME_RE = /^[a-zA-Z0-9._-]+\.(md|mdx)$/;
const IMAGE_NAME_RE = /^[a-zA-Z0-9._-]+\.(png|jpe?g|gif|webp|svg)$/i;
const PROJECT_SLUG_RE = /^[a-zA-Z0-9._-]+$/;

const MIME_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function isCollection(value: string): value is Collection {
  return (COLLECTIONS as readonly string[]).includes(value);
}

function collectionDir(collection: Collection): string {
  return path.join(CONTENT_ROOT, collection);
}

function safeFilePath(collection: string, name: string): string {
  if (!isCollection(collection)) throw new HttpError(400, `unknown collection: ${collection}`);
  if (!FILENAME_RE.test(name)) throw new HttpError(400, `invalid file name: ${name}`);
  const dir = collectionDir(collection);
  const resolved = path.resolve(dir, name);
  if (resolved !== path.join(dir, name)) throw new HttpError(400, 'path traversal rejected');
  return resolved;
}

function imagesDir(project: string): string {
  if (!PROJECT_SLUG_RE.test(project)) throw new HttpError(400, `invalid project slug: ${project}`);
  return path.join(IMAGES_ROOT, project);
}

function safeImagePath(project: string, filename: string): string {
  if (!IMAGE_NAME_RE.test(filename)) throw new HttpError(400, `invalid image file name: ${filename}`);
  const dir = imagesDir(project);
  const resolved = path.resolve(dir, filename);
  if (resolved !== path.join(dir, filename)) throw new HttpError(400, 'path traversal rejected');
  return resolved;
}

function mimeFor(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return MIME_TYPES[ext] ?? 'application/octet-stream';
}

async function uniqueName(dir: string, filename: string): Promise<string> {
  const ext = path.extname(filename);
  const base = filename.slice(0, filename.length - ext.length);
  let candidate = filename;
  let i = 2;
  while (true) {
    try {
      await fs.access(path.join(dir, candidate));
      candidate = `${base}-${i}${ext}`;
      i++;
    } catch {
      return candidate;
    }
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

const PROJECT_FRONTMATTER = `---\ntitle: "New Project"\nsubtitle: ""\ntype: ""\ndate: ""\ndraft: true\nchips: []\n---\n\n`;

const PROJECT_FULL_BODY = `## 개요 (Overview)

무엇을 만들었는지, 왜 시작했는지 간단히 정리하세요.

---

## 문제 정의 (Problem)

어떤 문제·한계를 해결하려 했는지 적으세요.

---

## 리서치 (Research)

조사하거나 참고한 자료, 후보 접근법을 정리하세요.

---

## 구현 (Implementation)

실제로 구현한 방법을 설명하세요.

---

## 결과 (Result)

결과물과 수치·비교 등을 정리하세요.

---

## 회고 (Reflection)

배운 점, 아쉬운 점, 다음 스텝을 적으세요.
`;

function template(collection: Collection, templateKey?: string): string {
  if (collection === 'pages') {
    return `---\ntitle: "New Page"\ndescription: ""\n---\n\n내용을 입력하세요.\n`;
  }
  if (templateKey === 'full') {
    return PROJECT_FRONTMATTER + PROJECT_FULL_BODY;
  }
  return PROJECT_FRONTMATTER + '작성 중...\n';
}

async function listFiles() {
  const files: { collection: Collection; name: string; path: string }[] = [];
  for (const collection of COLLECTIONS) {
    const dir = collectionDir(collection);
    let entries: string[] = [];
    try {
      entries = await fs.readdir(dir);
    } catch {
      continue;
    }
    for (const name of entries) {
      if (FILENAME_RE.test(name)) {
        files.push({ collection, name, path: `${collection}/${name}` });
      }
    }
  }
  return files;
}

async function listImages(project: string) {
  const dir = imagesDir(project);
  let entries: string[] = [];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }
  return entries
    .filter(name => IMAGE_NAME_RE.test(name))
    .map(name => ({ project, name, url: `/images/${project}/${name}` }));
}

function fileApiPlugin(): Plugin {
  return {
    name: 'portfolio-author-file-api',
    configureServer(server) {
      const handler: Connect.NextHandleFunction = async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/files')) return next();
        const url = new URL(req.url, 'http://localhost');
        const parts = url.pathname.split('/').filter(Boolean); // ['api','files', collection?, name?]

        try {
          if (req.method === 'GET' && parts.length === 2) {
            return sendJson(res, 200, await listFiles());
          }

          if (req.method === 'GET' && parts.length === 4) {
            const filePath = safeFilePath(parts[2], parts[3]);
            const content = await fs.readFile(filePath, 'utf-8');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            return res.end(content);
          }

          if (req.method === 'PUT' && parts.length === 4) {
            const filePath = safeFilePath(parts[2], parts[3]);
            await fs.access(filePath);
            const body = await readBody(req);
            await fs.writeFile(filePath, body, 'utf-8');
            return sendJson(res, 200, { ok: true });
          }

          if (req.method === 'POST' && parts.length === 2) {
            const body = JSON.parse(await readBody(req));
            const filePath = safeFilePath(body.collection, body.name);
            try {
              await fs.access(filePath);
              return sendJson(res, 409, { error: 'file already exists' });
            } catch {
              // does not exist yet, proceed
            }
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            await fs.writeFile(filePath, template(body.collection, body.template), 'utf-8');
            return sendJson(res, 201, { collection: body.collection, name: body.name });
          }

          if (req.method === 'DELETE' && parts.length === 4) {
            const filePath = safeFilePath(parts[2], parts[3]);
            await fs.unlink(filePath);
            return sendJson(res, 200, { ok: true });
          }

          return next();
        } catch (err) {
          if (err instanceof HttpError) return sendJson(res, err.status, { error: err.message });
          if ((err as NodeJS.ErrnoException).code === 'ENOENT') return sendJson(res, 404, { error: 'not found' });
          console.error(err);
          return sendJson(res, 500, { error: 'internal error' });
        }
      };
      server.middlewares.use(handler);
    },
  };
}

function assetApiPlugin(): Plugin {
  return {
    name: 'portfolio-author-asset-api',
    configureServer(server) {
      const handler: Connect.NextHandleFunction = async (req, res, next) => {
        if (!req.url) return next();
        const url = new URL(req.url, 'http://localhost');

        // 정적 서빙: /images/<project>/<file> -> public/images/<project>/<file>
        if (req.method === 'GET' && url.pathname.startsWith('/images/')) {
          const parts = url.pathname.split('/').filter(Boolean); // ['images', project, file]
          if (parts.length !== 3) return next();
          try {
            const filePath = safeImagePath(parts[1], parts[2]);
            const data = await fs.readFile(filePath);
            res.statusCode = 200;
            res.setHeader('Content-Type', mimeFor(parts[2]));
            return res.end(data);
          } catch (err) {
            if (err instanceof HttpError) return sendJson(res, err.status, { error: err.message });
            res.statusCode = 404;
            return res.end();
          }
        }

        if (!url.pathname.startsWith('/api/images')) return next();

        try {
          if (req.method === 'GET') {
            const project = url.searchParams.get('project') ?? '';
            return sendJson(res, 200, await listImages(project));
          }

          if (req.method === 'POST') {
            const body = JSON.parse(await readBody(req));
            const dir = imagesDir(body.project);
            if (!IMAGE_NAME_RE.test(body.filename)) throw new HttpError(400, `invalid image file name: ${body.filename}`);
            await fs.mkdir(dir, { recursive: true });
            const finalName = await uniqueName(dir, body.filename);
            const buffer = Buffer.from(body.dataBase64, 'base64');
            await fs.writeFile(path.join(dir, finalName), buffer);
            return sendJson(res, 201, { project: body.project, name: finalName, url: `/images/${body.project}/${finalName}` });
          }

          if (req.method === 'PATCH') {
            const body = JSON.parse(await readBody(req));
            const oldPath = safeImagePath(body.project, body.filename);
            const newPath = safeImagePath(body.project, body.newName);
            try {
              await fs.access(newPath);
              return sendJson(res, 409, { error: 'target file already exists' });
            } catch {
              // does not exist, proceed
            }
            await fs.rename(oldPath, newPath);
            return sendJson(res, 200, { project: body.project, name: body.newName, url: `/images/${body.project}/${body.newName}` });
          }

          if (req.method === 'DELETE') {
            const project = url.searchParams.get('project') ?? '';
            const filename = url.searchParams.get('filename') ?? '';
            const filePath = safeImagePath(project, filename);
            await fs.unlink(filePath);
            return sendJson(res, 200, { ok: true });
          }

          return next();
        } catch (err) {
          if (err instanceof HttpError) return sendJson(res, err.status, { error: err.message });
          if ((err as NodeJS.ErrnoException).code === 'ENOENT') return sendJson(res, 404, { error: 'not found' });
          console.error(err);
          return sendJson(res, 500, { error: 'internal error' });
        }
      };
      server.middlewares.use(handler);
    },
  };
}

export default defineConfig({
  root: __dirname,
  plugins: [react(), fileApiPlugin(), assetApiPlugin()],
});
