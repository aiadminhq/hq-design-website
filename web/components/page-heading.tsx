export function PageHeading({
  index,
  title,
  english,
  description,
}: {
  index: string;
  title: string;
  english?: string;
  description?: string;
}) {
  return (
    <header className="page-heading">
      <p className="eyebrow">{index}</p>
      <h1>
        {title}
        <span className="brand-dot">.</span>
      </h1>
      {english && <p className="heading-english">{english}</p>}
      {description && <p className="heading-desc">{description}</p>}
    </header>
  );
}
