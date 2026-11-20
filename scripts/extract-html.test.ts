import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

test("legacy extraction refuses the current main without changing CMS data", async () => {
  const root = path.resolve(import.meta.dirname, "..");
  const directory = path.join(root, "cms/data/projects");
  const filenames = await readdir(directory);
  const before = await Promise.all(filenames.map(name => readFile(path.join(directory, name), "utf8")));
  const env = { ...process.env };
  delete env.HQ_LEGACY_HTML_ROOT;
  const result = spawnSync(process.execPath, ["--import", "tsx", "scripts/extract-html.ts"], { cwd: root, env, encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /HQ_LEGACY_HTML_ROOT/);
  const after = await Promise.all(filenames.map(name => readFile(path.join(directory, name), "utf8")));
  assert.deepEqual(after, before);
});
