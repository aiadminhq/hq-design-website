"use client";
import { useEffect, useRef, useState } from "react";
import type { ImageData } from "./project-data";
import { ProjectPhoto, DimensionString } from "./project-card";
import type { Locale } from "@/lib/content/schema";
export function Gallery({
  images,
  locale,
}: {
  images: ImageData[];
  locale: Locale;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const close = () => {
    setIndex(null);
    opener.current?.focus();
  };
  useEffect(() => {
    if (index !== null) {
      if (!dialog.current?.open) dialog.current?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog.current?.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [index]);
  return (
    <>
      <div className="gallery-grid">
        {images.map((image, i) => (
          <figure
            className={image.height > image.width ? "portrait" : ""}
            key={image.stem}
            data-provenance={image.prov}
          >
            <button
              className="gallery-open"
              aria-label={`${locale === "zh" ? "放大" : "Enlarge"}: ${image.alt}`}
              onClick={(e) => {
                opener.current = e.currentTarget;
                setIndex(i);
              }}
            >
              <ProjectPhoto image={image} />
              <span className="photo-arrow" aria-hidden="true">
                +
              </span>
            </button>
            <figcaption>
              <DimensionString
                label={image.label}
                detail={String(i + 1).padStart(2, "0")}
              />
              <p lang={locale === "en" ? "zh-Hant" : undefined}>{image.alt}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <dialog
        className="lightbox"
        aria-label={locale === "zh" ? "案例影像檢視" : "Project image viewer"}
        ref={dialog}
        onCancel={close}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onKeyDown={(e) => {
          if (index === null) return;
          if (e.key === "ArrowRight") {
            e.preventDefault();
            setIndex((index + 1) % images.length);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            setIndex((index - 1 + images.length) % images.length);
          }
        }}
      >
        <button className="lightbox-close" onClick={close}>
          {locale === "zh" ? "關閉" : "Close"} ×
        </button>
        {index !== null && (
          <>
            <div className="lightbox-image">
              <ProjectPhoto image={images[index]} sizes="95vw" />
            </div>
            <div className="lightbox-controls">
              <button
                aria-label={locale === "zh" ? "上一張" : "Previous image"}
                onClick={() =>
                  setIndex((index - 1 + images.length) % images.length)
                }
              >
                ←
              </button>
              <p>
                {index + 1} / {images.length} · {images[index].label}
                <br />
                {images[index].alt}
              </p>
              <button
                aria-label={locale === "zh" ? "下一張" : "Next image"}
                onClick={() => setIndex((index + 1) % images.length)}
              >
                →
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
