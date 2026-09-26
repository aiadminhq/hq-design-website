import { createHmac, timingSafeEqual } from "node:crypto";
export function secret() {
  const value = process.env.HQ_CMS_SECRET;
  if (!value || value.length < 32)
    throw new Error("CMS secret is not configured");
  return value;
}
export function authorized(header: string | null) {
  const expected = secret();
  const actual = header?.replace(/^Bearer /, "") || "";
  return (
    actual.length === expected.length &&
    timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
  );
}
export function previewTicket(
  version: string,
  expires = Date.now() + 30 * 60_000,
) {
  const payload = Buffer.from(JSON.stringify({ version, expires })).toString(
    "base64url",
  );
  return (
    payload + "." + createHmac("sha256", secret()).update(payload).digest("hex")
  );
}
export function verifyTicket(ticket: string | undefined): string | null {
  if (!ticket) return null;
  if (!process.env.HQ_CMS_SECRET || process.env.HQ_CMS_SECRET.length < 32)
    return null;
  const [payload, signature] = ticket.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  )
    return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof data.version === "string" &&
      /^[a-z0-9][a-z0-9-]{0,79}$/.test(data.version) &&
      data.expires > Date.now()
      ? data.version
      : null;
  } catch {
    return null;
  }
}
