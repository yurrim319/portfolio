import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const works = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    type: z.string().optional(),
    date: z.string().optional(),
    chips: z.array(z.object({
      label: z.string(),
      highlight: z.boolean().optional(),
    })).optional(),
  }),
});

export const collections = { works };
