import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import fg from "fast-glob";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const schemaPaths = await fg("cms/schemas/*.json", {
  cwd: ROOT,
  absolute: true,
});
const schemas = Object.fromEntries(
  await Promise.all(
    schemaPaths.map(async (p) => [
      path.basename(p, ".json"),
      JSON.parse(await fs.readFile(p, "utf8")),
    ]),
  ),
);

const dataPaths = await fg("cms/data/**/*.json", { cwd: ROOT, absolute: true });
let failures = 0;

for (const dataPath of dataPaths) {
  const rel = path.relative(ROOT, dataPath);
  const key = rel.includes("projects/")
    ? "projects"
    : path.basename(dataPath, ".json");
  const schema = schemas[key];
  if (!schema) {
    console.warn(`⚠️  no schema for ${rel}`);
    continue;
  }
  const data = JSON.parse(await fs.readFile(dataPath, "utf8"));
  const valid = ajv.validate(schema, data);
  if (!valid) {
    failures++;
    console.error(`❌ ${rel}\n`, ajv.errors);
  } else {
    console.log(`✅ ${rel}`);
  }
}

if (failures) process.exit(1);
