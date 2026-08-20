"use client";

/**
 * Thin fetch wrapper for the live CYLO backend.
 *
 * This is the only way the console reaches data. There is no mock layer any
 * more: a screen either calls through here or it declares itself unbuilt.
 *
 * The backend wraps successful payloads as `{ data: ... }` (that is what the
 * Postman collection's test scripts read), so `request()` unwraps it and hands
 * callers the payload directly.
 */

/**
 * The Ceylo backend. Fixed on purpose.
 *
 * The browser calls this URL directly, from every environment — local, Vercel,
 * anywhere. There is no proxy, no environment variable and no per-host
 * behaviour, so what you see in devtools is exactly what the app requests and
 * a bug reproduces the same way everywhere.
 *
 * This works because the backend sends CORS headers for the calling origin and
 * allows the Authorization header. If it ever stops doing so, browser calls
 * fail everywhere at once rather than only in one environment.
 */
export const API_BASE = "https://ceylo-backend.onrender.com/api/v1";

/** Shown in the UI so the operator always knows which backend they are on. */
export const API_ORIGIN_LABEL = API_BASE;

export class ApiError extends Error {
  status: number;
  /** The raw body, so the UI can show exactly what the server said. */
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

/** The backend is not running / not reachable — worth its own message. */
export class ApiUnreachableError extends Error {
  constructor(cause: unknown) {
    super(
      `Could not reach the CYLO backend at ${API_ORIGIN_LABEL}. ` +
        `Check that it is running and that the base URL is right.`,
    );
    this.name = "ApiUnreachableError";
    this.cause = cause;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
  query?: Record<string, string | number | undefined>;
  /** Milliseconds before the request is abandoned. */
  timeoutMs?: number;
  signal?: AbortSignal;
};

/** Digs the server's own message out of an error envelope, if it has one. */
function serverMessage(b: Record<string, unknown>): string | null {
  if (typeof b.message === "string" && b.message.trim()) return b.message.trim();
  if (typeof b.error === "string" && b.error.trim()) return b.error.trim();
  if (b.error && typeof b.error === "object") {
    const e = b.error as Record<string, unknown>;
    if (typeof e.message === "string" && e.message.trim()) return e.message.trim();
  }
  return null;
}

/** Generic server boilerplate that tells an operator nothing useful. */
const USELESS_BODIES = new Set([
  "internal server error",
  "bad gateway",
  "service unavailable",
  "gateway timeout",
  "not found",
  "forbidden",
  "unauthorized",
]);

/** Pulls a human message out of whatever error shape the server returns. */
function messageFrom(body: unknown, status: number): string {
  if (typeof body === "string") {
    const text = body.trim();
    // Skip HTML error pages and one-line server boilerplate — the status-based
    // message below says more than "Internal Server Error" does.
    const useless =
      !text || text.startsWith("<") || text.length > 300 || USELESS_BODIES.has(text.toLowerCase());
    if (!useless) return text;
  } else if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    // 403 from this API means the JWT carries a non-admin role. Bootstrapping
    // alone is not enough — the token has the role baked in at issue time.
    if (status === 403) {
      return (
        serverMessage(b) ??
        "This account does not hold an admin role on the backend."
      ) + " Use Bootstrap admin, then Disconnect and Connect again to mint a token that carries the role.";
    }
    if (typeof b.message === "string" && b.message.trim()) return b.message;
    if (typeof b.error === "string" && b.error.trim()) return b.error;
    if (b.error && typeof b.error === "object") {
      const e = b.error as Record<string, unknown>;
      if (typeof e.message === "string" && e.message.trim()) return e.message;
    }
    if (Array.isArray(b.errors) && typeof b.errors[0] === "string") return b.errors[0] as string;
  }

  if (status === 401) return "Not authorised — connect again to get a fresh token.";
  if (status === 403)
    return "This account is authenticated but does not hold an admin role on the backend. Use Bootstrap admin, then reconnect.";
  if (status === 404)
    return `The backend has no such endpoint. Check that ${API_ORIGIN_LABEL} points at the CYLO API.`;
  if (status >= 500) {
    return (
      `The backend returned ${status} and no detail. ` +
      `The backend at ${API_ORIGIN_LABEL} may be down or restarting — try again shortly.`
    );
  }
  return `Request failed with status ${status}.`;
}

export async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, query, timeoutMs = 15000, signal } = options;

  // API_BASE is absolute, so no relative-resolution base is needed.
  const url = new URL(`${API_BASE}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  signal?.addEventListener("abort", () => controller.abort());

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (cause) {
    throw new ApiUnreachableError(cause);
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text();
  let parsed: unknown = undefined;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) throw new ApiError(messageFrom(parsed, response.status), response.status, parsed);

  // Success bodies come back as { data: ... }; hand callers the payload.
  if (parsed && typeof parsed === "object" && "data" in (parsed as Record<string, unknown>)) {
    return (parsed as Record<string, unknown>).data as T;
  }
  return parsed as T;
}

/** Turns any thrown value into something worth showing an operator. */
export function errorText(error: unknown): string {
  if (error instanceof ApiUnreachableError) return error.message;
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong talking to the backend.";
}
