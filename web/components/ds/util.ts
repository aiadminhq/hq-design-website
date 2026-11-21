/** Static-site links end in .html; the Next app serves clean paths (308 from .html exists as well). */
export const clean = (href: string) =>
  href.replace(/\/index\.html$/, "/").replace(/\.html(?=$|#|\?)/, "");
export const CONTACT = { phone: "+886-2-2557-3003", tel: "+886225573003", email: "info@hqdesign.tw" };
