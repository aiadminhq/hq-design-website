// Copies the New Design System CSS from the static site (single source of truth) into the Next app.
import { copyFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "app/(ds)/styles");
mkdirSync(out, { recursive: true });
for (const f of ["tokens.css", "components.css"])
  copyFileSync(path.join(root, "../assets/css", f), path.join(out, f));
console.log("synced tokens.css, components.css from ../assets/css");
