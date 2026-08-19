import type { NextConfig } from "next";

/** Where the live CYLO backend runs. Override with CYLO_API_ORIGIN. */
const CYLO_API_ORIGIN =
  process.env.CYLO_API_ORIGIN ?? "https://ceylo-backend.onrender.com/api/v1";

const nextConfig: NextConfig = {
  /**
   * Same-origin proxy for the live backend.
   *
   * The partner-approvals tab calls `/cylo-api/...` from the browser, which
   * lands here and is forwarded to the real API. Going through the same origin
   * means the backend does not have to enable CORS for this console, and the
   * bearer token never crosses an origin boundary.
   *
   * Set NEXT_PUBLIC_API_BASE_URL to bypass the proxy and call a deployed API
   * directly (that backend then does need to allow this origin).
   */
  async rewrites() {
    return [{ source: "/cylo-api/:path*", destination: `${CYLO_API_ORIGIN}/:path*` }];
  },
};

export default nextConfig;
