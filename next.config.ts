import type { NextConfig } from "next";

/**
 * Nothing here configures the backend. The API base URL is fixed in
 * `src/lib/api/client.ts` and the browser calls it directly, so there is no
 * rewrite, proxy or environment switch to keep in sync.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
