import { cookies } from "next/headers";
import { verifyTicket, authorized } from "../../../../lib/cms/auth";
import { getStore } from "../../../../lib/cms/storage";
import { readSnapshot } from "../../../../lib/cms/releases";
import { imageType } from "../../../../lib/cms/media";

export async function GET(request: Request) {
  try {
    const version = verifyTicket((await cookies()).get("hq-preview")?.value);
    const admin = authorized(request.headers.get("authorization"));
    if (!version && !admin)
      return new Response("Unauthorized", { status: 401 });
    const key = new URL(request.url).searchParams.get("key") || "";
    if (!key.startsWith("images/"))
      return new Response("Not found", { status: 404 });
    const store = getStore();
    if (!admin) {
      const snapshot = await readSnapshot(store, "drafts", version!);
      if (
        !snapshot.projects.some((p) =>
          p.images.some((i) => i.src === "/api/internal/image?key=" + key),
        )
      )
        return new Response("Not found", { status: 404 });
    }
    const image = await store.read(key);
    if (!image) return new Response("Not found", { status: 404 });
    return new Response(Buffer.from(image.bytes), {
      headers: {
        "Content-Type": imageType(image.bytes),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Image unavailable", { status: 503 });
  }
}
