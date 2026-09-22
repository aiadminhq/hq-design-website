import createMiddleware from "next-intl/middleware";
import { routing } from "./lib/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // 排除 API、Next 內部資源、以及所有帶副檔名的靜態檔
  matcher: ["/((?!api|_next|_vercel|media|fonts|.*\\..*).*)"],
};
