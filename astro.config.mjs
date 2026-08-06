import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';
import { unified } from '@astrojs/markdown-remark';
import { visit } from 'unist-util-visit';

const base = '/portfolio';

// Portfolio Author(로컬 콘텐츠 저작 도구)는 base 경로를 모른 채
// "/images/..." 형태의 절대경로만 마크다운 본문에 저장한다.
// 컴포넌트를 거치지 않는 순수 마크다운 이미지라 여기서 직접 base를 붙여준다.
function remarkBaseImages() {
  return tree => {
    visit(tree, 'image', node => {
      if (node.url && node.url.startsWith('/') && !node.url.startsWith(`${base}/`)) {
        node.url = base + node.url;
      }
    });
  };
}

export default defineConfig({
  site: 'https://yurrim319.github.io',
  base,
  integrations: [mdx()],
  markdown: {
    processor: unified({ remarkPlugins: [remarkBaseImages] }),
  },
});
