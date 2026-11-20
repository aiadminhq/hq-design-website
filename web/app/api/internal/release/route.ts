import { revalidatePath } from "next/cache";
import { authorized, previewTicket } from "../../../../lib/cms/auth";
import { getStore } from "../../../../lib/cms/storage";
import {
  publish,
  rollback,
  readSnapshot,
  digest,
  stage,
  versionKey,
} from "../../../../lib/cms/releases";
import { materializeImages } from "../../../../lib/cms/media";
import { notionDraft } from "../../../../lib/cms/notion";
import { initialRelease } from "../../../../lib/content";
import { published } from "../../../../lib/cms/releases";

export const runtime = "nodejs";
export const maxDuration = 300;
export async function POST(request: Request) {
  try {
    if (!authorized(request.headers.get("authorization")))
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (Number(request.headers.get("content-length") || 0) > 2048)
      return Response.json({ error: "Request too large" }, { status: 413 });
    const body = await request.json();
    const version = versionKey(body.version);
    const store = getStore();
    if (body.action === "draft") {
      const base = body.baseVersion
        ? await readSnapshot(store, "drafts", versionKey(body.baseVersion))
        : await published(store, initialRelease);
      return Response.json(
        await stage(store, await notionDraft(base, version)),
      );
    }
    if (body.action === "preview") {
      const draft = await readSnapshot(store, "drafts", version);
      return Response.json({
        version,
        digest: digest(draft),
        previewPath: "/api/internal/preview?ticket=" + previewTicket(version),
      });
    }
    if (body.action === "inspect") {
      const release = await readSnapshot(store, "releases", version);
      return Response.json({ version, digest: digest(release) });
    }
    if (
      !["publish", "rollback"].includes(body.action) ||
      typeof body.digest !== "string"
    )
      return Response.json({ error: "Invalid command" }, { status: 400 });
    const release =
      body.action === "publish"
        ? await publish(store, version, body.digest, (draft) =>
            materializeImages(store, draft),
          )
        : await rollback(store, version, body.digest);
    let cacheRefreshed = true;
    try {
      revalidatePath("/", "layout");
      revalidatePath("/sitemap.xml");
    } catch {
      cacheRefreshed = false;
      console.error("Release committed; cache invalidation needs retry");
    }
    return Response.json({
      version: release.version,
      digest: digest(release),
      published: true,
      cacheRefreshed,
    });
  } catch (error) {
    console.error(
      "CMS command failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return Response.json(
      {
        error:
          "Command failed; inspect server logs. A failed staging or image upload does not change the public release.",
      },
      { status: 400 },
    );
  }
}
