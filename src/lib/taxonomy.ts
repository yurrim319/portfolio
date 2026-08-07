import { getVisibleProjects } from './projects';
import type { Project } from '../types/project';

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface TagInfo {
  label: string;
  slug: string;
  highlight: boolean;
  count: number;
}

export async function getAllTags(): Promise<TagInfo[]> {
  const projects = await getVisibleProjects();
  const bySlug = new Map<string, TagInfo>();
  for (const project of projects) {
    for (const chip of project.data.chips ?? []) {
      const slug = slugify(chip.label);
      const existing = bySlug.get(slug);
      if (existing) {
        existing.count++;
        if (chip.highlight) existing.highlight = true;
      } else {
        bySlug.set(slug, { label: chip.label, slug, highlight: !!chip.highlight, count: 1 });
      }
    }
  }
  return Array.from(bySlug.values()).sort((a, b) => b.count - a.count);
}

export async function getProjectsByTagSlug(slug: string): Promise<{ label: string; projects: Project[] }> {
  const projects = await getVisibleProjects();
  const matched = projects.filter(p => (p.data.chips ?? []).some(c => slugify(c.label) === slug));
  const label = matched[0]?.data.chips?.find(c => slugify(c.label) === slug)?.label ?? slug;
  return { label, projects: matched };
}

export interface TypeInfo {
  label: string;
  slug: string;
  count: number;
}

export async function getAllTypes(): Promise<TypeInfo[]> {
  const projects = await getVisibleProjects();
  const bySlug = new Map<string, TypeInfo>();
  for (const project of projects) {
    const type = project.data.type;
    if (!type) continue;
    const slug = slugify(type);
    const existing = bySlug.get(slug);
    if (existing) existing.count++;
    else bySlug.set(slug, { label: type, slug, count: 1 });
  }
  return Array.from(bySlug.values()).sort((a, b) => b.count - a.count);
}

export async function getProjectsByTypeSlug(slug: string): Promise<{ label: string; projects: Project[] }> {
  const projects = await getVisibleProjects();
  const matched = projects.filter(p => p.data.type && slugify(p.data.type) === slug);
  const label = matched[0]?.data.type ?? slug;
  return { label, projects: matched };
}
