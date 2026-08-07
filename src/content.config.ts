import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    type: z.string().optional(),
    date: z.string().optional(),
    thumbnail: z.string().optional(),
    draft: z.boolean().optional(),
    galleryColumns: z.number().int().min(1).optional(),
    galleryColumnsPrint: z.number().int().min(1).optional(),
    chips: z.array(z.object({
      label: z.string(),
      highlight: z.boolean().optional(),
    })).optional(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = { projects, pages };
