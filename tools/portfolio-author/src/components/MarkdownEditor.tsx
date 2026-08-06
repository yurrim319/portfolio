import { useEffect, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import type { EditorView } from '@codemirror/view';
import type { ContentFile, ImageAsset } from '../types';
import Preview from './Preview';
import FrontmatterPanel from './FrontmatterPanel';
import AssetManager from './AssetManager';

interface Props {
  file: ContentFile | null;
  content: string;
  dirty: boolean;
  saving: boolean;
  savedAt: Date | null;
  onChange: (value: string) => void;
  onSave: () => void;
}

const FM_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

const SNIPPETS: { key: string; label: string; text: string }[] = [
  { key: 'heading', label: '제목 (##)', text: '\n## 섹션 제목\n\n' },
  { key: 'divider', label: '구분선 (---)', text: '\n---\n\n' },
  { key: 'code', label: '코드 블록', text: '\n```\n\n```\n\n' },
  { key: 'table', label: '표', text: '\n| 항목 | 설명 |\n| --- | --- |\n| 값1 | 설명1 |\n\n' },
];

function formatTime(date: Date): string {
  return date.toLocaleString('ko-KR', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function MarkdownEditor({ file, content, dirty, saving, savedAt, onChange, onSave }: Props) {
  const [showPreview, setShowPreview] = useState(true);
  const [showMeta, setShowMeta] = useState(true);
  const [showAssets, setShowAssets] = useState(false);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  if (!file) {
    return <div className="editor-empty">왼쪽에서 파일을 선택하세요.</div>;
  }

  const projectSlug = file.collection === 'projects' ? file.name.replace(/\.(md|mdx)$/, '') : null;

  function insertAtCursor(text: string) {
    const view = viewRef.current;
    if (!view) return;
    // frontmatter(---...---) 안에 커서가 있어도 그 블록을 건드리지 않도록,
    // 삽입 위치를 frontmatter 끝 이후로 강제한다.
    const fmMatch = content.match(FM_RE);
    const fmEnd = fmMatch ? fmMatch[0].length : 0;
    const { from, to } = view.state.selection.main;
    const safeFrom = Math.max(from, fmEnd);
    const safeTo = Math.max(to, fmEnd);
    view.dispatch({ changes: { from: safeFrom, to: safeTo, insert: text }, selection: { anchor: safeFrom + text.length } });
    view.focus();
  }

  function insertImage(img: ImageAsset) {
    const alt = img.name.replace(/\.[^.]+$/, '');
    insertAtCursor(`![${alt}](${img.url})`);
  }

  return (
    <div className="editor">
      <div className="editor-toolbar">
        <span className="editor-path">{file.path}</span>
        <span className="editor-status">{saving ? '저장 중…' : dirty ? '수정됨' : '저장됨'}</span>
        <button className="toggle-btn" onClick={() => setShowMeta(v => !v)}>
          {showMeta ? '메타데이터 숨기기' : '메타데이터 보기'}
        </button>
        <button className="toggle-btn" onClick={() => setShowPreview(v => !v)}>
          {showPreview ? '미리보기 숨기기' : '미리보기 보기'}
        </button>
        <select
          className="toggle-btn snippet-select"
          value=""
          onChange={e => {
            const snippet = SNIPPETS.find(s => s.key === e.target.value);
            if (snippet) insertAtCursor(snippet.text);
          }}
        >
          <option value="" disabled>+ 컴포넌트 삽입</option>
          {SNIPPETS.map(s => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        {projectSlug && (
          <button className="toggle-btn" onClick={() => setShowAssets(true)}>
            이미지
          </button>
        )}
        <button className="save-btn" onClick={onSave} disabled={saving || !dirty}>
          저장 (Ctrl+S)
        </button>
      </div>
      {showMeta && (
        <FrontmatterPanel
          content={content}
          collection={file.collection}
          projectSlug={projectSlug}
          onChange={onChange}
        />
      )}
      <div className="editor-panes">
        <CodeMirror
          value={content}
          height="100%"
          className="editor-cm"
          theme="dark"
          extensions={[markdown()]}
          onChange={onChange}
          onCreateEditor={view => { viewRef.current = view; }}
        />
        {showPreview && <Preview content={content} />}
      </div>
      <div className="editor-footer">
        {savedAt ? `마지막 저장: ${formatTime(savedAt)}` : '아직 저장 안 됨'}
      </div>
      {showAssets && projectSlug && (
        <AssetManager
          projectSlug={projectSlug}
          onClose={() => setShowAssets(false)}
          onSelect={insertImage}
        />
      )}
    </div>
  );
}
