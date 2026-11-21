import { createHash } from "node:crypto";
import { snapshotSchema, type Snapshot } from "../project";
import type { Store } from "./storage";
import { encode } from "./storage";

export interface ReleasePointer {
  current: string;
  previous: string | null;
  changedAt: string;
}
export function digest(snapshot: Snapshot) {
  return createHash("sha256")
    .update(JSON.stringify(snapshotSchema.parse(snapshot)))
    .digest("hex");
}
export function versionKey(version: string) {
  return snapshotSchema.shape.version.parse(version);
}
export async function readSnapshot(
  store: Store,
  kind: "drafts" | "releases",
  version: string,
) {
  const stored = await store.read(`${kind}/${versionKey(version)}.json`);
  if (!stored) throw new Error("Snapshot not found");
  return snapshotSchema.parse(
    JSON.parse(new TextDecoder().decode(stored.bytes)),
  );
}
export async function stage(store: Store, snapshot: Snapshot) {
  const checked = snapshotSchema.parse(snapshot);
  await store.write(`drafts/${checked.version}.json`, encode(checked));
  return { version: checked.version, digest: digest(checked) };
}
export async function pointer(store: Store) {
  const record = await store.read("current.json");
  return {
    etag: record?.etag ?? null,
    value: record
      ? (JSON.parse(new TextDecoder().decode(record.bytes)) as ReleasePointer)
      : null,
  };
}
export async function publish(
  store: Store,
  version: string,
  approvedDigest: string,
  materialize: (snapshot: Snapshot) => Promise<Snapshot>,
) {
  const before = await pointer(store);
  const draft = await readSnapshot(store, "drafts", version);
  if (digest(draft) !== approvedDigest)
    throw new Error("Approval digest does not match this draft");
  const release = snapshotSchema.parse(
    await materialize(structuredClone(draft)),
  );
  if (release.version !== version) throw new Error("Release version mismatch");
  // All immutable content and images must succeed before the single atomic pointer change.
  const key = `releases/${version}.json`;
  const existing = await store.read(key);
  if (existing) {
    if (new TextDecoder().decode(existing.bytes) !== JSON.stringify(release))
      throw new Error("Release version already contains different content");
  } else await store.write(key, encode(release));
  await store.write(
    "current.json",
    encode({
      current: version,
      previous: before.value?.current ?? null,
      changedAt: new Date().toISOString(),
    }),
    before.etag,
  );
  return release;
}
export async function rollback(
  store: Store,
  version: string,
  approvedDigest: string,
) {
  const before = await pointer(store);
  const release = await readSnapshot(store, "releases", version);
  if (digest(release) !== approvedDigest)
    throw new Error("Rollback digest mismatch");
  await store.write(
    "current.json",
    encode({
      current: version,
      previous: before.value?.current ?? null,
      changedAt: new Date().toISOString(),
    }),
    before.etag,
  );
  return release;
}
export async function published(store: Store, initial: Snapshot) {
  const current = await pointer(store);
  if (!current.value) return initial;
  try {
    return await readSnapshot(store, "releases", current.value.current);
  } catch (error) {
    console.error(
      "Current release could not be read; attempting previous release",
    );
    if (current.value.previous)
      return readSnapshot(store, "releases", current.value.previous);
    throw error;
  }
}
