/**
 * 自訂 loader：每個 URL 都指向 build 時預先產好的靜態 webp，
 * transformation 數量恆為 0。src 形如 /media/work/<slug>/<stem>
 */
import manifest from "./content/generated/images.json";

export default function hqLoader({
  src,
  width,
}: {
  src: string;
  width: number;
}) {
  const key = src.replace(/^\/media\/work\//, "");
  const entry = (manifest.images as Record<string, { widths: number[] }>)[key];
  if (!entry?.widths.length)
    throw new Error("Image is missing from the published media manifest.");
  const w =
    entry.widths.find((x) => x >= width) ??
    entry.widths[entry.widths.length - 1];
  return `${src}-${w}.webp`;
}
