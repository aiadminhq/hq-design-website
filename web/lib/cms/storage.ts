import {
  readFile,
  writeFile,
  mkdir,
  rename,
  open,
  unlink,
} from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { get, put } from "@vercel/blob";

export interface Stored {
  bytes: Uint8Array;
  etag: string;
}
export interface Store {
  read(key: string): Promise<Stored | null>;
  write(
    key: string,
    bytes: Uint8Array,
    expected?: string | null,
  ): Promise<string>;
}
export function safeKey(key: string) {
  if (
    !/^[a-zA-Z0-9][a-zA-Z0-9/_.,-]*$/.test(key) ||
    key.split("/").includes("..")
  )
    throw new Error("Invalid storage key");
  return key;
}
/** Local store is only for development/tests. Exclusive lock and rename protect the release pointer. */
export class FileStore implements Store {
  constructor(private directory: string) {}
  async read(key: string): Promise<Stored | null> {
    try {
      const bytes = await readFile(path.join(this.directory, safeKey(key)));
      return { bytes, etag: Buffer.from(bytes).toString("base64") };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw error;
    }
  }
  async write(key: string, bytes: Uint8Array, expected?: string | null) {
    const file = path.join(this.directory, safeKey(key));
    await mkdir(path.dirname(file), { recursive: true });
    const lock = await open(file + ".lock", "wx");
    try {
      const previous = await this.read(key);
      if (expected !== undefined && (previous?.etag ?? null) !== expected)
        throw new Error("Release changed; refresh before retrying");
      if (expected === undefined && previous)
        throw new Error("Immutable version already exists");
      const temp = file + "." + randomUUID();
      await writeFile(temp, bytes);
      await rename(temp, file);
      return Buffer.from(bytes).toString("base64");
    } finally {
      await lock.close();
      await unlink(file + ".lock");
    }
  }
}
export class BlobStore implements Store {
  constructor(private token: string) {}
  async read(key: string): Promise<Stored | null> {
    const result = await get(safeKey(key), {
      access: "private",
      token: this.token,
      useCache: false,
    });
    if (!result) return null;
    if (result.statusCode !== 200)
      throw new Error("Unable to read private content");
    return {
      bytes: new Uint8Array(await new Response(result.stream).arrayBuffer()),
      etag: result.blob.etag,
    };
  }
  async write(key: string, bytes: Uint8Array, expected?: string | null) {
    const result = await put(safeKey(key), Buffer.from(bytes), {
      access: "private",
      token: this.token,
      addRandomSuffix: false,
      allowOverwrite: typeof expected === "string",
      ...(typeof expected === "string" ? { ifMatch: expected } : {}),
      contentType: "application/octet-stream",
    });
    return result.etag;
  }
}
export function storageNamespace() {
  // Preview deployments can never point at the production release pointer.
  if (process.env.VERCEL_ENV)
    return process.env.VERCEL_ENV === "production" ? "production" : "preview";
  const value = process.env.HQ_CMS_NAMESPACE || "preview";
  if (!["preview", "production"].includes(value))
    throw new Error("Invalid CMS namespace");
  return value;
}
export class NamespacedStore implements Store {
  constructor(
    private store: Store,
    private namespace: string,
  ) {
    safeKey(namespace);
  }
  read(key: string) {
    return this.store.read(`${this.namespace}/${safeKey(key)}`);
  }
  write(key: string, bytes: Uint8Array, expected?: string | null) {
    return this.store.write(
      `${this.namespace}/${safeKey(key)}`,
      bytes,
      expected,
    );
  }
}
export function getStore(): Store {
  if (process.env.HQ_BLOB_PRIVATE_TOKEN)
    return new NamespacedStore(
      new BlobStore(process.env.HQ_BLOB_PRIVATE_TOKEN),
      storageNamespace(),
    );
  if (
    process.env.VERCEL ||
    (process.env.NODE_ENV === "production" && process.env.HQ_CMS_LOCAL !== "1")
  )
    throw new Error("Private content store is not configured");
  return new FileStore(process.env.HQ_CMS_DIR || path.resolve(".cms"));
}
export function encode(value: unknown) {
  return new TextEncoder().encode(JSON.stringify(value));
}
