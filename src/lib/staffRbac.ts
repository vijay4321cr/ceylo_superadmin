/**
 * Ceylo STAFF access control. Deliberately separate from any partner-side
 * `can()` — a partner permission must never be able to satisfy a staff check.
 */

import type { StaffRole } from "./types";
import type { StaffSession } from "./stores/staffAuthStore";

export type Capability =
  | "applications.review"
  | "kyc.verify"
  | "partners.suspend"
  | "moderation.decide"
  | "commercials.set"
  | "settlements.run"
  | "refunds.issue"
  | "refunds.issue_limited"
  | "marketing.curate"
  | "campaigns.send"
  | "staff.manage"
  | "audit.view"
  | "support.tickets"
  | "trust.review"
  | "analytics.view";

/** §6.2, verbatim. Super Admin is handled as "everything" below. */
const MATRIX: Record<Capability, StaffRole[]> = {
  "applications.review": ["super_admin", "ops"],
  "kyc.verify": ["super_admin", "ops"],
  "partners.suspend": ["super_admin", "ops"],
  "moderation.decide": ["super_admin", "ops", "marketing"],
  "commercials.set": ["super_admin", "finance"],
  "settlements.run": ["super_admin", "finance"],
  "refunds.issue": ["super_admin", "finance"],
  // Support may refund, but only inside a value limit — see REFUND_LIMITS.
  "refunds.issue_limited": ["super_admin", "finance", "support"],
  "marketing.curate": ["super_admin", "marketing"],
  "campaigns.send": ["super_admin", "marketing"],
  "staff.manage": ["super_admin"],
  "audit.view": ["super_admin", "ops", "finance"],
  "support.tickets": ["super_admin", "ops", "support"],
  "trust.review": ["super_admin", "ops"],
  "analytics.view": ["super_admin", "ops", "finance", "marketing"],
};

/** The cap that makes "Issue refunds — within limit" real rather than a label. */
export const REFUND_LIMITS: Partial<Record<StaffRole, number>> = {
  support: 1_000_000, // Rs 10,000 in cents
};

export function staffCan(session: StaffSession | null, capability: Capability): boolean {
  if (!session) return false;
  if (session.role === "super_admin") return true;
  return MATRIX[capability]?.includes(session.role) ?? false;
}

/** Rs cap on a single refund for this role, or null for no cap. */
export function refundLimitCents(session: StaffSession | null): number | null {
  if (!session) return 0;
  if (session.role === "super_admin") return null;
  if (staffCan(session, "refunds.issue")) return null;
  return REFUND_LIMITS[session.role] ?? 0;
}

export const ROLE_LABEL: Record<StaffRole, string> = {
  super_admin: "Super Admin",
  ops: "Ops / Partner Success",
  finance: "Finance",
  marketing: "Marketing",
  support: "Support",
};

export const ROLE_SHORT: Record<StaffRole, string> = {
  super_admin: "Super Admin",
  ops: "Ops",
  finance: "Finance",
  marketing: "Marketing",
  support: "Support",
};

/* ------------------------------------------------------------ navigation */

export type NavItem = {
  href: string;
  label: string;
  /** lucide icon name, resolved by StaffShell. */
  icon: string;
  capability?: Capability;
};

export type NavGroup = { label: string; items: NavItem[] };

