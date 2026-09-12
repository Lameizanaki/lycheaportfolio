import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteProject, fetchProjects, logout, type Project } from "../lib/api";
import "./admin.css";

export function AdminDashboard() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects()
      .then(setProjects)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load projects"));
  }, []);

  async function handleDelete(slug: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      await deleteProject(slug);
      setProjects((current) => current?.filter((project) => project.slug !== slug) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/admin/login");
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <h1>Projects</h1>
        <div className="admin-topbar-actions">
          <Link className="admin-button" to="/admin/new">
            + Add project
          </Link>
          <button className="admin-button admin-button--ghost" type="button" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      {error ? <p className="admin-error">{error}</p> : null}

      {!projects ? (
        <p>Loading…</p>
      ) : projects.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        <ul className="admin-project-list">
          {projects.map((project) => (
            <li key={project.id} className="admin-project-row">
              <img src={project.coverImage} alt="" />
              <div className="admin-project-info">
                <h2>{project.title}</h2>
                <p>
                  {project.images.length} image{project.images.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="admin-project-actions">
                <Link className="admin-button admin-button--small" to={`/admin/edit/${project.slug}`}>
                  Edit
                </Link>
                <button
                  className="admin-button admin-button--small admin-button--danger"
                  type="button"
                  onClick={() => handleDelete(project.slug, project.title)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
