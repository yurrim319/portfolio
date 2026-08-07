import { useMemo, useState } from 'react';
import YAML from 'yaml';
import type { Collection, ImageAsset } from '../types';
import AssetManager from './AssetManager';

interface Props {
  content: string;
  collection: Collection;
  projectSlug: string | null;
  onChange: (newContent: string) => void;
}

interface Chip {
  label?: string;
  highlight?: boolean;
}

const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

const KNOWN_PRESETS = ['lut-strip', 'bloom-radial'];

// ProjectCard.astro와 동일한 규칙으로 정규화한다: "/images/..."는 그대로,
// 파일명만 있으면 현재 프로젝트 폴더 안의 이미지로 간주한다.
function resolveThumbnailPreview(value: unknown, projectSlug: string | null): string | null {
  if (typeof value !== 'string' || !value || KNOWN_PRESETS.includes(value)) return null;
  if (value.startsWith('/images/')) return value;
  return projectSlug ? `/images/${projectSlug}/${value}` : null;
}

export default function FrontmatterPanel({ content, collection, projectSlug, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const parsed = useMemo(() => {
    const m = content.match(FM_RE);
    if (!m) return { block: null as string | null, data: {} as Record<string, unknown>, error: null as string | null };
    try {
      return { block: m[0], data: (YAML.parse(m[1]) ?? {}) as Record<string, unknown>, error: null };
    } catch (err) {
      return { block: m[0], data: {} as Record<string, unknown>, error: (err as Error).message };
    }
  }, [content]);

  function update(patch: Record<string, unknown>) {
    const nextData: Record<string, unknown> = { ...parsed.data, ...patch };
    for (const key of Object.keys(nextData)) {
      if (nextData[key] === undefined) delete nextData[key];
    }
    const yamlText = YAML.stringify(nextData);
    const nextBlock = `---\n${yamlText}---\n`;
    const nextContent = parsed.block ? content.replace(FM_RE, nextBlock) : nextBlock + content;
    onChange(nextContent);
  }

  function updateChip(index: number, patch: Partial<Chip>) {
    const chips: Chip[] = Array.isArray(parsed.data.chips) ? (parsed.data.chips as Chip[]).map(c => ({ ...c })) : [];
    const next = { ...chips[index], ...patch };
    if (!next.highlight) delete next.highlight;
    chips[index] = next;
    update({ chips });
  }

  function addChip() {
    const chips: Chip[] = Array.isArray(parsed.data.chips) ? [...(parsed.data.chips as Chip[]), { label: '' }] : [{ label: '' }];
    update({ chips });
  }

  function removeChip(index: number) {
    const chips: Chip[] = Array.isArray(parsed.data.chips) ? (parsed.data.chips as Chip[]).filter((_, i) => i !== index) : [];
    update({ chips });
  }

  if (parsed.error) {
    return (
      <div className="frontmatter">
        <div className="frontmatter-error">frontmatter 파싱 오류 — 에디터에서 직접 고쳐주세요: {parsed.error}</div>
      </div>
    );
  }

  const data = parsed.data;
  const chips: Chip[] = Array.isArray(data.chips) ? (data.chips as Chip[]) : [];
  const thumbnailPreview = resolveThumbnailPreview(data.thumbnail, projectSlug);

  return (
    <div className="frontmatter">
      <div className="frontmatter-header">
        <span>metadata</span>
      </div>
      <div className="frontmatter-body">
          <label className="fm-field">
            <span>title</span>
            <input value={(data.title as string) ?? ''} onChange={e => update({ title: e.target.value })} />
          </label>

          {collection === 'projects' && (
            <>
              <label className="fm-field">
                <span>subtitle</span>
                <textarea
                  rows={2}
                  value={(data.subtitle as string) ?? ''}
                  onChange={e => update({ subtitle: e.target.value })}
                />
              </label>
              <div className="fm-row">
                <label className="fm-field">
                  <span>type</span>
                  <input value={(data.type as string) ?? ''} onChange={e => update({ type: e.target.value })} />
                </label>
                <label className="fm-field">
                  <span>date</span>
                  <input
                    value={(data.date as string) ?? ''}
                    onChange={e => update({ date: e.target.value })}
                    placeholder="2026.06"
                  />
                </label>
              </div>
              <label className="fm-field">
                <span>thumbnail</span>
                <div className="fm-thumb-row">
                  <input
                    value={(data.thumbnail as string) ?? ''}
                    onChange={e => update({ thumbnail: e.target.value || undefined })}
                    placeholder="lut-strip 등 프리셋 키, 또는 이미지 선택 →"
                  />
                  {projectSlug && (
                    <button type="button" className="toggle-btn" onClick={() => setPickerOpen(true)}>
                      이미지 선택
                    </button>
                  )}
                </div>
                {thumbnailPreview && (
                  <img src={thumbnailPreview} alt="" className="fm-thumb-preview" />
                )}
              </label>
              <label className="fm-checkbox">
                <input
                  type="checkbox"
                  checked={!!data.draft}
                  onChange={e => update({ draft: e.target.checked ? true : undefined })}
                />
                <span>draft (목록/라우팅에서 숨김)</span>
              </label>
              <div className="fm-chips">
                <div className="fm-chips-header">
                  <span>chips</span>
                  <button className="icon-btn" onClick={addChip}>+</button>
                </div>
                {chips.map((chip, i) => (
                  <div className="fm-chip-row" key={i}>
                    <input
                      value={chip.label ?? ''}
                      onChange={e => updateChip(i, { label: e.target.value })}
                      placeholder="label"
                    />
                    <label className="fm-chip-hi">
                      <input
                        type="checkbox"
                        checked={!!chip.highlight}
                        onChange={e => updateChip(i, { highlight: e.target.checked })}
                      />
                      hi
                    </label>
                    <button className="icon-btn danger" onClick={() => removeChip(i)}>×</button>
                  </div>
                ))}
              </div>
              <div className="fm-row">
                <label className="fm-field">
                  <span>갤러리 한 줄당 이미지 수 · 웹</span>
                  <input
                    type="number"
                    min={1}
                    value={(data.galleryColumns as number) ?? ''}
                    onChange={e => update({ galleryColumns: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="2"
                  />
                </label>
                <label className="fm-field">
                  <span>갤러리 한 줄당 이미지 수 · PDF</span>
                  <input
                    type="number"
                    min={1}
                    value={(data.galleryColumnsPrint as number) ?? ''}
                    onChange={e => update({ galleryColumnsPrint: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="2"
                  />
                </label>
              </div>
            </>
          )}

          {collection === 'pages' && (
            <label className="fm-field">
              <span>description</span>
              <input
                value={(data.description as string) ?? ''}
                onChange={e => update({ description: e.target.value })}
              />
            </label>
          )}
      </div>
      {pickerOpen && projectSlug && (
        <AssetManager
          projectSlug={projectSlug}
          onClose={() => setPickerOpen(false)}
          selectLabel="썸네일로 지정"
          onSelect={(img: ImageAsset) => {
            update({ thumbnail: img.url });
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}
