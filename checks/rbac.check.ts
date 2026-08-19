import { staffCan, staffNavItems, capabilityForPath, refundLimitCents, landingFor } from "../src/lib/staffRbac.ts";
import type { StaffRole } from "../src/lib/types.ts";
import type { StaffSession } from "../src/lib/stores/staffAuthStore.ts";

const s = (role: StaffRole): StaffSession => ({
  staffId: "x",
  phone: "+910000000000",
  role,
  backendRole: "super_admin",
  accessToken: "",
  refreshToken: null,
  signedInAt: "",
});
let fail = 0;
const check = (n: string, c: boolean) => { if (!c) { fail++; console.log("FAIL:", n); } };

// §6.2 matrix, row by row.
check("Super+Ops review applications", staffCan(s("super_admin"),"applications.review") && staffCan(s("ops"),"applications.review"));
check("Finance/Marketing/Support CANNOT reach the queue",
  !staffCan(s("finance"),"applications.review") && !staffCan(s("marketing"),"applications.review") && !staffCan(s("support"),"applications.review"));
check("Only Super+Ops verify KYC", staffCan(s("ops"),"kyc.verify") && !staffCan(s("finance"),"kyc.verify") && !staffCan(s("marketing"),"kyc.verify"));
check("Marketing can moderate, Finance cannot", staffCan(s("marketing"),"moderation.decide") && !staffCan(s("finance"),"moderation.decide"));
check("Support cannot set rates", !staffCan(s("support"),"commercials.set"));
check("Only Super+Finance set commission", staffCan(s("finance"),"commercials.set") && !staffCan(s("ops"),"commercials.set") && !staffCan(s("marketing"),"commercials.set"));
check("Marketing cannot run settlements", !staffCan(s("marketing"),"settlements.run"));
check("Finance cannot curate homepage", !staffCan(s("finance"),"marketing.curate"));
check("Only Super manages staff", staffCan(s("super_admin"),"staff.manage") && !staffCan(s("ops"),"staff.manage") && !staffCan(s("finance"),"staff.manage") && !staffCan(s("marketing"),"staff.manage") && !staffCan(s("support"),"staff.manage"));
check("Marketing/Support cannot view audit logs", !staffCan(s("marketing"),"audit.view") && !staffCan(s("support"),"audit.view"));
check("Super holds everything", (["applications.review","commercials.set","staff.manage","campaigns.send","trust.review"] as const).every(c => staffCan(s("super_admin"), c)));
check("No session = nothing", !staffCan(null,"applications.review"));

// Refund limits are real, not decorative.
check("Support refund capped at Rs 10,000", refundLimitCents(s("support")) === 1_000_000);
check("Finance uncapped", refundLimitCents(s("finance")) === null);
check("Super uncapped", refundLimitCents(s("super_admin")) === null);
check("Marketing cannot refund at all", refundLimitCents(s("marketing")) === 0);

// Route guard resolves the right capability, including dynamic segments.
check("queue path guarded", capabilityForPath("/admin/onboarding/queue") === "applications.review");
check("dynamic app path guarded", capabilityForPath("/admin/onboarding/app_1001") === "applications.review");
check("partner detail guarded", capabilityForPath("/admin/partners/ptr_503") === "applications.review");
check("settlements guarded", capabilityForPath("/admin/finance/settlements") === "settlements.run");
check("overview open to all staff", capabilityForPath("/admin/overview") === undefined);

// Nav is derived, so an unauthorised link can never render.
const financeNav = staffNavItems(s("finance")).flatMap(g => g.items.map(i => i.href));
check("Finance nav has no queue link", !financeNav.includes("/admin/onboarding/queue"));
check("Finance nav has settlements", financeNav.includes("/admin/finance/settlements"));
const mktNav = staffNavItems(s("marketing")).flatMap(g => g.items.map(i => i.href));
check("Marketing nav has no finance links", !mktNav.some(h => h.startsWith("/admin/finance")));
check("Marketing nav has collections", mktNav.includes("/admin/marketing/collections"));
check("Support nav = tickets + limited refunds only", (() => {
  const caps = staffNavItems(s("support")).flatMap(g=>g.items).map(i=>i.capability).filter(Boolean).sort();
  return JSON.stringify(caps) === JSON.stringify(["refunds.issue_limited","support.tickets"]);
})());
check("Support nav excludes settlements & commissions", (() => {
  const hrefs = staffNavItems(s("support")).flatMap(g=>g.items.map(i=>i.href));
  return !hrefs.includes("/admin/finance/settlements") && !hrefs.includes("/admin/finance/commissions");
})());
check("Super sees staff settings", staffNavItems(s("super_admin")).flatMap(g=>g.items.map(i=>i.href)).includes("/admin/settings/staff"));
check("Ops lands on the queue", landingFor("ops") === "/admin/onboarding/queue");

console.log(fail === 0 ? "PASS: all 28 RBAC checks" : `FAILED ${fail} checks`);

process.exitCode = fail === 0 ? 0 : 1;
