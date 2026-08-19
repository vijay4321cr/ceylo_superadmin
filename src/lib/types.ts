/**
 * Ceylo shared domain types.
 * Money is ALWAYS an integer count of LKR cents. Never a float, never a string.
 */

export type Vertical = "dining" | "ferry" | "event";

export type Province =
  | "Western"
  | "Central"
  | "Southern"
  | "Northern"
  | "Eastern"
  | "North Western"
  | "North Central"
  | "Uva"
  | "Sabaragamuwa";

export type Locale = "en" | "si" | "ta";

/* ------------------------------------------------------------------ staff */

export type StaffRole = "super_admin" | "ops" | "finance" | "marketing" | "support";

/** The console session is derived from a real backend JWT, so it is defined
 *  next to the store that holds it: stores/staffAuthStore.ts */

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  status: "active" | "invited" | "disabled";
  lastActive?: string;
};

/* ------------------------------------------------------------ application */

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "changes_requested"
  | "approved"
  | "live"
  | "paused"
  | "suspended";

export type ReviewNote = {
  field: string;
  note: string;
  at: string;
  /** Set once the applicant has edited the field the note points at. */
  resolvedAt?: string;
};

export type OnboardingApplication = {
  id: string;
  partnerId: string;
  /** One application per vertical — a partner may hold several. */
  vertical: Vertical;
  status: ApplicationStatus;
  /** 0–100. Drives the checklist rail and the Ops queue column. */
  completion: number;
  lastStep: string;
  submittedAt?: string;
  decidedAt?: string;
  reviewerId?: string;
  reviewNotes?: ReviewNote[];
  createdAt: string;
  /** Denormalised for the Ops queue so it never has to join. */
  businessName: string;
  district: string;
  contactName: string;
  contactPhone: string;
  scale?: string;
};

export type BusinessIdentity = {
  legalName: string;
  tradingName: string;
  /** Registrar of Companies business registration number. */
  brn: string;
  /** Inland Revenue Taxpayer Identification Number. */
  tin: string;
  vatNumber?: string;
  registeredAddress: string;
  district: string;
  province: Province | "";
  signatoryName: string;
  signatoryNic: string;
  contactEmail: string;
  contactPhone: string; // +94
};

export type DocumentType =
  // common
  | "brn_certificate"
  | "tin_certificate"
  | "vat_certificate"
  | "signatory_nic"
  | "bank_proof"
  // dining
  | "trade_licence"
  | "phi_certificate"
  | "sltda_registration"
  | "liquor_licence"
  // ferry
  | "vessel_registration"
  | "seaworthiness_certificate"
  | "slpa_clearance"
  | "vessel_insurance"
  | "master_coc"
  | "safety_equipment_certificate"
  // event
  | "organiser_entity_proof"
  | "venue_noc"
  | "event_permit"
  | "police_permit"
  | "fire_safety_clearance"
  | "public_liability_insurance";

export type DocumentStatus = "missing" | "pending" | "verified" | "rejected";

export type KycDocument = {
  id: string;
  applicationId: string;
  type: DocumentType;
  fileName: string;
  /** Data URL in mock; a signed CDN URL once the real API lands. */
  fileUrl: string;
  status: Exclude<DocumentStatus, "missing">;
  rejectReason?: string;
  /** Date-bound docs auto-remind before expiry and auto-flag on lapse. */
  expiresAt?: string;
  uploadedAt: string;
  verifiedBy?: string;
};

export type BankAccount = {
  applicationId: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  branchCode: string;
  branchName: string;
  pennyDropStatus: "pending" | "verified" | "failed";
  /** The reference the applicant must read back off their statement. */
  pennyDropReference?: string;
};

export type Commercials = {
  partnerId: string;
  scope: "partner" | "category" | "district";
  scopeValue?: string;
  commissionPct: number;
  convenienceFeeCents: number;
  settlementCycle: "weekly" | "fortnightly" | "monthly";
  whtPct: number;
  updatedAt?: string;
  updatedBy?: string;
};

export type Agreement = {
  partnerId: string;
  version: string;
  signedAt?: string;
  signatory: string;
  docUrl: string;
};

/* -------------------------------------------------------------- verticals */

export type DiningSetup = {
  about: string;
  cuisines: string[];
  priceForTwoCents: number;
  openTime: string;
  closeTime: string;
  openDays: number[];
  tableTypes: { name: string; seats: number; count: number }[];
  slotMinutes: number;
  confirmationMode: "instant" | "request";
  occasions: string[];
  cancellationPolicy: string;
};

export type FerrySetup = {
  operatorName: string;
  about: string;
  vessels: { name: string; regNo: string; classes: { name: string; capacity: number }[] }[];
  routes: { from: string; to: string; durationMins: number; international: boolean }[];
  fares: { className: string; fareCents: number }[];
  scheduleDays: number[];
  departures: string[];
  perUserCap: number;
  passportRequiredInternational: boolean;
  cancellationTiers: { hoursBefore: number; refundPct: number }[];
};

export type EventSetup = {
  organiserName: string;
  about: string;
  firstEvent: {
    title: string;
    category: string;
    venue: string;
    district: string;
    startsAt: string;
    seating: "ga" | "seated";
  };
  tiers: { name: string; priceCents: number; quantity: number }[];
  saleStart: string;
  saleEnd: string;
  perUserCap: number;
  refundPolicy: string;
};

