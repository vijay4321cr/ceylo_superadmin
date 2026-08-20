import type { NextConfig } from "next";

/**
 * The backend proxy lives in `src/app/cylo-api/[...path]/route.ts`, not here.
 *
 * It was a `rewrites()` entry originally, which worked locally under both
 * `next dev` and `next start` but 404'd once deployed. A route handler is
 * ordinary application code, so it ships with the app on any host.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
