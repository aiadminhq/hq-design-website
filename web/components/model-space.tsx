"use client";
import { useState } from "react";
import type { Locale } from "@/lib/content/schema";
import { HqUnfocusedMesh } from "./hq-unfocused-mesh";
export function ModelSpace({
  figures,
  locale,
}: {
  figures: {
    name: string;
    english: string;
    svg: string;
    description: string;
  }[];
  locale: Locale;
}) {
  const [selected, setSelected] = useState(0);
  const [scale, setScale] = useState(1);
  const [grid, setGrid] = useState(true);
  const figure = figures[selected];
  return (
    <div className="model-space">
      <div
        className="model-toolbar"
        role="group"
        aria-label={locale === "zh" ? "圖說選擇" : "Drawing selection"}
      >
        {figures.map((f, i) => (
          <button
            key={f.english}
            aria-pressed={selected === i}
            onClick={() => {
              setSelected(i);
              setScale(1);
            }}
          >
            {locale === "zh" ? f.name : f.english}
          </button>
        ))}
      </div>
      <div className={`model-viewport ${grid ? "show-grid" : ""}`}>
        <HqUnfocusedMesh
          className="model-mesh"
          mesh={{ from: "#FFFFFF", to: "#E1E8F0", angle: 120, accent: null }}
          grain={0.03}
          vignette={0}
          drift={false}
        />
        <div
          className="model-drawing"
          role="img"
          aria-label={locale === "zh" ? figure.name : figure.english}
          style={{ transform: `scale(${scale})` }}
          dangerouslySetInnerHTML={{ __html: figure.svg }}
        />
      </div>
      <div className="model-controls">
        <label>
          {locale === "zh" ? "縮放" : "Zoom"}
          <input
            aria-label={locale === "zh" ? "圖說縮放" : "Drawing zoom"}
            type="range"
            min=".7"
            max="1.8"
            step=".05"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
          />
          <output className="mono">{Math.round(scale * 100)}%</output>
        </label>
        <label>
          <input
            type="checkbox"
            checked={grid}
            onChange={(e) => setGrid(e.target.checked)}
          />
          {locale === "zh" ? "參考網格" : "Reference grid"}
        </label>
        <button onClick={() => setScale(1)}>
          {locale === "zh" ? "重設" : "Reset"}
        </button>
      </div>
      <p className="model-caption">{figure.description}</p>
      <p className="mono small muted">
        {locale === "zh"
          ? "流程示意圖 · 非工程模型 · 不供施工"
          : "PROCESS DIAGRAM · NOT AN ENGINEERING MODEL · NOT FOR CONSTRUCTION"}
      </p>
    </div>
  );
}
