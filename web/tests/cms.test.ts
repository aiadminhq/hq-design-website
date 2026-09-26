import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { snapshotSchema } from "../lib/project";
import {
  FileStore,
  NamespacedStore,
  storageNamespace,
  safeKey,
  type Store,
} from "../lib/cms/storage";
import {
  stage,
  published,
  publish,
  rollback,
  digest,
  readSnapshot,
} from "../lib/cms/releases";
import { mergeNotion, type NotionRow } from "../lib/cms/notion";
import { authorized, previewTicket, verifyTicket } from "../lib/cms/auth";
import { uploadImage } from "../lib/cms/media";
import initialJson from "../content/initial-release.json";
const initial = snapshotSchema.parse(initialJson);
async function fixture(run: (store: Store) => Promise<void>) {
  const dir = await mkdtemp(path.join(tmpdir(), "hq-cms-"));
  try {
    await run(new FileStore(dir));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
const identity = async <T>(value: T) => value;

test("preview and production release pointers are isolated", () =>
  fixture(async (store) => {
    const preview = new NamespacedStore(store, "preview");
    const production = new NamespacedStore(store, "production");
    await stage(preview, initial);
    await publish(preview, initial.version, digest(initial), identity);
    assert.equal(await production.read("current.json"), null);
    process.env.VERCEL_ENV = "preview";
    process.env.HQ_CMS_NAMESPACE = "production";
    assert.equal(storageNamespace(), "preview");
    delete process.env.VERCEL_ENV;
    delete process.env.HQ_CMS_NAMESPACE;
  }));

test("Notion edits/staging do not change public data; exact approval publishes and rollback restores", () =>
  fixture(async (store) => {
    const draft = { ...structuredClone(initial), version: "revision-1" };
    draft.projects[0].areaSqm = 1234;
    await stage(store, draft);
    assert.equal((await published(store, initial)).projects[0].areaSqm, 5940);
    await assert.rejects(publish(store, draft.version, "wrong", identity));
    await publish(store, draft.version, digest(draft), identity);
    assert.equal((await published(store, initial)).projects[0].areaSqm, 1234);
    const next = { ...structuredClone(draft), version: "revision-2" };
    next.projects[0].areaSqm = 999;
    await stage(store, next);
    await publish(store, next.version, digest(next), identity);
    await rollback(store, draft.version, digest(draft));
    assert.equal((await published(store, initial)).version, "revision-1");
  }));
test("failed uploads and stale pointer writes retain the previous release", () =>
  fixture(async (store) => {
    await stage(store, initial);
    await publish(store, initial.version, digest(initial), identity);
    const draft = { ...initial, version: "upload-fails" };
    await stage(store, draft);
    await assert.rejects(
      publish(store, draft.version, digest(draft), async () => {
        throw new Error("Network unavailable");
      }),
    );
    assert.equal((await published(store, initial)).version, initial.version);
    await assert.rejects(
      store.write("current.json", new Uint8Array([1]), "stale-etag"),
    );
    assert.equal((await published(store, initial)).version, initial.version);
  }));
test("draft versions are immutable and release fallback uses the previous snapshot", () =>
  fixture(async (store) => {
    await stage(store, initial);
    await assert.rejects(stage(store, initial));
    await publish(store, initial.version, digest(initial), identity);
    const second = { ...initial, version: "second" };
    await stage(store, second);
    await publish(store, second.version, digest(second), identity);
    const fault: Store = {
      read: (key) =>
        key === "releases/second.json"
          ? Promise.reject(new Error("Unavailable"))
          : store.read(key),
      write: store.write.bind(store),
    };
    assert.equal((await published(fault, initial)).version, initial.version);
  }));
test("Notion metadata updates retain pinned local images and preserve missing measurements", () => {
  const old = initial.projects.find((p) => p.slug === "csun")!;
  const row: NotionRow = {
    id: "id",
    properties: {
      Slug: { title: [{ plain_text: "csun" }] },
      "Publish Status": { select: { name: "live" } },
      "Area Sqm": { number: 720 },
      Year: { number: null },
      "Name En": { rich_text: [{ plain_text: "C.SUN" }] },
      "Hero Image": {
        files: [
          { type: "file", file: { url: "https://expired.invalid/photo" } },
        ],
      },
    },
  };
  const draft = mergeNotion([row], initial, "notion-draft");
  assert.equal(draft.projects[0].areaSqm, 720);
  assert.equal(draft.projects[0].year, null);
  assert.deepEqual(draft.projects[0].images, old.images);
  const noArea: NotionRow = {
    id: "other",
    properties: {
      Slug: { title: [{ plain_text: "longteng-travel" }] },
      "Publish Status": { select: { name: "unpublished" } },
    },
  };
  assert.equal(
    mergeNotion([noArea], initial, "missing").projects[0].areaSqm,
    null,
  );
});
test("auth is fail-closed; preview tickets are version scoped, expiring and tamper resistant", () => {
  process.env.HQ_CMS_SECRET = "unit-test-secret-never-use-in-production-123456";
  assert.equal(authorized(null), false);
  assert.equal(authorized("Bearer " + process.env.HQ_CMS_SECRET), true);
  const ticket = previewTicket("revision-1");
  assert.equal(verifyTicket(ticket), "revision-1");
  assert.equal(verifyTicket(ticket + "x"), null);
  assert.equal(verifyTicket(previewTicket("revision-1", 0)), null);
  delete process.env.HQ_CMS_SECRET;
  assert.throws(() => authorized(null));
});
test("storage rejects path traversal and executable uploads", () =>
  fixture(async (store) => {
    for (const key of ["../secret", "/secret", "images/../../secret"])
      assert.throws(() => safeKey(key));
    await assert.rejects(
      uploadImage(
        store,
        "csun",
        new TextEncoder().encode('<svg onload="alert(1)"></svg>'),
      ),
    );
    await assert.rejects(readSnapshot(store, "drafts", "../../secret"));
  }));
