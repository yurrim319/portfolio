import { useMemo } from 'react';
import { marked } from 'marked';
import '../../../../src/styles/theme.css';
import '../../../../src/styles/mdx-content.css';

interface Props {
  content: string;
}

const FRONTMATTER_RE = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/;

export default function Preview({ content }: Props) {
  const html = useMemo(() => {
    const body = content.replace(FRONTMATTER_RE, '');
    return marked.parse(body, { async: false }) as string;
  }, [content]);

  return (
    <div className="preview">
      <div className="preview-label">preview</div>
      <div className="mdx-content preview-body" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
