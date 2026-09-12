import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProject, type Project } from "../lib/api";
import { ProjectForm } from "./ProjectForm";

export function AdminEdit() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    fetchProject(slug)
      .then(setProject)
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
