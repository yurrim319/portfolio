import type { Collection, ContentFile } from '../types';

interface Props {
  files: ContentFile[];
  selected: ContentFile | null;
  onSelect: (file: ContentFile) => void;
  onCreate: (collection: Collection) => void;
  onDelete: (file: ContentFile) => void;
}

const GROUPS: { collection: Collection; label: string }[] = [
  { collection: 'projects', label: 'projects' },
  { collection: 'pages', label: 'pages' },
];

export default function FileExplorer({ files, selected, onSelect, onCreate, onDelete }: Props) {
  return (
    <div className="explorer">
      {GROUPS.map(group => {
        const groupFiles = files.filter(f => f.collection === group.collection);
        return (
          <div key={group.collection} className="explorer-group">
            <div className="explorer-group-header">
              <span>{group.label}</span>
              <button className="icon-btn" title="새 파일" onClick={() => onCreate(group.collection)}>
                +
              </button>
            </div>
            <ul className="explorer-list">
              {groupFiles.map(file => (
                <li
                  key={file.path}
                  className={`explorer-item${selected?.path === file.path ? ' active' : ''}`}
                >
                  <button className="explorer-item-name" onClick={() => onSelect(file)}>
                    {file.name}
                  </button>
                  <button
                    className="icon-btn danger"
                    title="삭제"
                    onClick={() => onDelete(file)}
                  >
                    ×
                  </button>
                </li>
              ))}
              {groupFiles.length === 0 && <li className="explorer-empty">파일 없음</li>}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
