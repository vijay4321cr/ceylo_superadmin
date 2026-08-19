/**
 * Minimal stand-in for the CYLO backend's Admin endpoints.
 *
 * Implements exactly the contract the Postman collection documents, so the
 * Partner approvals tab can be exercised without the real service running:
 *
 *   POST /api/v1/auth/otp/send
 *   POST /api/v1/auth/otp/verify            (STUB_OTP, default 000000)
 *   POST /api/v1/admin/bootstrap
 *   GET  /api/v1/admin/partners/kyc?status=
 *   POST /api/v1/admin/partners/:id/kyc/approve
 *   POST /api/v1/admin/partners/:id/kyc/reject
 *   GET  /api/v1/admin/analytics/overview
 *
 * Run with: npm run api:stub
 */
import { createServer } from "node:http";

const PORT = Number(process.env.PORT ?? 3002);
const DEV_OTP = process.env.STUB_OTP ?? "000000";
const TOKEN = "stub-access-token";
const BOOTSTRAP_SECRET = process.env.STUB_BOOTSTRAP_SECRET ?? "stub-secret";

const partners = [
  {
    partnerId: "ptr_stub_001",
    businessName: "CYLO Demo Kitchen",
    contactName: "Partner Owner",
    contactEmail: "partner@cylo.app",
    contactPhone: "+919900001111",
    status: "PENDING",
    submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    fssaiNumber: "12345678901234",
    fssaiDocUrl: "https://cdn.cylo.app/kyc/fssai.pdf",
    gstNumber: "29ABCDE1234F1Z5",
    gstDocUrl: "https://cdn.cylo.app/kyc/gst.pdf",
    panNumber: "ABCDE1234F",
    bankAccountName: "CYLO Demo Kitchen",
    bankAccountNumber: "1234567890",
    bankIfsc: "HDFC0001234",
    cancelledChequeUrl: "https://cdn.cylo.app/kyc/cheque.pdf",
  },
  {
    partnerId: "ptr_stub_002",
    businessName: "Indiranagar Social",
    contactName: "Meera Iyer",
    contactEmail: "meera@social.example",
    contactPhone: "+919900002222",
    status: "PENDING",
    submittedAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    fssaiNumber: "22334455667788",
    panNumber: "ZYXWV9876Q",
    bankAccountName: "Indiranagar Social",
    bankAccountNumber: "9988776655",
    bankIfsc: "ICIC0004321",
  },
  {
    partnerId: "ptr_stub_003",
    businessName: "Koramangala Brewworks",
    contactName: "Arjun Nair",
    contactEmail: "arjun@brewworks.example",
    contactPhone: "+919900003333",
    status: "APPROVED",
    submittedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    fssaiNumber: "99887766554433",
    gstNumber: "29ZZZZZ1111A1Z1",
    panNumber: "QWERT1234Y",
  },
];

function send(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname.replace(/^\/api\/v1/, "");
  const body = req.method === "GET" ? {} : await readBody(req);
  const authed = (req.headers.authorization ?? "").includes(TOKEN);

  if (path === "/auth/otp/send" && req.method === "POST") {
    return send(res, 200, { data: { sessionId: "stub-session-1" } });
  }

  if (path === "/auth/otp/verify" && req.method === "POST") {
    if (body.otp !== DEV_OTP) return send(res, 400, { message: "Incorrect code." });
    return send(res, 200, { data: { accessToken: TOKEN, refreshToken: "stub-refresh" } });
  }

  if (path === "/admin/bootstrap" && req.method === "POST") {
    if (body.secret !== BOOTSTRAP_SECRET)
      return send(res, 403, { message: "Bootstrap secret does not match." });
    return send(res, 200, { data: { phone: url.searchParams.get("phone"), role: body.role } });
  }

  // Everything below needs an admin token.
  if (path.startsWith("/admin/") && !authed) {
    return send(res, 401, { message: "Missing or invalid access token." });
  }

  if (path === "/admin/partners/kyc" && req.method === "GET") {
    const status = url.searchParams.get("status");
    const rows = status ? partners.filter((p) => p.status === status) : partners;
    return send(res, 200, { data: rows });
  }

  const decide = path.match(/^\/admin\/partners\/([^/]+)\/kyc\/(approve|reject)$/);
  if (decide && req.method === "POST") {
    const partner = partners.find((p) => p.partnerId === decide[1]);
    if (!partner) return send(res, 404, { message: "No such partner." });
    if (decide[2] === "reject" && !body.reason)
      return send(res, 400, { message: "A rejection reason is required." });
    partner.status = decide[2] === "approve" ? "APPROVED" : "REJECTED";
    partner.decisionNote = body.notes ?? body.reason ?? "";
    return send(res, 200, { data: { partnerId: partner.partnerId, status: partner.status } });
  }

  if (path === "/admin/analytics/overview" && req.method === "GET") {
    return send(res, 200, {
      data: {
        partnersPending: partners.filter((p) => p.status === "PENDING").length,
        partnersApproved: partners.filter((p) => p.status === "APPROVED").length,
      },
    });
  }

  send(res, 404, { message: `No stub route for ${req.method} ${path}` });
});

server.listen(PORT, () => {
  console.log(`CYLO API stub listening on http://localhost:${PORT}/api/v1`);
  console.log(`Stub OTP ${DEV_OTP} · bootstrap secret ${BOOTSTRAP_SECRET}`);
});
