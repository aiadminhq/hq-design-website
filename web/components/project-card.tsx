import Image from "next/image";
import type { CardData, ImageData } from "./project-data";

export function ProjectPhoto({
  image,
  priority = false,
  sizes = "(max-width: 700px) 100vw, 50vw",
}: {
  image: ImageData;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      placeholder={image.blur ? "blur" : "empty"}
      blurDataURL={image.blur}
      style={{ objectPosition: image.position }}
    />
  );
}
export function DimensionString({
  label,
  detail,
}: {
  label: string;
  detail?: string;
}) {
  return (
    <div className="dimension">
      <span>{detail}</span>
      <span>{label}</span>
    </div>
  );
}
export function ProjectCard({
  card,
  priority = false,
}: {
  card: CardData;
  priority?: boolean;
}) {
  return (
    <article
      className={`project-card weight-${card.weight}`}
      data-provenance={card.image.prov}
    >
      <a href={card.href} className="photo-link" aria-label={card.name}>
        <ProjectPhoto image={card.image} priority={priority} />
        <span className="photo-arrow" aria-hidden="true">
          ↗
        </span>
      </a>
      <DimensionString label={card.image.label} />
      <a href={card.href} className="project-name" lang={card.lang}>
        {card.name}
      </a>
      <p className="project-gloss">{card.gloss}</p>
      {card.facts && <p className="mono muted small">{card.facts}</p>}
    </article>
  );
}
