"use client";

/**
 * Every call this console makes to the Ceylo backend. There is no other data
 * source — if a screen is not served by something in this file, it has no
 * backend yet and says so rather than showing invented numbers.
 *
 * Endpoints below are exactly those the Ceylo API exposes under /admin, plus
 * the auth needed to reach them.
 */

import { ApiError, request } from "../api/client";
import { useStaffAuthStore } from "../stores/staffAuthStore";
import { normaliseRow, str, toArray, obj, type ApprovalRow, type KycStatus } from "./approvalNormalise";

export type { ApprovalRow, KycStatus };
export { normaliseRow };

/**
 * Some backends accept a fixed code in development. That code is a working
 * credential for whatever backend this build points at, so it is NOT committed
 * — set NEXT_PUBLIC_DEV_OTP locally if you want the hint rendered on the
 * sign-in screen. Empty means no hint is shown.
 */
export const DEV_OTP = process.env.NEXT_PUBLIC_DEV_OTP ?? "";

/* ------------------------------------------------------------------- auth */

export async function sendOtp(phone: string): Promise<{ sessionId: string }> {
  const data = await request<{ sessionId?: string }>("/auth/otp/send", {
    method: "POST",
    body: { phone, purpose: "login" },
  });
  return { sessionId: str(data?.sessionId) };
}

export async function verifyOtp(
  sessionId: string,
  phone: string,
  otp: string,
): Promise<{ accessToken: string; refreshToken: string | null }> {
  const data = await request<{ accessToken?: string; refreshToken?: string }>("/auth/otp/verify", {
    method: "POST",
    body: { sessionId, phone, otp },
  });
  const accessToken = str(data?.accessToken);
  if (!accessToken) throw new Error("The backend verified the code but returned no access token.");
  return { accessToken, refreshToken: str(data?.refreshToken) || null };
}

/**
 * Grants an admin role to a phone. The role is baked into the JWT when it is
 * issued, so this alone changes nothing for an existing token — the caller
 * must sign in again afterwards. The backend says as much in its response.
 */
export async function bootstrapAdmin(phone: string, secret: string, role = "super_admin") {
  await request("/admin/bootstrap", { method: "POST", query: { phone }, body: { secret, role } });
}

/** Reads the claims out of a JWT payload without verifying it (display only). */
export function decodeToken(token: string): { sub?: string; role?: string; phone?: string } {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return {};
  }
}

/* -------------------------------------------------------- token lifecycle */

/**
 * Access tokens live 15 minutes. Rather than making an operator sign in again
 * mid-review, swap an expired one using the refresh token from sign-in.
 */
async function refreshAccessToken(): Promise<string | null> {
  const { session, setTokens } = useStaffAuthStore.getState();
  if (!session?.refreshToken) return null;
  try {
    const data = await request<{ accessToken?: string; refreshToken?: string }>("/auth/refresh", {
      method: "POST",
      body: { refreshToken: session.refreshToken },
    });
    const accessToken = str(data?.accessToken);
    if (!accessToken) return null;
    setTokens(accessToken, str(data?.refreshToken) || session.refreshToken);
    return accessToken;
  } catch {
    // The refresh token is dead too — the caller surfaces the 401 and the
    // operator signs in again.
    return null;
  }
}

/** Runs an authenticated call, retrying once with a fresh token on 401. */
async function authed<T>(token: string, call: (t: string) => Promise<T>): Promise<T> {
  try {
    return await call(token);
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      const next = await refreshAccessToken();
      if (next) return call(next);
    }
    throw e;
  }
}

/* ------------------------------------------------------- partner approvals */

export async function kycQueue(status: KycStatus | "ALL", token: string): Promise<ApprovalRow[]> {
  return authed(token, async (t) => {
    const payload = await request("/admin/partners/kyc", {
      token: t,
      query: status === "ALL" ? undefined : { status },
    });
    return toArray(payload).map(normaliseRow);
  });
}

export async function approveKyc(partnerId: string, notes: string, token: string) {
  return authed(token, (t) =>
    request(`/admin/partners/${encodeURIComponent(partnerId)}/kyc/approve`, {
      method: "POST",
      token: t,
      body: { notes },
    }),
  );
}

export async function rejectKyc(partnerId: string, reason: string, token: string) {
  return authed(token, (t) =>
    request(`/admin/partners/${encodeURIComponent(partnerId)}/kyc/reject`, {
      method: "POST",
      token: t,
      body: { reason },
    }),
  );
}

/* -------------------------------------------------------- event moderation */

export type ModerationEvent = {
  id: string;
  name: string;
  status: string;
  category: string;
  venue: string;
  startAt: string;
  organiser: string;
  raw: Record<string, unknown>;
};

function normaliseEvent(item: unknown): ModerationEvent {
  const r = obj(item);
  const venue = obj(r.venue);
  const partner = obj(r.partner);
  return {
    id: str(r.id, r._id, r.eventId),
    name: str(r.name, r.title, "Untitled event"),
    status: str(r.status, r.moderationStatus, "PENDING_APPROVAL"),
    category: str(r.category),
    venue: str(venue.name, r.venueName),
    startAt: str(r.startAt, r.startsAt, r.startDate),
    organiser: str(r.organiser, partner.businessName, r.partnerName),
    raw: r,
  };
}

export async function eventModerationQueue(
  status: string,
  token: string,
): Promise<ModerationEvent[]> {
  return authed(token, async (t) => {
    const payload = await request("/admin/events/moderation", {
      token: t,
      query: status === "ALL" ? undefined : { status },
    });
    return toArray(payload).map(normaliseEvent);
  });
}

export async function approveEvent(eventId: string, token: string) {
  return authed(token, (t) =>
    request(`/admin/events/${encodeURIComponent(eventId)}/approve`, { method: "POST", token: t }),
  );
}

export async function rejectEvent(eventId: string, reason: string, token: string) {
  return authed(token, (t) =>
    request(`/admin/events/${encodeURIComponent(eventId)}/reject`, {
      method: "POST",
      token: t,
      body: { reason },
    }),
  );
}

/* --------------------------------------------------------------- analytics */

export async function analyticsOverview(token: string): Promise<Record<string, unknown>> {
  return authed(token, async (t) => obj(await request("/admin/analytics/overview", { token: t })));
}

/* ------------------------------------------------------------------- users */

export type AdminUser = {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  createdAt: string;
  raw: Record<string, unknown>;
};

export async function adminUsers(query: string, token: string): Promise<AdminUser[]> {
  return authed(token, async (t) => {
    const payload = await request("/admin/users", { token: t, query: { q: query || undefined } });
    return toArray(payload).map((item) => {
      const r = obj(item);
      return {
        id: str(r.id, r._id),
        name: str(r.name),
        phone: str(r.phone),
        email: str(r.email),
        role: str(r.role, "customer"),
        createdAt: str(r.createdAt, r.joinedAt),
        raw: r,
      };
    });
  });
}
