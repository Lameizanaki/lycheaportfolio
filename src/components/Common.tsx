import {
  type ReactNode,
  useState,
  useEffect,
} from "react";
import { useReducedMotion, motion } from "framer-motion";

export type AssetImageProps = {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  tone?: "paper" | "sage" | "blue" | "warm" | "dark";
  fit?: "cover" | "contain";
  loading?: "eager" | "lazy";
  frame?: boolean;
};

export type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
};

export function AssetImage({
  src,
  alt,
  className = "",
  fallbackSrc,
  tone = "paper",
  fit = "cover",
  loading = "lazy",
  frame = true,
}: AssetImageProps) {
  const [failed, setFailed] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setFailed(false);
    setCurrentSrc(src);
  }, [src]);

  const content = (
    <>
      {!failed && (
        <img
          src={currentSrc}
          alt={alt}
          loading={loading}
          decoding="async"
          draggable={false}
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
    </>
  );

  if (!frame) {
    return <div className={className}>{content}</div>;
  }

  return (
    <div
      className={`asset-frame asset-frame--${tone} asset-frame--${fit} ${className}`}
    >
      {content}
    </div>
  );
}

export function Reveal({
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

