/**
 * 自訂 loader：每個 URL 都指向 build 時預先產好的靜態 webp，
 * transformation 數量恆為 0。src 形如 /media/work/<slug>/<stem>
 */
const WIDTHS = [800, 1024, 1280, 1600, 1920, 2560] as const;

export default function hqLoader({ src, width }: { src: string; width: number }) {
  const w = WIDTHS.find((x) => x >= width) ?? WIDTHS[WIDTHS.length - 1];
  return `${src}-${w}.webp`;
}
