import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Mail,
  Menu,
  MapPin,
  Phone,
  Send,
  X,
} from "lucide-react";

type NavItem = {
  id: string;
  label: string;
};

type AssetImageProps = {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  tone?: "paper" | "sage" | "blue" | "warm" | "dark";
  fit?: "cover" | "contain";
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
};

type GalleryImage = {
  src: string;
  alt: string;
  label: string;
  kind: "Exterior" | "Render" | "Drawing";
};

type Project = {
  id: string;
  title: string;
  cover: string;
  className: string;
  summary: string;
  gallery?: GalleryImage[];
};

type FormStatus = "idle" | "sending" | "sent" | "error";

const contactEmail = "lycheacheurn@gmail.com";
const contactPhoneDisplay = "+(855) 98729790";
const contactPhoneHref = "+85598729790";
const contactTelegram = "http://T.me/lycheacheurn";

const navItems: NavItem[] = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "portfolio", label: "Projects" },
  { id: "contact", label: "Contact" },
];

const personalSkills = [
  "Problem solving",
  "Communication",
  "Time management",
  "Attention to detail",
];

const workSkills = [
  "Technical detailing",
  "Interior fit-out design",
  "Material calculation",
  "Rendering",
];

const croppedImage = (filename: string) => `/images/cropped/${filename}`;
const uploadedImage = (filename: string) =>
  `/images/${encodeURIComponent(filename)}`;

const projects: Project[] = [
  {
    id: "chipmong",
    title: "01 Chipmong",
    cover: croppedImage("4.png"),
    className: "project-card--left",
    summary: "Master and daughter bedroom detail views and renders.",
    gallery: [
      {
        src: croppedImage("4.png"),
        alt: "Chipmong exterior",
        label: "Exterior reference",
        kind: "Exterior",
      },
      {
        src: croppedImage("8.png"),
        alt: "Chipmong study desk render",
        label: "Study desk",
        kind: "Render",
      },
      {
        src: croppedImage("9.png"),
        alt: "Chipmong wardrobe and vanity render",
        label: "Wardrobe detail",
        kind: "Render",
      },
      {
        src: croppedImage("10.png"),
        alt: "Chipmong master bedroom render",
        label: "Master bedroom",
        kind: "Render",
      },
      {
        src: croppedImage("11.png"),
        alt: "Chipmong TV wall render",
        label: "TV wall",
        kind: "Render",
      },
      {
        src: croppedImage("13.png"),
        alt: "Chipmong daughter bedroom render",
        label: "Daughter bedroom",
        kind: "Render",
      },
      {
        src: croppedImage("14.png"),
        alt: "Chipmong daughter study desk render",
        label: "Daughter study desk",
        kind: "Render",
      },
      {
        src: croppedImage("15.png"),
        alt: "Chipmong pink wardrobe render",
        label: "Pink wardrobe",
        kind: "Render",
      },
      {
        src: croppedImage("16.png"),
        alt: "Chipmong hallway render",
        label: "Bedroom hallway",
        kind: "Render",
      },
    ],
  },
  {
    id: "borey-angkor",
    title: "02 Borey Angkor PP",
    cover: croppedImage("6.png"),
    className: "project-card--right",
    summary: "Bedroom renders, vanity, TV wall, and bath details.",
    gallery: [
      {
        src: croppedImage("6.png"),
        alt: "Borey Angkor exterior",
        label: "Exterior reference",
        kind: "Exterior",
      },
      {
        src: croppedImage("18.png"),
        alt: "Borey Angkor bedroom render",
        label: "Bedroom view",
        kind: "Render",
      },
      {
        src: croppedImage("19.png"),
        alt: "Borey Angkor bed and wardrobe render",
        label: "Wardrobe view",
        kind: "Render",
      },
      {
        src: croppedImage("20.png"),
        alt: "Borey Angkor TV wall render",
        label: "TV wall",
        kind: "Render",
      },
      {
        src: croppedImage("21.png"),
        alt: "Borey Angkor vanity render",
        label: "Vanity",
        kind: "Render",
      },
      {
        src: croppedImage("22.png"),
        alt: "Borey Angkor bedroom elevation render",
        label: "Bedroom elevation",
        kind: "Render",
      },
      {
        src: croppedImage("23.png"),
        alt: "Borey Angkor bedside render",
        label: "Bedside detail",
        kind: "Render",
      },
      {
        src: croppedImage("24.png"),
        alt: "Borey Angkor bathroom render",
        label: "Bathroom",
        kind: "Render",
      },
    ],
  },
  {
    id: "sensok-villa",
    title: "03 Sensok Villa",
    cover: croppedImage("5.png"),
    className: "project-card--center",
    summary: "Living room, hall, and kitchen interior render sets.",
    gallery: [
      {
        src: croppedImage("5.png"),
        alt: "Sensok Villa construction exterior",
        label: "Site reference",
        kind: "Exterior",
      },
      {
        src: croppedImage("26.png"),
        alt: "Sensok Villa living room render",
        label: "Living room",
        kind: "Render",
      },
      {
        src: croppedImage("27.png"),
        alt: "Sensok Villa TV wall render",
        label: "TV wall",
        kind: "Render",
      },
      {
        src: croppedImage("28.png"),
        alt: "Sensok Villa living room cabinet render",
        label: "Cabinet wall",
        kind: "Render",
      },
      {
        src: croppedImage("29.png"),
        alt: "Sensok Villa red cabinet detail render",
        label: "Cabinet detail",
        kind: "Render",
      },
      {
        src: croppedImage("30.png"),
        alt: "Sensok Villa red cabinet elevation render",
        label: "Red cabinet",
        kind: "Render",
      },
      {
        src: croppedImage("32.png"),
        alt: "Sensok Villa hall cabinet render",
        label: "Hall cabinet",
        kind: "Render",
      },
      {
        src: croppedImage("33.png"),
        alt: "Sensok Villa hallway render",
        label: "Hallway",
        kind: "Render",
      },
      {
        src: croppedImage("34.png"),
        alt: "Sensok Villa floral wall render",
        label: "Feature wall",
        kind: "Render",
      },
      {
        src: croppedImage("35.png"),
        alt: "Sensok Villa flower panel render",
        label: "Flower panel",
        kind: "Render",
      },
      {
        src: croppedImage("36.png"),
        alt: "Sensok Villa entry wall render",
        label: "Entry wall",
        kind: "Render",
      },
      {
        src: croppedImage("38.png"),
        alt: "Sensok Villa kitchen render",
        label: "Kitchen view",
        kind: "Render",
      },
      {
        src: croppedImage("39.png"),
        alt: "Sensok Villa kitchen cabinet render",
        label: "Kitchen cabinet",
        kind: "Render",
      },
      {
        src: croppedImage("40.png"),
        alt: "Sensok Villa cooking wall render",
        label: "Cooking wall",
        kind: "Render",
      },
      {
        src: croppedImage("41.png"),
        alt: "Sensok Villa sink counter render",
        label: "Sink counter",
        kind: "Render",
      },
    ],
  },
  {
    id: "technical-drawing",
    title: "04 Technical Drawing",
    cover: croppedImage("7.png"),
    className: "project-card--end",
    summary: "Technical drawing reference.",
  },
];

