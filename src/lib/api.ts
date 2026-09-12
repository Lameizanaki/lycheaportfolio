export const MAX_IMAGES_PER_PROJECT = 15;

export type Project = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export type ProjectInput = {
  title: string;
  description: string;
  coverImage: string;
  images: string[];
};

async function parseJson(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? `Request failed with status ${response.status}`);
  }
  return data;
}

export async function fetchProjects(): Promise<Project[]> {
  const response = await fetch("/api/projects");
  const data = await parseJson(response);
  return data.projects;
}

export async function fetchProject(slug: string): Promise<Project> {
  const response = await fetch(`/api/projects/${encodeURIComponent(slug)}`);
  const data = await parseJson(response);
  return data.project;
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
}

export async function logout(): Promise<void> {
  await fetch("/api/admin/logout", { method: "POST" });
}

export async function fetchSession(): Promise<boolean> {
  const response = await fetch("/api/admin/session");
  const data = await parseJson(response);
  return Boolean(data.authenticated);
}
