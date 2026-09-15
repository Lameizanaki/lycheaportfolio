import { setAdminSessionHint } from "./adminSession";

export const MAX_IMAGES_PER_PROJECT = 15;

let sessionRequest: Promise<boolean> | null = null;
const projectListRequests = new Map<string, Promise<Project[]>>();
const projectRequests = new Map<string, Promise<Project>>();

export type Project = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  coverThumbnail: string | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export type ProjectInput = {
  title: string;
  description: string;
  coverImage: string;
  coverThumbnail: string | null;
  images: string[];
};

async function parseJson(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed with status ${response.status}`);
  }
  return data;
}

export function fetchProjects({ fresh = false }: { fresh?: boolean } = {}): Promise<Project[]> {
  const requestKey = fresh ? "fresh" : "public";
  const existingRequest = projectListRequests.get(requestKey);
  if (existingRequest) return existingRequest;

  const request = fetch(fresh ? "/api/projects?fresh=1" : "/api/projects", {
    cache: fresh ? "no-store" : "default",
  })
    .then(parseJson)
    .then((data) => data.projects as Project[])
    .finally(() => projectListRequests.delete(requestKey));

  projectListRequests.set(requestKey, request);
  return request;
}

export function fetchProject(slug: string): Promise<Project> {
  const existingRequest = projectRequests.get(slug);
  if (existingRequest) return existingRequest;

  const request = fetch(`/api/projects/${encodeURIComponent(slug)}`)
    .then(parseJson)
    .then((data) => data.project as Project)
    .finally(() => projectRequests.delete(slug));

  projectRequests.set(slug, request);
  return request;
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJson(response);
  return data.project;
}

export async function updateProject(slug: string, input: ProjectInput): Promise<Project> {
  const response = await fetch(`/api/projects/${encodeURIComponent(slug)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJson(response);
  return data.project;
}

export async function deleteProject(slug: string): Promise<void> {
  const response = await fetch(`/api/projects/${encodeURIComponent(slug)}`, { method: "DELETE" });
  await parseJson(response);
}

export async function login(password: string): Promise<void> {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  await parseJson(response);
  setAdminSessionHint(true);
}

export async function logout(): Promise<void> {
  setAdminSessionHint(false);
  await fetch("/api/admin/logout", { method: "POST" });
}

export async function fetchSession(): Promise<boolean> {
  if (sessionRequest) return sessionRequest;

  sessionRequest = fetch("/api/admin/session", { cache: "no-store" })
    .then(parseJson)
    .then((data) => {
      const authenticated = Boolean(data.authenticated);
      setAdminSessionHint(authenticated);
      return authenticated;
    })
    .finally(() => {
      sessionRequest = null;
    });

  return sessionRequest;
}