function useActiveSection(ids: string[]) {
  const [activeId, setActiveId] = useState(ids[0] ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-34% 0px -54% 0px",
        threshold: 0.01,
      },
    );

    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}

function AssetImage({
  src,
  alt,
  className = "",
  fallbackSrc,
  tone = "paper",
  fit = "cover",
}: AssetImageProps) {
  const [failed, setFailed] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setFailed(false);
    setCurrentSrc(src);
  }, [src]);

  return (
    <div
      className={`asset-frame asset-frame--${tone} asset-frame--${fit} ${className}`}
    >
      {!failed && (
        <img
          src={currentSrc}
          alt={alt}
          loading="lazy"
          onError={() => {
            if (fallbackSrc && currentSrc !== fallbackSrc) {
              setCurrentSrc(fallbackSrc);
              return;
            }

            setFailed(true);
          }}
        />
      )}
      {failed && (
        <div className="asset-placeholder" aria-hidden="true">
          <span>{alt}</span>
        </div>
      )}
    </div>
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const initial =
    direction === "left"
      ? { opacity: 0, x: -44, y: 0 }
      : direction === "right"
        ? { opacity: 0, x: 44, y: 0 }
        : { opacity: 0, x: 0, y: 42 };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Header() {
  const sectionIds = useMemo(() => navItems.map((item) => item.id), []);
  const activeId = useActiveSection(sectionIds);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  return (
    <header className={menuOpen ? "site-header is-open" : "site-header"}>
      <a className="mobile-contact-link" href="#contact" onClick={() => setMenuOpen(false)}>
        Contact
      </a>
      <button
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        aria-controls="site-nav"
        onClick={() => setMenuOpen((open) => !open)}
        title={menuOpen ? "Close" : "Menu"}
      >
        {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      <nav id="site-nav" className="site-nav" aria-label="Portfolio sections">
        {navItems.map((item) => (
          <a
            key={item.id}
            className={activeId === item.id ? "is-active" : ""}
            href={`#${item.id}`}
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

function Marquee() {
  const text = "Portfolio presentation";

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {Array.from({ length: 14 }, (_, index) => (
          <span key={index}>{text}</span>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const titleY = useTransform(scrollYProgress, [0, 0.25], [0, reduceMotion ? 0 : -34]);

  return (
    <section id="hero" className="hero-section section-paper">
      <motion.div className="hero-copy" style={{ y: titleY }}>
        <motion.p
          className="section-kicker"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Interior design portfolio
        </motion.p>
        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 34 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <span>2026</span>
          <span>Portfolio.</span>
        </motion.h1>
        <motion.p
          className="hero-name"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.42 }}
        >
          Lychea Cheurn
        </motion.p>
        <a className="arrow-button" href="#about" aria-label="Go to about section" title="About">
          <ArrowRight aria-hidden="true" />
        </a>
      </motion.div>
      <Marquee />
    </section>
  );
}

function About() {
  return (
    <section id="about" className="about-section section-block">
      <div className="about-grid">
        <Reveal className="about-image-wrap" direction="left">
          <AssetImage
            src={croppedImage("2.png")}
            alt="Interior material styling"
            className="about-arch-image"
            tone="sage"
          />
        </Reveal>

        <Reveal className="about-copy" delay={0.08}>
          <h2>About me</h2>
          <p>
            I am an interior designer focused on practical, buildable spaces.
            My work connects cabinet design, technical detailing, material
            selection, and production coordination from the earliest design
            stage.
          </p>
          <p>
            I work closely with clients and builders to translate needs into
            cohesive interior solutions with clear budgets, durable materials,
            and realistic installation planning.
          </p>
          <p>
            The goal is simple: interiors that feel considered, function well,
            and can be executed with confidence.
          </p>
        </Reveal>

        <Reveal className="profile-column" delay={0.16} direction="right">
          <div className="dot-grid" aria-hidden="true" />
          <AssetImage
            src={uploadedImage("Frame 1 (1).png")}
            fallbackSrc={croppedImage("1.png")}
            alt="Lychea portrait"
            className="profile-image"
            tone="sage"
          />
          <blockquote>
            "Design is where an idea meets practical execution."
          </blockquote>
        </Reveal>
      </div>
    </section>
  );
}

function SkillList({ items }: { items: string[] }) {
  return (
    <ul className="skill-list">
      {items.map((item) => (
        <li key={item}>
          <ArrowRight aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Skills() {
  return (
    <section id="skills" className="skills-section">
      <div className="personal-skills section-block">
        <Reveal className="personal-copy" direction="left">
          <SkillList items={personalSkills} />
          <h2>Personal skills</h2>
        </Reveal>
        <Reveal className="personal-image" delay={0.12} direction="right">
          <AssetImage
            src={croppedImage("3.png")}
            alt="Material and color selection"
            className="wide-image"
            tone="blue"
          />
        </Reveal>
      </div>

      <div className="work-skills section-block">
        <Reveal className="work-media" direction="left">
          <h2>Work skills</h2>
          <div className="work-image-row">
            <AssetImage
              src={croppedImage("2.png")}
              alt="Interior materials"
              className="work-image-large"
              tone="warm"
            />
            <AssetImage
              src={croppedImage("7.png")}
              alt="Interior technical drawing"
              className="work-image-small"
              tone="paper"
            />
          </div>
        </Reveal>

        <Reveal className="work-copy" delay={0.14} direction="right">
          <SkillList items={workSkills} />
          <a className="arrow-button arrow-button--small" href="#portfolio" aria-label="Go to portfolio" title="Portfolio">
            <ArrowRight aria-hidden="true" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

function Portfolio({ onOpenProject }: { onOpenProject: (project: Project) => void }) {
  return (
    <section id="portfolio" className="portfolio-section section-block">
      <Reveal className="portfolio-heading">
        <h2>Content</h2>
      </Reveal>

      <div className="portfolio-grid">
        {projects.map((project, index) => {
          const hasModal = Boolean(project.gallery?.length);

          return (
            <Reveal
              key={project.id}
              className={`project-card ${project.className}`}
              delay={index * 0.06}
            >
              {hasModal ? (
                <motion.button
                  className="project-open"
                  type="button"
                  onClick={() => onOpenProject(project)}
                  whileHover={{ y: -8 }}
                  whileTap={{ scale: 0.985 }}
                  aria-label={`Open ${project.title} gallery`}
                >
                  <AssetImage
                    src={project.cover}
                    alt={project.title}
                    className="project-image"
                    tone={index % 2 === 0 ? "sage" : "paper"}
                  />
                  <span className="project-hover" aria-hidden="true">
                    <ArrowUpRight />
                  </span>
                </motion.button>
              ) : (
                <motion.div className="project-static" whileHover={{ y: -4 }}>
                  <AssetImage
                    src={project.cover}
                    alt={project.title}
                    className="project-image"
                    tone={index % 2 === 0 ? "sage" : "paper"}
                  />
                </motion.div>
              )}
              <h3>{project.title}</h3>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function PortfolioModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setSelectedIndex(0);
  }, [project?.id]);

  useEffect(() => {
    if (!project?.gallery?.length) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const galleryLength = project.gallery.length;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
      if (event.key === "ArrowRight") {
        setSelectedIndex((current) => (current + 1) % galleryLength);
      }
      if (event.key === "ArrowLeft") {
        setSelectedIndex(
          (current) => (current - 1 + galleryLength) % galleryLength,
        );
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  if (!project?.gallery?.length) {
    return null;
  }

  const gallery = project.gallery;
  const activeImage = gallery[selectedIndex];
  const galleryLength = gallery.length;

  function showPrevious() {
    setSelectedIndex(
      (current) => (current - 1 + galleryLength) % galleryLength,
    );
  }

  function showNext() {
    setSelectedIndex((current) => (current + 1) % galleryLength);
  }

  return (
    <motion.div
      className="modal-backdrop"
      role="presentation"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={reduceMotion ? undefined : { opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.22 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.section
        className="project-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        initial={reduceMotion ? false : { opacity: 0, y: 26, scale: 0.98 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="modal-header">
          <div>
            <span>{activeImage.kind}</span>
            <h2 id="project-modal-title">{project.title}</h2>
            <p>{project.summary}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close gallery" title="Close">
            <X aria-hidden="true" />
          </button>
        </div>

        <div className="modal-stage">
          <button
            className="modal-arrow modal-arrow--prev"
            type="button"
            onClick={showPrevious}
            aria-label="Previous image"
            title="Previous"
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeImage.src}
              className="modal-main-image"
              initial={reduceMotion ? false : { opacity: 0, x: 24 }}
              animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: -24 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <AssetImage
                src={activeImage.src}
                alt={activeImage.alt}
                tone="paper"
                fit="contain"
              />
            </motion.div>
          </AnimatePresence>
          <button
            className="modal-arrow modal-arrow--next"
            type="button"
            onClick={showNext}
            aria-label="Next image"
            title="Next"
          >
            <ChevronRight aria-hidden="true" />
          </button>
        </div>

        <div className="modal-footer">
          <p>{activeImage.label}</p>
          <div className="modal-counter">
            {selectedIndex + 1}/{gallery.length}
          </div>
        </div>

        <div className="modal-thumbs" aria-label={`${project.title} images`}>
          {gallery.map((image, index) => (
            <button
              key={`${image.src}-${image.label}`}
              className={index === selectedIndex ? "is-active" : ""}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`Show ${image.label}`}
            >
              <AssetImage src={image.src} alt="" fit="cover" />
            </button>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}

function Contact() {
  const [status, setStatus] = useState<FormStatus>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          message: formData.get("message"),
        }),
      });

      if (!response.ok) {
        throw new Error("Message request failed");
      }

      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="contact-section section-block">
      <Reveal className="contact-heading">
        <h2>Contact</h2>
      </Reveal>

      <Reveal className="contact-layout" delay={0.1}>
        <div className="contact-copy">
          <p>
            Interior design, fit-out coordination, technical drawings, material
            selection, and realistic execution planning.
          </p>
          <div className="contact-links">
            <a href={`mailto:${contactEmail}`}>
              <Mail aria-hidden="true" />
              {contactEmail}
            </a>
            <a href={`tel:${contactPhoneHref}`}>
              <Phone aria-hidden="true" />
              {contactPhoneDisplay}
            </a>
            <a href={contactTelegram} target="_blank" rel="noreferrer">
              <Send aria-hidden="true" />
              Telegram
            </a>
            <span>
              <MapPin aria-hidden="true" />
              Phnom Penh, Cambodia
            </span>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            <span>Name</span>
            <input name="name" autoComplete="name" required />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            <span>Phone</span>
            <input name="phone" type="tel" autoComplete="tel" />
          </label>
          <label>
            <span>Message</span>
            <textarea name="message" rows={5} required />
          </label>
          <button type="submit" disabled={status === "sending"}>
            <Send aria-hidden="true" />
            {status === "sending" ? "Sending" : "Send message"}
          </button>
          <p className="form-status" aria-live="polite">
            {status === "sent" && "Message sent."}
            {status === "error" && "Message could not be sent."}
          </p>
        </form>
      </Reveal>
      <Marquee />
    </section>
  );
}

export default function App() {
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  return (
    <div className="site-shell">
      <Header />
      <main>
        <Hero />
        <About />
        <Skills />
        <Portfolio onOpenProject={setActiveProject} />
        <Contact />
      </main>
      <AnimatePresence>
        {activeProject && (
          <PortfolioModal
            project={activeProject}
            onClose={() => setActiveProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
