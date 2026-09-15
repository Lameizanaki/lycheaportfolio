import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProject, type Project } from "../lib/api";
import { findCachedProject, upsertCachedProject } from "../lib/projectCache";
import { ProjectForm } from "./ProjectForm";

export function AdminEdit() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(() => (slug ? findCachedProject(slug) : null));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    if (findCachedProject(slug)) return;

    fetchProject(slug)
      .then((data) => {
        setProject(data);
        upsertCachedProject(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load project"));
  }, [slug]);

  if (error) {
    return (
      <div className="admin-shell">
        <p className="admin-error">{error}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="admin-shell">
        <p>Loading…</p>
      </div>
    );
  }

  return <ProjectForm mode="edit" project={project} />;
}
