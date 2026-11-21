import type { ReactNode } from "react";

export type LabEntry = {
  id: string;
  title: string;
  note?: string;
  /** "navy" | "dark" renders the stage on a dark surface (data-theme). */
  theme?: "light" | "navy" | "dark";
  node: ReactNode;
};

export function Showcase({ entry }: { entry: LabEntry }) {
  return (
    <section className="lab-item" id={entry.id}>
      <div className="hq-container">
        <div className="lab-item__bar">
          <h2 className="hq-h3">{entry.title}</h2>
          <span className="hq-tag hq-tag--outline">{entry.id}</span>
        </div>
        {entry.note && <p className="hq-muted">{entry.note}</p>}
        <div
          className="lab-item__stage"
          data-theme={entry.theme && entry.theme !== "light" ? entry.theme : undefined}
        >
          {entry.node}
        </div>
      </div>
    </section>
  );
}
