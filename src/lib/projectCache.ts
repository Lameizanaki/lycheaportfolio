import type { Project } from "./api";

const PROJECTS_CACHE_KEY = "lychea-projects-v1";

export function readCachedProjects(): Project[] {
  try {
    const cached = window.localStorage.getItem(PROJECTS_CACHE_KEY);
    const projects = cached ? JSON.parse(cached) : null;
    return Array.isArray(projects) ? projects : [];
  } catch {
    return [];
  }
}

export function writeCachedProjects(projects: Project[]) {
  try {
    window.localStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(projects));
  } catch {
    // Storage can be unavailable in private browsing; network data still works.
  }
}

export function findCachedProject(slug: string) {
  return readCachedProjects().find((project) => project.slug === slug) ?? null;
}

export function upsertCachedProject(project: Project) {
  const projects = readCachedProjects();
  const existingIndex = projects.findIndex((item) => item.id === project.id);

  if (existingIndex === -1) {
    writeCachedProjects([project, ...projects]);
    return;
  }

  projects[existingIndex] = project;
  writeCachedProjects(projects);
}

export function removeCachedProject(slug: string) {
  writeCachedProjects(readCachedProjects().filter((project) => project.slug !== slug));
}
