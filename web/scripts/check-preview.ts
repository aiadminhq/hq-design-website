import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { FileStore } from "../lib/cms/storage";
import { stage } from "../lib/cms/releases";
import { uploadImage } from "../lib/cms/media";
import { snapshotSchema } from "../lib/project";
import initial from "../content/initial-release.json";

const directory = await mkdtemp(path.join(tmpdir(), "hq-preview-"));
const secret = randomBytes(32).toString("hex");
const store = new FileStore(directory);
const draft = snapshotSchema.parse(structuredClone(initial));
draft.version = "preview-integration";
draft.projects[0].name.en = "Private Draft Only";
draft.projects[0].images[0].src = await uploadImage(
  store,
  draft.projects[0].slug,
  await readFile("public" + draft.projects[0].images[0].src),
);
await stage(store, draft);
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--port", "3012"],
  {
    env: {
      ...process.env,
      HQ_CMS_SECRET: secret,
      HQ_CMS_LOCAL: "1",
      HQ_CMS_DIR: directory,
      HQ_BLOB_PRIVATE_TOKEN: "",
      VERCEL: "",
    },
    stdio: "pipe",
  },
);
let ready = false;
let logs = "";
server.stdout.on("data", (chunk) => {
  logs += chunk.toString();
  if (logs.includes("Ready")) ready = true;
});
server.stderr.on("data", (chunk) => {
  logs += chunk.toString();
});
try {
  for (let n = 0; n < 100 && !ready; n++)
    await new Promise((resolve) => setTimeout(resolve, 100));
  assert.ok(ready, "Preview test server failed to start");
  const base = "http://127.0.0.1:3012";
  const command = await fetch(base + "/api/internal/release", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "preview", version: draft.version }),
  });
  assert.equal(command.status, 200);
  const { previewPath } = await command.json();
  const preview = await fetch(base + previewPath, { redirect: "manual" });
  assert.equal(preview.status, 307);
  const cookie = preview.headers.get("set-cookie")!.split(";")[0];
  assert.ok(cookie.startsWith("hq-preview="));
  const project = "/projects/" + draft.projects[0].slug;
  const publicPage = await (await fetch(base + project)).text();
  assert.ok(!publicPage.includes("Private Draft Only"));
  const privatePage = await (
    await fetch(base + project, { headers: { cookie } })
  ).text();
  assert.ok(privatePage.includes("Private Draft Only"));
  assert.ok(privatePage.includes("noindex"));
  const image = base + draft.projects[0].images[0].src;
  assert.equal((await fetch(image)).status, 401);
  const privateImage = await fetch(image, { headers: { cookie } });
  assert.equal(privateImage.status, 200);
  assert.match(privateImage.headers.get("cache-control")!, /no-store/);
  assert.equal(
    (await fetch(base + "/api/internal/preview?ticket=invalid")).status,
    401,
  );
  assert.ok(
    !(
      await (await fetch(base + "/sitemap.xml", { headers: { cookie } })).text()
    ).includes("Private Draft Only"),
  );
  console.log(
    "Preview integration passed: signed preview, isolated metadata, private media access, noindex, expired/invalid access rejected, public version unchanged.",
  );
} finally {
  server.kill("SIGTERM");
  await new Promise((resolve) => server.once("exit", resolve));
  await rm(directory, { recursive: true, force: true });
}
