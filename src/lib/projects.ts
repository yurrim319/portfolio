import { getCollection } from 'astro:content';
import type { Project } from '../types/project';

export async function getVisibleProjects(): Promise<Project[]> {
  return getCollection('projects', ({ data }) => !data.draft);
}

export async function getSortedProjects(): Promise<Project[]> {
  const projects = await getVisibleProjects();
  return projects.sort((a, b) => (b.data.date ?? '').localeCompare(a.data.date ?? ''));
}
