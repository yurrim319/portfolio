import { defineConfig } from 'astro/config';

import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://yurrim319.github.io',
  base: '/portfolio',
  integrations: [mdx()],
});