export type VerticalSetup = {
  dining?: DiningSetup;
  ferry?: FerrySetup;
  event?: EventSetup;
};

/* ---------------------------------------------------------------- partner */

export type Partner = {
  id: string;
  businessName: string;
  legalName: string;
  district: string;
  province: Province | "";
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  verticals: Vertical[];
  /** Per-vertical status — dining can be live while events is still pending. */
  verticalStatus: Partial<Record<Vertical, ApplicationStatus>>;
  status: "active" | "paused" | "suspended" | "onboarding";
  healthScore: number;
  joinedAt: string;
  gmvCents: number;
  bookings30d: number;
  ratingAvg: number;
};

/* ------------------------------------------------------------- moderation */

export type ModerationItem = {
  id: string;
  type: "listing" | "event" | "review";
  refId: string;
  partnerId: string;
  partnerName: string;
  title: string;
  summary: string;
  status: "pending" | "approved" | "rejected";
  reviewerId?: string;
  notes?: string;
  submittedAt: string;
  decidedAt?: string;
  /** review items only */
  rating?: number;
  /** event items only */
  eventStartsAt?: string;
};

/* ---------------------------------------------------------------- finance */

export type SettlementLine = {
  bookingId: string;
  vertical: Vertical;
  date: string;
  grossCents: number;
  commissionCents: number;
  whtCents: number;
  netCents: number;
};

export type SettlementRun = {
  id: string;
  partnerId: string;
  partnerName: string;
  periodStart: string;
  periodEnd: string;
  cycle: Commercials["settlementCycle"];
  status: "draft" | "approved" | "paid" | "on_hold";
  grossCents: number;
  commissionCents: number;
  whtCents: number;
  netCents: number;
  lines: SettlementLine[];
  generatedAt: string;
  approvedBy?: string;
};

export type Payout = {
  id: string;
  settlementId: string;
  partnerId: string;
  partnerName: string;
  amountCents: number;
  status: "queued" | "processing" | "paid" | "failed";
  /** LankaPay/SLIPS or CEFTS transfer reference. */
  reference?: string;
  failureReason?: string;
  bankName: string;
  createdAt: string;
  paidAt?: string;
};

export type Refund = {
  id: string;
  bookingId: string;
  partnerId: string;
  partnerName: string;
  customerName: string;
  vertical: Vertical;
  amountCents: number;
  reason: string;
  status: "requested" | "approved" | "rejected" | "processed";
  requestedAt: string;
  decidedBy?: string;
  decidedAt?: string;
};

/* -------------------------------------------------------------- marketing */

export type Collection = {
  id: string;
  title: string;
  subtitle: string;
  vertical: Vertical | "mixed";
  district: string;
  order: number;
  itemCount: number;
  status: "live" | "draft";
};

export type Banner = {
  id: string;
  title: string;
  placement: "home_hero" | "home_strip" | "vertical_top";
  vertical: Vertical | "all";
  startsAt: string;
  endsAt: string;
  status: "live" | "scheduled" | "ended";
  clicks: number;
  impressions: number;
};

export type FeaturedSlot = {
  id: string;
  partnerId: string;
  partnerName: string;
  vertical: Vertical;
  district: string;
  slot: "home_top" | "category_top" | "search_boost";
  startsAt: string;
  endsAt: string;
  priceCents: number;
  status: "active" | "scheduled" | "expired";
};

export type Coupon = {
  id: string;
  code: string;
  kind: "percent" | "flat";
  value: number;
  maxDiscountCents?: number;
  minSpendCents: number;
  vertical: Vertical | "all";
  usageLimit: number;
  used: number;
  startsAt: string;
  endsAt: string;
  status: "active" | "scheduled" | "expired" | "paused";
};

export type Campaign = {
  id: string;
  name: string;
  channels: ("push" | "sms" | "email")[];
  segment: string;
  audienceSize: number;
  status: "draft" | "scheduled" | "sent";
  scheduledAt?: string;
  sentAt?: string;
  opened?: number;
  clicked?: number;
};

/* ---------------------------------------------------------------- support */

export type Ticket = {
  id: string;
  subject: string;
  body: string;
  from: "partner" | "customer";
  requesterName: string;
  partnerId?: string;
  partnerName?: string;
  bookingId?: string;
  vertical?: Vertical;
  priority: "low" | "normal" | "high" | "urgent";
  status: "open" | "pending" | "resolved" | "closed";
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
  messages: { author: string; authorType: "staff" | "partner" | "customer"; body: string; at: string }[];
};

/* ------------------------------------------------------------------ trust */

export type FraudSignal = {
  id: string;
  kind: "duplicate_account" | "velocity" | "scalper" | "payout_mismatch" | "doc_reuse";
  severity: "low" | "medium" | "high";
  subject: string;
  subjectId: string;
  evidence: string[];
  status: "open" | "cleared" | "actioned";
  detectedAt: string;
  actionedBy?: string;
  action?: string;
};

export type AuditEntry = {
  id: string;
  actorId: string;
  actorName: string;
  actorType: "staff" | "partner" | "system";
  action: string;
  entity: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  at: string;
};

/* --------------------------------------------------------- notifications */

export type NotificationEvent = {
  id: string;
  to: "applicant" | "staff";
  audienceId: string;
  channel: ("push" | "sms" | "email")[];
  title: string;
  body: string;
  at: string;
  read: boolean;
};
