import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchProject, fetchProjects, type Project } from "./lib/api";
import { findCachedProject } from "./lib/projectCache";
import { AssetImage, Reveal, getProjectCardImage } from "./components/Common";

type GalleryImage = {
  src: string;
  alt: string;
  label: string;
};

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  // Immediately initialize from cache so there is zero delay/skeleton flicker
  const [project, setProject] = useState<Project | null>(() => slug ? findCachedProject(slug) : null);
  const [loading, setLoading] = useState(() => !project);
  const [error, setError] = useState<string | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    // Check if already in cache
    const cached = findCachedProject(slug);
    if (cached) {
      setProject(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);

    fetchProject(slug)
      .then((data) => {
        if (!cancelled && data) {
          setProject(data);
          setSelectedIndex(0);
        }
      })
      .catch((err) => {
        if (!cancelled && !cached) {
          setError(err?.message || "Failed to load project details.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    fetchProjects()
      .then((list) => {
        if (!cancelled && Array.isArray(list)) {
          setAllProjects(list);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const gallery: GalleryImage[] = useMemo(() => {
    if (!project) return [];
    // If project has specific images array, use it; if empty, fallback to cover image
    const imgs = project.images && project.images.length > 0 ? project.images : (project.coverImage ? [project.coverImage] : []);
    return imgs.map((src, index) => ({
      src,
      alt: `${project.title || "Project"} photo ${index + 1}`,
      label: `Image ${index + 1}`,
    }));
  }, [project]);

  const galleryLength = gallery.length;

  function showPrevious() {
    if (!galleryLength) return;
    setSelectedIndex((current) => (current - 1 + galleryLength) % galleryLength);
  }

  function showNext() {
    if (!galleryLength) return;
    setSelectedIndex((current) => (current + 1) % galleryLength);
  }

  useEffect(() => {
    if (!galleryLength) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        showNext();
      }
      if (event.key === "ArrowLeft") {
        showPrevious();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [galleryLength]);

  // Next project navigation
  const nextProject = useMemo(() => {
    const list = allProjects ?? [];
    if (!list.length || !project) return null;
    const currentIndex = list.findIndex((p) => p.slug === project.slug);
    if (currentIndex === -1) return null;
    const nextIdx = (currentIndex + 1) % list.length;
    return list[nextIdx];
  }, [allProjects, project]);

  const activeImage = gallery[selectedIndex];

  return (
    <div className="project-detail-page">
      <main className="project-detail-main">
        {loading && (
          <div className="project-detail-loading">
            <div className="project-skeleton-hero" />
            <div className="project-skeleton-text" />
          </div>
        )}

        {error && (
          <div className="project-detail-error">
            <h2>Project Not Found</h2>
            <p>{error}</p>
            <Link to="/#portfolio" className="arrow-button">
              Return to Projects
            </Link>
          </div>
        )}

        {!loading && project && (
          <>
            {/* Hero Section with overlay Back button */}
            <section className="project-detail-hero">
              <div className="project-detail-hero-frame">
                <Link to="/#portfolio" className="project-detail-back-overlay" aria-label="Back to projects">
                  <ArrowLeft aria-hidden="true" />
                  <span>Back to Projects</span>
                </Link>
                <AssetImage
                  src={getProjectCardImage(project)}
                  fallbackSrc={project.coverImage}
                  alt={project.title}
                  tone="paper"
                  fit="cover"
                  loading="eager"
                  className="project-detail-hero-img"
                />
                <div className="project-detail-hero-gradient" />
                <div className="project-detail-hero-title-wrap">
                  <h1 className="project-detail-hero-title">{project.title}</h1>
                </div>
              </div>
            </section>

            {/* Content & Metadata Section */}
            <section className="project-detail-info section-block">
              <Reveal className="project-detail-info-grid">
                <div className="project-detail-desc-col">
                  <h2 className="project-detail-subtitle">About Project</h2>
                  <p className="project-detail-desc">{project.description}</p>
                </div>

                <div className="project-detail-meta-col">
                  <div className="project-detail-meta-item">
                    <span className="project-detail-meta-label">Project</span>
                    <span className="project-detail-meta-val">{project.title}</span>
                  </div>
                  {project.createdAt && (
                    <div className="project-detail-meta-item">
                      <span className="project-detail-meta-label">Date</span>
                      <span className="project-detail-meta-val">
                        {new Date(project.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </Reveal>
            </section>

            {/* Gallery Carousel */}
            {gallery.length > 0 && activeImage && (
              <section className="project-detail-carousel-section section-block">
                <div className="project-carousel-container">
                  <div className="project-carousel-stage">
                    {gallery.length > 1 && (
                      <button
                        className="modal-arrow modal-arrow--prev"
                        type="button"
                        onClick={showPrevious}
                        aria-label="Previous image"
                        title="Previous"
                      >
                        <ChevronLeft aria-hidden="true" />
                      </button>
                    )}

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeImage.src}
                        className="project-carousel-main-image"
                        style={{ touchAction: "pan-y" }}
                        initial={reduceMotion ? false : { opacity: 0, x: 20 }}
                        animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, x: -20 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        drag={galleryLength > 1 ? "x" : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.7}
                        dragMomentum={false}
                        onDragEnd={(_event, info) => {
                          const swipeThreshold = 50;
                          const swipeVelocity = 400;
                          if (info.offset.x < -swipeThreshold || info.velocity.x < -swipeVelocity) {
                            showNext();
                          } else if (info.offset.x > swipeThreshold || info.velocity.x > swipeVelocity) {
                            showPrevious();
                          }
                        }}
                      >
                        <AssetImage
                          src={activeImage.src}
                          alt={activeImage.alt}
                          tone="paper"
                          fit="contain"
                          className="project-carousel-img"
                        />
                      </motion.div>
                    </AnimatePresence>

                    {gallery.length > 1 && (
                      <button
                        className="modal-arrow modal-arrow--next"
                        type="button"
                        onClick={showNext}
                        aria-label="Next image"
                        title="Next"
                      >
                        <ChevronRight aria-hidden="true" />
                      </button>
                    )}
                  </div>

                  <div className="project-carousel-footer">
                    <span className="project-carousel-caption">{activeImage.label}</span>
                    <span className="project-carousel-counter">
                      {String(selectedIndex + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
                    </span>
                  </div>

                  {gallery.length > 1 && (
                    <div className="project-carousel-thumbs" aria-label="Project images thumbnails">
                      {gallery.map((image, index) => (
                        <button
                          key={`${image.src}-${index}`}
                          className={index === selectedIndex ? "is-active" : ""}
                          type="button"
                          onClick={() => setSelectedIndex(index)}
                          aria-label={`Show ${image.label}`}
                        >
                          <AssetImage src={image.src} alt="" fit="cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Next Project Footer */}
            {nextProject && (
              <div className="project-detail-next-section">
                <Link to={`/projects/${nextProject.slug}`} className="project-next-link">
                  <span className="project-next-sub">Next Project</span>
                  <span className="project-next-title">
                    {nextProject.title} →
                  </span>
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

