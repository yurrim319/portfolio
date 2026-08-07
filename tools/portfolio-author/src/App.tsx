import { useCallback, useEffect, useState } from 'react';
import FileExplorer from './components/FileExplorer';
import MarkdownEditor from './components/MarkdownEditor';
import { createFile, deleteFile, listFiles, readFile, writeFile } from './api';
import type { Collection, ContentFile } from './types';
import '../../../src/styles/theme.css';
import './style.css';

const NAME_RE = /^[a-zA-Z0-9._-]+\.(md|mdx)$/;

export default function App() {
  const [files, setFiles] = useState<ContentFile[]>([]);
  const [selected, setSelected] = useState<ContentFile | null>(null);
  const [content, setContent] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setFiles(await listFiles());
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleSelect(file: ContentFile) {
    if (dirty && !window.confirm('저장하지 않은 변경사항이 있습니다. 이동할까요?')) return;
    try {
      const text = await readFile(file.collection, file.name);
      setSelected(file);
      setContent(text);
      setDirty(false);
      setSavedAt(null);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    try {
      await writeFile(selected.collection, selected.name, content);
      setDirty(false);
      setSavedAt(new Date());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate(collection: Collection) {
    const name = window.prompt(`새 파일 이름 (예: my-project.mdx)`);
    if (!name) return;
    if (!NAME_RE.test(name)) {
      setError('파일 이름은 영문/숫자/.-_ 만 사용하고 .md 또는 .mdx로 끝나야 합니다.');
      return;
    }
    const template =
      collection === 'projects'
        ? window.confirm('Overview~Reflection 표준 구조 템플릿으로 시작할까요?\n(취소하면 빈 문서로 생성됩니다)')
          ? 'full'
          : 'default'
        : undefined;
    try {
      await createFile(collection, name, template);
      await refresh();
      await handleSelect({ collection, name, path: `${collection}/${name}` });
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(file: ContentFile) {
    if (!window.confirm(`${file.path} 파일을 삭제할까요? 되돌릴 수 없습니다.`)) return;
    try {
      await deleteFile(file.collection, file.name);
      if (selected?.path === file.path) {
        setSelected(null);
        setContent('');
        setDirty(false);
      }
      await refresh();
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="app">
      <div className="app-header">Portfolio Author</div>
      {error && <div className="app-error">{error}</div>}
      <div className="app-body">
        <FileExplorer
          files={files}
          selected={selected}
          onSelect={handleSelect}
          onCreate={handleCreate}
          onDelete={handleDelete}
        />
        <MarkdownEditor
          file={selected}
          content={content}
          dirty={dirty}
          saving={saving}
          savedAt={savedAt}
          onChange={value => {
            setContent(value);
            setDirty(true);
          }}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
