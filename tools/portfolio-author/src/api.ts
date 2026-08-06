import type { Collection, ContentFile, ImageAsset } from './types';

async function ensureOk(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `request failed: ${res.status}`);
  }
  return res;
}

export async function listFiles(): Promise<ContentFile[]> {
  const res = await fetch('/api/files');
  await ensureOk(res);
  return res.json();
}

export async function readFile(collection: Collection, name: string): Promise<string> {
  const res = await fetch(`/api/files/${collection}/${encodeURIComponent(name)}`);
  await ensureOk(res);
  return res.text();
}

export async function writeFile(collection: Collection, name: string, content: string): Promise<void> {
  const res = await fetch(`/api/files/${collection}/${encodeURIComponent(name)}`, {
    method: 'PUT',
    body: content,
  });
  await ensureOk(res);
}

export async function createFile(collection: Collection, name: string, template?: string): Promise<void> {
  const res = await fetch('/api/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection, name, template }),
  });
  await ensureOk(res);
}

export async function deleteFile(collection: Collection, name: string): Promise<void> {
  const res = await fetch(`/api/files/${collection}/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  });
  await ensureOk(res);
}

export async function listImages(project: string): Promise<ImageAsset[]> {
  const res = await fetch(`/api/images?project=${encodeURIComponent(project)}`);
  await ensureOk(res);
  return res.json();
}

export async function uploadImage(project: string, filename: string, dataBase64: string): Promise<ImageAsset> {
  const res = await fetch('/api/images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project, filename, dataBase64 }),
  });
  await ensureOk(res);
  return res.json();
}

export async function renameImage(project: string, filename: string, newName: string): Promise<ImageAsset> {
  const res = await fetch('/api/images', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project, filename, newName }),
  });
  await ensureOk(res);
  return res.json();
}

export async function deleteImage(project: string, filename: string): Promise<void> {
  const res = await fetch(
    `/api/images?project=${encodeURIComponent(project)}&filename=${encodeURIComponent(filename)}`,
    { method: 'DELETE' }
  );
  await ensureOk(res);
}
