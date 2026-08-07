import { useMemo, type CSSProperties } from 'react';
import { marked } from 'marked';
import YAML from 'yaml';
import '../../../../src/styles/theme.css';
import '../../../../src/styles/mdx-content.css';

interface Props {
  content: string;
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export default function Preview({ content }: Props) {
  const { html, galleryColumns } = useMemo(() => {
    const m = content.match(FRONTMATTER_RE);
    const body = m ? content.slice(m[0].length) : content;
    let galleryColumns: number | undefined;
    if (m) {
      try {
        const data = YAML.parse(m[1]) as Record<string, unknown> | null;
        if (typeof data?.galleryColumns === 'number') galleryColumns = data.galleryColumns;
      } catch {
        // frontmatter 파싱 오류는 무시하고 기본 열 수로 미리보기
      }
    }
    return { html: marked.parse(body, { async: false }) as string, galleryColumns };
  }, [content]);

  return (
    <div className="preview">
      <div className="preview-label">preview</div>
      <div
        className="mdx-content preview-body"
        style={galleryColumns ? ({ '--gallery-columns': galleryColumns } as CSSProperties) : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
