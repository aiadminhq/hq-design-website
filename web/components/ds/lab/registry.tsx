import type { LabEntry } from "../showcase";
import { Arrow } from "../arrow";

/**
 * Component lab registry.
 * To preview a pasted component:
 *   1. Save it as components/ds/lab/<name>.tsx (add "use client" if it uses state/effects).
 *   2. Import it here and append an entry. Use only tokens.css variables / .hq-* classes.
 * The page /lab lists every entry; navy/dark themes are switched with `theme`.
 */
export const registry: LabEntry[] = [
  {
    id: "buttons",
    title: "Buttons",
    note: "Core Components / Button — one accent per page.",
    node: (
      <div className="hq-btn-row">
        <a className="hq-btn hq-btn--primary" href="#buttons">Primary <Arrow /></a>
        <a className="hq-btn hq-btn--accent" href="#buttons">Accent <Arrow /></a>
        <a className="hq-btn hq-btn--outline" href="#buttons">Outline</a>
        <a className="hq-btn hq-btn--primary hq-btn--sm" href="#buttons">Small</a>
      </div>
    ),
  },
  {
    id: "buttons-navy",
    title: "Buttons on Navy",
    theme: "navy",
    node: (
      <div className="hq-btn-row">
        <a className="hq-btn hq-btn--primary" href="#buttons-navy">Primary</a>
        <a className="hq-btn hq-btn--accent" href="#buttons-navy">Accent</a>
        <a className="hq-btn hq-btn--inverse" href="#buttons-navy">Inverse</a>
      </div>
    ),
  },
  {
    id: "tags-stats",
    title: "Tags & Stats",
    node: (
      <div className="hq-stack">
        <div className="hq-btn-row">
          <span className="hq-tag hq-tag--accent">Accent</span>
          <span className="hq-tag hq-tag--primary">Primary</span>
          <span className="hq-tag hq-tag--outline">Outline</span>
        </div>
        <div className="hq-stats">
          <div className="hq-stat"><div className="hq-stat__num">31<span className="hq-stat__unit">+</span></div><div className="hq-stat__label">Years in Operation</div></div>
          <div className="hq-stat"><div className="hq-stat__num">1,600<span className="hq-stat__unit">+</span></div><div className="hq-stat__label">Commercial Projects</div></div>
        </div>
      </div>
    ),
  },
  {
    id: "cards",
    title: "Cards (flat / outline)",
    node: (
      <div className="ds-grid ds-grid--3">
        <article className="hq-card"><h3 className="hq-card__title">Flat card</h3><p className="hq-card__body">Default card on a white section.</p></article>
        <article className="hq-card hq-card--outline"><h3 className="hq-card__title">Outline card</h3><p className="hq-card__body">Use on subtle backgrounds.</p></article>
      </div>
    ),
  },
  {
    id: "steps",
    title: "Process steps",
    node: (
      <ol className="hq-steps">
        {["Site Survey", "Parametric Design", "Design Intent", "Technical Validation"].map((s) => (
          <li className="hq-step" key={s}><span className="hq-step__title">{s}</span><span className="hq-step__body">Short description goes here.</span></li>
        ))}
      </ol>
    ),
  },
];
