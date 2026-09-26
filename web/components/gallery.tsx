"use client";
import { useEffect, useRef, useState } from "react";
import type { Project, Locale } from "../lib/project";
export function Gallery({
  project,
  locale,
}: {
  project: Project;
  locale: Locale;
}) {
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const lastButton = useRef<HTMLButtonElement | null>(null);
  const images = project.images;
  const current = images[index];
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    const close = () => {
      document.body.style.overflow = "";
      lastButton.current?.focus();
    };
    el.addEventListener("close", close);
    return () => {
      el.removeEventListener("close", close);
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <section className="proj-gallery">
      <div className="container">
        <h2>{locale === "en" ? "Gallery" : "空間影像"}</h2>
        <div className="gallery-divider" />
        <div className="gallery-grid">
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              className={`gallery-item${image.kind === "plan" ? " gallery-plan" : ""}`}
              aria-label={`${locale === "en" ? "Enlarge" : "放大"} ${image.alt[locale]}`}
              onClick={(e) => {
                lastButton.current = e.currentTarget;
                setIndex(i);
                dialog.current?.showModal();
                document.body.style.overflow = "hidden";
              }}
            >
              <img src={image.src} alt={image.alt[locale]} loading="lazy" />
            </button>
          ))}
        </div>
      </div>
      <dialog
        className="gallery-dialog"
        ref={dialog}
        aria-label={project.name[locale]}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setIndex((index + 1) % images.length);
          if (e.key === "ArrowLeft")
            setIndex((index + images.length - 1) % images.length);
        }}
      >
        <button
          autoFocus
          className="gallery-close"
          onClick={() => dialog.current?.close()}
          aria-label={locale === "en" ? "Close gallery" : "關閉影像"}
        >
          ×
        </button>
        <img src={current.src} alt={current.alt[locale]} />
        <div className="gallery-controls">
          <button
            onClick={() =>
              setIndex((index + images.length - 1) % images.length)
            }
            aria-label={locale === "en" ? "Previous image" : "上一張"}
          >
            ←
          </button>
          <span aria-live="polite">
            {index + 1} / {images.length}
          </span>
          <button
            onClick={() => setIndex((index + 1) % images.length)}
            aria-label={locale === "en" ? "Next image" : "下一張"}
          >
            →
          </button>
        </div>
      </dialog>
    </section>
  );
}
