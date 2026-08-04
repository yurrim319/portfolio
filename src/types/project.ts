import type { CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

export type Chip = {
  label: string;
  highlight?: boolean;
};
