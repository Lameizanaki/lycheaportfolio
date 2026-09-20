import { useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createProject, updateProject, MAX_IMAGES_PER_PROJECT, type Project } from "../lib/api";
import { upsertCachedProject } from "../lib/projectCache";
import { uploadCoverImage, uploadGalleryImage } from "../lib/upload";
import "./admin.css";

type StagedImage = {
  id: string;
  previewUrl: string;
  status: "uploading" | "done" | "error";
  url?: string;
  thumbnailUrl?: string | null;
};

type ProjectFormProps = {
  mode: "create" | "edit";
  project?: Project;
};

export function ProjectForm({ mode, project }: ProjectFormProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [cover, setCover] = useState<StagedImage | null>(
    project
      ? {
          id: "existing-cover",
          previewUrl: project.coverThumbnail ?? project.coverImage,
          status: "done",
          url: project.coverImage,
          thumbnailUrl: project.coverThumbnail,
        }
      : null,
  );
  const [images, setImages] = useState<StagedImage[]>(
    project?.images.map((url, index) => ({ id: `existing-${index}`, previewUrl: url, status: "done" as const, url })) ??
      [],
  );

  const coverInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  const remainingSlots = Math.max(0, MAX_IMAGES_PER_PROJECT - images.length);
  const isUploading = cover?.status === "uploading" || images.some((image) => image.status === "uploading");

  async function handleCoverSelected(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setCover({ id: "cover", previewUrl, status: "uploading" });

    try {
      const { url, thumbnailUrl } = await uploadCoverImage(file);
      setCover({ id: "cover", previewUrl, status: "done", url, thumbnailUrl });
    } catch {
      setCover({ id: "cover", previewUrl, status: "error" });
    }
  }

  async function handleImagesSelected(fileList: FileList | null) {
    if (!fileList || remainingSlots === 0) return;
    const files = Array.from(fileList).slice(0, remainingSlots);

    for (const file of files) {
      const id = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(file);
      setImages((previous) => [...previous, { id, previewUrl, status: "uploading" }]);

      try {
        const url = await uploadGalleryImage(file);
        setImages((previous) =>
          previous.map((image) => (image.id === id ? { ...image, status: "done", url } : image)),
        );
      } catch {
        setImages((previous) =>
          previous.map((image) => (image.id === id ? { ...image, status: "error" } : image)),
        );
      }
    }
  }

  function removeImage(id: string) {
    setImages((previous) => previous.filter((image) => image.id !== id));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!cover?.url) {
      setError("Please upload a cover image.");
      return;
    }

    const imageUrls = images
      .filter((image) => image.status === "done" && image.url)
      .map((image) => image.url!);

    setSubmitting(true);
    try {
      const input = {
        title,
        description,
        coverImage: cover.url,
        coverThumbnail: cover.thumbnailUrl ?? null,
        images: imageUrls,
      };
      let savedProject: Project;
      if (mode === "create") {
        savedProject = await createProject(input);
      } else if (project) {
        savedProject = await updateProject(project.slug, input);
      } else {
        return;
      }
      upsertCachedProject(savedProject);
      navigate("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="admin-shell">
      <Link className="admin-back-link" to="/admin">
        <ArrowLeft aria-hidden="true" size={16} />
        Back to projects
      </Link>
      <form className="admin-card admin-project-form" onSubmit={handleSubmit}>
        <h1>{mode === "create" ? "Add project" : "Edit project"}</h1>

        <label>
          <span>Title</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>

        <label>
          <span>Description</span>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} required />
        </label>

        <div className="admin-field">
          <span className="admin-field-label">Cover image</span>
          <div className="admin-image-grid admin-image-grid--single">
            {cover ? (
              <div className="admin-image-tile">
                <img
                  className={cover.status === "uploading" ? "is-uploading" : ""}
                  src={cover.previewUrl}
                  alt=""
                  decoding="async"
                />
                {cover.status === "uploading" ? <span className="admin-spinner" /> : null}
                {cover.status === "error" ? <span className="admin-tile-error">Failed</span> : null}
                <button
                  className="admin-remove-button"
                  type="button"
                  onClick={() => setCover(null)}
                  aria-label="Remove cover image"
                >
                  ×
                </button>
              </div>
            ) : (
              <button className="admin-add-tile" type="button" onClick={() => coverInputRef.current?.click()}>
                <span>+</span>
                Add
              </button>
            )}
            <input
              ref={coverInputRef}
              className="admin-hidden-input"
              type="file"
              accept="image/*"
              onChange={(event) => {
                handleCoverSelected(event.target.files);
                event.target.value = "";
              }}
            />
          </div>
        </div>

        <div className="admin-field">
          <div className="admin-field-header">
            <span className="admin-field-label">Images</span>
            <span className="admin-field-count">
              {images.length} / {MAX_IMAGES_PER_PROJECT}
            </span>
          </div>
          <div className="admin-image-grid">
            {images.map((image) => (
              <div className="admin-image-tile" key={image.id}>
                <img
                  className={image.status === "uploading" ? "is-uploading" : ""}
                  src={image.previewUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                {image.status === "uploading" ? <span className="admin-spinner" /> : null}
                {image.status === "error" ? <span className="admin-tile-error">Failed</span> : null}
                <button
                  className="admin-remove-button"
                  type="button"
                  onClick={() => removeImage(image.id)}
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
            {remainingSlots > 0 ? (
              <button className="admin-add-tile" type="button" onClick={() => imagesInputRef.current?.click()}>
                <span>+</span>
                Add
              </button>
            ) : null}
            <input
              ref={imagesInputRef}
              className="admin-hidden-input"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                handleImagesSelected(event.target.files);
                event.target.value = "";
              }}
            />
          </div>
          <p className="admin-hint">Up to {MAX_IMAGES_PER_PROJECT} images.</p>
        </div>

        {error ? <p className="admin-error">{error}</p> : null}

        <div className="admin-form-actions">
          <button type="submit" disabled={submitting || isUploading}>
            {isUploading ? "Uploading…" : submitting ? "Saving…" : mode === "create" ? "Create project" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
