import type { Metadata } from "next";
import { registry } from "../../../components/ds/lab/registry";
import { Showcase } from "../../../components/ds/showcase";

export const metadata: Metadata = {
  title: "Component Lab — HQ Design",
  robots: { index: false, follow: false },
};

export default function Lab() {
  return (
    <>
      <div className="hq-container lab-head">
        <span className="hq-label">Preview only · noindex</span>
        <h1 className="hq-h1">Component Lab</h1>
        <p className="hq-lead">
          Components pasted here render on the New Design System tokens. See
          components/ds/lab/registry.tsx.
        </p>
        <nav aria-label="Components" className="hq-btn-row" style={{ marginTop: "var(--space-md)" }}>
          {registry.map((e) => (
            <a key={e.id} className="hq-tag hq-tag--outline" href={`#${e.id}`}>{e.title}</a>
          ))}
        </nav>
      </div>
      {registry.map((e) => (
        <Showcase key={e.id} entry={e} />
      ))}
    </>
  );
}
