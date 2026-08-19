/**
 * End-to-end smoke test of the Partner approvals path against a real backend.
 *
 * Exercises exactly what the tab does, in order: OTP sign-in, token, then the
 * admin KYC queue. Read-only — it never approves or rejects anything.
 *
 *   node checks/live-smoke.mjs                  # through the app proxy on :3001
 *   BASE=https://ceylo-backend.onrender.com/api/v1 node checks/live-smoke.mjs
 *
 * The backend enforces a 30s OTP resend cooldown, so the send step retries.
 * Pass the code as OTP=... — it is a live credential and is not committed.
 */

const BASE = process.env.BASE ?? "http://localhost:3001/cylo-api";
const PHONE = process.env.PHONE ?? "+919876543210";
const OTP = process.env.OTP ?? "";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

function roleOf(jwt) {
  try {
    return JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString()).role;
  } catch {
    return "?";
  }
}

let failures = 0;
const step = (name, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "  ok  " : " FAIL "} ${name}${detail ? ` — ${detail}` : ""}`);
};

console.log(`Live smoke against ${BASE}\n`);

// 1. Health
const health = await call("/health");
step("health responds", health.status === 200 && health.json?.data?.status === "ok");

// 2. OTP send, retrying past the resend cooldown.
let sessionId = "";
for (let attempt = 1; attempt <= 5; attempt++) {
  const send = await call("/auth/otp/send", {
    method: "POST",
    body: { phone: PHONE, purpose: "login" },
  });
  sessionId = send.json?.data?.sessionId ?? "";
  if (sessionId) break;
  const code = send.json?.error?.code ?? "";
  if (code !== "OTP_RESEND_WAIT") {
    step("otp send", false, JSON.stringify(send.json?.error ?? send.status));
    break;
  }
  console.log(`       (resend cooldown, waiting 15s — attempt ${attempt}/5)`);
  await wait(15000);
}
step("otp send returns a sessionId", !!sessionId);

// 3. Verify
const verify = await call("/auth/otp/verify", {
  method: "POST",
  body: { sessionId, phone: PHONE, otp: OTP },
});
const token = verify.json?.data?.accessToken ?? "";
step("otp verify returns an access token", !!token);
step(
  "token carries an admin role",
  ["admin", "super_admin"].includes(roleOf(token)),
  `role=${roleOf(token)} (run Bootstrap admin, then sign in again, if this is 'customer')`,
);

// 4. The queue itself
const queue = await call("/admin/partners/kyc?status=PENDING", { token });
const rows = Array.isArray(queue.json?.data) ? queue.json.data : null;
step("kyc queue returns rows", rows !== null, rows ? `${rows.length} pending` : JSON.stringify(queue.json?.error));

if (rows) {
  for (const r of rows) {
    const kyc = [
      r.kyc?.fssaiNumber && "FSSAI",
      r.kyc?.gstNumber && "GST",
      r.kyc?.panNumber && "PAN",
      r.kyc?.bankAccountNumber && "Bank",
    ]
      .filter(Boolean)
      .join("/");
    console.log(
      `        • ${r.businessName} | ${r.restaurant?.name ?? "(no listing)"} | ${r.kycStatus} | ${kyc || "no KYC"}`,
    );
  }
  // Every row must carry what the tab keys off.
  step("every row has a partnerId", rows.every((r) => !!r.partnerId));
  step("every row has a status", rows.every((r) => !!(r.kycStatus ?? r.status)));
}

console.log(
  failures === 0
    ? "\nPASS: live approval path works end to end (read-only)"
    : `\nFAILED ${failures} step(s)`,
);
process.exitCode = failures === 0 ? 0 : 1;
