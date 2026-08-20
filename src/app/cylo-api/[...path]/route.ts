import { NextRequest } from "next/server";

/**
 * Same-origin proxy to the Ceylo backend.
 *
 * The browser calls `/cylo-api/...` on this app's own origin and this handler
 * forwards it to CYLO_API_ORIGIN. Two reasons it works this way:
 *
 *  - the backend needs no CORS entry for whatever host this is deployed to, and
 *  - the bearer token never crosses an origin boundary.
 *
 * This used to be a `rewrites()` entry in next.config.ts. That works under
 * `next dev` and `next start` but did not survive deployment, so the proxy is
 * now ordinary application code — it deploys wherever the app does.
 */

const UPSTREAM = (process.env.CYLO_API_ORIGIN ?? "https://ceylo-backend.onrender.com/api/v1")
  .replace(/\/+$/, "");

/** Only forward what the upstream needs; hop-by-hop headers must not be relayed. */
const FORWARD_REQUEST_HEADERS = ["authorization", "content-type", "accept", "idempotency-key"];

async function proxy(req: NextRequest, path: string[]) {
  const target = `${UPSTREAM}/${path.map(encodeURIComponent).join("/")}${req.nextUrl.search}`;

  const headers = new Headers();
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }

  const hasBody = !["GET", "HEAD"].includes(req.method);

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers,
      body: hasBody ? await req.text() : undefined,
      redirect: "manual",
      cache: "no-store",
    });
  } catch {
    return Response.json(
      {
        success: false,
        error: {
          code: "UPSTREAM_UNREACHABLE",
          message: `Could not reach the Ceylo backend at ${UPSTREAM}.`,
        },
      },
      { status: 502 },
    );
  }

  const body = await upstream.arrayBuffer();
  const out = new Headers();
  const contentType = upstream.headers.get("content-type");
  if (contentType) out.set("content-type", contentType);
  out.set("cache-control", "no-store");

  return new Response(body, { status: upstream.status, headers: out });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  return proxy(req, (await ctx.params).path);
}

/** The proxy must always run per-request; nothing here may be prerendered. */
export const dynamic = "force-dynamic";
