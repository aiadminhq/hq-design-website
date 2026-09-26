import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";
import type { Snapshot } from "../project";
import type { Store } from "./storage";
import { storageNamespace } from "./storage";

export function imageType(bytes: Uint8Array): string {
  const b = Buffer.from(bytes);
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])))
    return "image/png";
  if (
    b.toString("ascii", 0, 4) === "RIFF" &&
    b.toString("ascii", 8, 12) === "WEBP"
  )
    return "image/webp";
  throw new Error("Only individual JPEG, PNG or WebP images are supported");
}
export async function uploadImage(
  store: Store,
  slug: string,
  bytes: Uint8Array,
) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new Error("Invalid project slug");
  if (bytes.byteLength > 20 * 1024 * 1024)
    throw new Error("Image is larger than 20 MB");
  const type = imageType(bytes);
  const hash = createHash("sha256").update(bytes).digest("hex");
  const key = `images/${slug}/${hash}.${type === "image/jpeg" ? "jpg" : type.split("/")[1]}`;
  if (!(await store.read(key))) await store.write(key, bytes);
  return `/api/internal/image?key=${key}`;
}
export async function materializeImages(
  store: Store,
  snapshot: Snapshot,
): Promise<Snapshot> {
  const token = process.env.HQ_BLOB_PUBLIC_TOKEN;
  if (!token) throw new Error("Public image store is not configured");
  for (const project of snapshot.projects) {
    for (const [i, image] of project.images.entries()) {
      let bytes: Uint8Array;
      if (image.src.startsWith("/api/internal/image?key=")) {
        const key = new URL(image.src, "https://hq.invalid").searchParams.get(
          "key",
        )!;
        const record = await store.read(key);
        if (!record) throw new Error("Draft image is missing");
        bytes = record.bytes;
      } else if (
        image.src.startsWith("/assets/") &&
        !image.src.includes("..")
      ) {
        bytes = await readFile(path.join(process.cwd(), "public", image.src));
      } else if (
        /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(
          image.src,
        )
      ) {
        continue; // Existing immutable published media can be reused without expiring attachments.
      } else
        throw new Error(
          "Unsupported media source; select a local individual image",
        );
      const type = imageType(bytes);
      const hash = createHash("sha256")
        .update(bytes)
        .digest("hex")
        .slice(0, 20);
      const file = `${storageNamespace()}/projects/${project.slug}/${snapshot.version}/${i + 1}-${hash}.${type === "image/jpeg" ? "jpg" : type.split("/")[1]}`;
      const uploaded = await put(file, Buffer.from(bytes), {
        access: "public",
        token,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: type,
      });
      image.src = uploaded.url;
    }
  }
  return snapshot;
}