const ALL_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/admin/overview", label: "Overview", icon: "LayoutDashboard" }],
  },
  {
    label: "Onboarding",
    items: [
      {
        href: "/admin/onboarding/queue",
        label: "Application queue",
        icon: "Inbox",
        capability: "applications.review",
      },
      {
        href: "/admin/partners",
        label: "Partners",
        icon: "Store",
        capability: "applications.review",
      },
      {
        // Live backend: approves partners who already registered and submitted KYC.
        href: "/admin/approvals",
        label: "Partner approvals",
        icon: "BadgeCheck",
        capability: "kyc.verify",
      },
      {
        href: "/admin/users",
        label: "Users",
        icon: "Users",
        capability: "applications.review",
      },
      {
        href: "/admin/onboarding/expiry",
        label: "Document expiry",
        icon: "CalendarClock",
        capability: "kyc.verify",
      },
    ],
  },
  {
    label: "Moderation",
    items: [
      {
        href: "/admin/moderation/listings",
        label: "Listings",
        icon: "ClipboardList",
        capability: "moderation.decide",
      },
      {
        href: "/admin/moderation/events",
        label: "Events",
        icon: "Ticket",
        capability: "moderation.decide",
      },
      {
        href: "/admin/moderation/reviews",
        label: "Reviews",
        icon: "MessageSquare",
        capability: "moderation.decide",
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        href: "/admin/finance/commissions",
        label: "Commissions",
        icon: "Percent",
        capability: "commercials.set",
      },
      {
        href: "/admin/finance/settlements",
        label: "Settlements",
        icon: "Receipt",
        capability: "settlements.run",
      },
      {
        href: "/admin/finance/payouts",
        label: "Payouts",
        icon: "Banknote",
        capability: "settlements.run",
      },
      {
        href: "/admin/finance/refunds",
        label: "Refunds",
        icon: "RotateCcw",
        capability: "refunds.issue_limited",
      },
    ],
  },
  {
    label: "Marketing",
    items: [
      {
        href: "/admin/marketing/collections",
        label: "Collections",
        icon: "LayoutGrid",
        capability: "marketing.curate",
      },
      {
        href: "/admin/marketing/banners",
        label: "Banners",
        icon: "Image",
        capability: "marketing.curate",
      },
      {
        href: "/admin/marketing/featured",
        label: "Featured slots",
        icon: "Star",
        capability: "marketing.curate",
      },
      {
        href: "/admin/marketing/coupons",
        label: "Coupons",
        icon: "TicketPercent",
        capability: "marketing.curate",
      },
      {
        href: "/admin/marketing/campaigns",
        label: "Campaigns",
        icon: "Send",
        capability: "campaigns.send",
      },
    ],
  },
  {
    label: "Support",
    items: [
      {
        href: "/admin/support/tickets",
        label: "Tickets",
        icon: "LifeBuoy",
        capability: "support.tickets",
      },
    ],
  },
  {
    label: "Trust & insight",
    items: [
      {
        href: "/admin/trust/fraud",
        label: "Fraud signals",
        icon: "ShieldAlert",
        capability: "trust.review",
      },
      {
        href: "/admin/audit-logs",
        label: "Audit logs",
        icon: "ScrollText",
        capability: "audit.view",
      },
      {
        href: "/admin/analytics/funnels",
        label: "Funnels",
        icon: "Filter",
        capability: "analytics.view",
      },
      {
        href: "/admin/analytics/gmv",
        label: "GMV",
        icon: "TrendingUp",
        capability: "analytics.view",
      },
      {
        href: "/admin/analytics/cohorts",
        label: "Cohorts",
        icon: "Users",
        capability: "analytics.view",
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        href: "/admin/settings/staff",
        label: "Staff",
        icon: "UserCog",
        capability: "staff.manage",
      },
      {
        href: "/admin/settings/roles",
        label: "Roles",
        icon: "KeyRound",
        capability: "staff.manage",
      },
      { href: "/admin/catalog/districts", label: "Districts", icon: "MapPin" },
      { href: "/admin/catalog/categories", label: "Categories", icon: "Tags" },
    ],
  },
];

/** The nav a given staff member actually sees. Empty groups drop out. */
export function staffNavItems(session: StaffSession | null): NavGroup[] {
  if (!session) return [];
  return ALL_NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => !i.capability || staffCan(session, i.capability)),
  })).filter((g) => g.items.length > 0);
}

/** Guards a route: which capability does this path need? */
export function capabilityForPath(path: string): Capability | undefined {
  for (const group of ALL_NAV) {
    for (const item of group.items) {
      if (path === item.href || path.startsWith(item.href + "/")) return item.capability;
    }
  }
  if (path.startsWith("/admin/onboarding/")) return "applications.review";
  if (path.startsWith("/admin/partners/")) return "applications.review";
  if (path.startsWith("/admin/support/")) return "support.tickets";
  return undefined;
}

/** Where a role lands after login — each role's own front door. */
export function landingFor(role: StaffRole): string {
  switch (role) {
    case "ops":
      return "/admin/onboarding/queue";
    case "finance":
      return "/admin/finance/settlements";
    case "marketing":
      return "/admin/marketing/collections";
    case "support":
      return "/admin/support/tickets";
    default:
      return "/admin/overview";
  }
}

/**
 * Routes actually served by the Ceylo backend today. Everything else in the
 * nav renders a ComingSoon page naming the endpoints it needs, so the
 * information architecture stays visible without inventing data behind it.
 */
export const LIVE_ROUTES = new Set([
  "/admin/overview",
  "/admin/approvals",
  "/admin/moderation/events",
  "/admin/settings/roles",
  "/admin/users",
]);
