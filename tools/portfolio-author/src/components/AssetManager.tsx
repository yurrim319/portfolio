import { useEffect, useRef, useState } from 'react';
import { deleteImage, listImages, renameImage, uploadImage } from '../api';
import type { ImageAsset } from '../types';

interface Props {
  projectSlug: string;
  onClose: () => void;
  onSelect: (image: ImageAsset) => void;
  selectLabel?: string;
}

const IMAGE_NAME_RE = /^[a-zA-Z0-9._-]+\.(png|jpe?g|gif|webp|svg)$/i;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AssetManager({ projectSlug, onClose, onSelect, selectLabel = '삽입' }: Props) {
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    try {
      setImages(await listImages(projectSlug));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    refresh();
  }, [projectSlug]);

  async function handleFiles(files: FileList | File[]) {
    setError(null);
    const list = Array.from(files);
    const invalid = list.filter(f => !IMAGE_NAME_RE.test(f.name));
    if (invalid.length > 0) {
      setError(`지원하지 않는 파일: ${invalid.map(f => f.name).join(', ')} (png/jpg/gif/webp/svg만 가능)`);
    }
    const valid = list.filter(f => IMAGE_NAME_RE.test(f.name));
    if (valid.length === 0) return;
    setUploading(true);
    try {
      for (const file of valid) {
        const base64 = await fileToBase64(file);
        await uploadImage(projectSlug, file.name, base64);
      }
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleRename(img: ImageAsset) {
    const newName = window.prompt('새 파일 이름', img.name);
    if (!newName || newName === img.name) return;
    if (!IMAGE_NAME_RE.test(newName)) {
      setError('파일 이름은 영문/숫자/.-_ 만 사용하고 png/jpg/gif/webp/svg로 끝나야 합니다.');
      return;
    }
    try {
      await renameImage(projectSlug, img.name, newName);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function handleDelete(img: ImageAsset) {
    if (!window.confirm(`${img.name} 이미지를 삭제할까요? 되돌릴 수 없습니다.`)) return;
    try {
      await deleteImage(projectSlug, img.name);
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="asset-backdrop" onClick={onClose}>
      <div className="asset-modal" onClick={e => e.stopPropagation()}>
        <div className="asset-modal-header">
          <span>이미지 — {projectSlug}</span>
          <button className="icon-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="app-error">{error}</div>}

        <div
          className={`asset-dropzone${dragging ? ' dragging' : ''}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? '업로드 중…' : '이미지를 드래그하거나 클릭해서 선택'}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={e => e.target.files && handleFiles(e.target.files)}
          />
        </div>

        <div className="asset-grid">
          {images.map(img => (
            <div className="asset-item" key={img.name}>
              <img src={img.url} alt={img.name} className="asset-thumb" />
              <div className="asset-name" title={img.name}>{img.name}</div>
              <div className="asset-actions">
                <button className="toggle-btn" onClick={() => onSelect(img)}>
                  {selectLabel}
                </button>
                <button className="icon-btn" title="이름 변경" onClick={() => handleRename(img)}>✎</button>
                <button className="icon-btn danger" title="삭제" onClick={() => handleDelete(img)}>×</button>
              </div>
            </div>
          ))}
          {images.length === 0 && <div className="asset-empty">아직 이미지가 없습니다.</div>}
        </div>
      </div>
    </div>
  );
}
