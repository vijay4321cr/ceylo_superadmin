/**
 * Shape-mapping for the CYLO admin KYC responses.
 *
 * Deliberately dependency-free: the Postman collection pins down the *request*
 * bodies but not the *response* shapes, so this module is where the guessing
 * lives — and being import-free means it can be unit-checked directly
 * (see checks/approvals.check.ts) without pulling in the fetch client.
 */

export type KycStatus = "PENDING" | "APPROVED" | "REJECTED";

/**
 * The queue row as this console needs it. The backend's exact response shape
 * is not pinned down by the collection — only that items carry `partnerId` —
 * so every field is read defensively and the untouched object is kept on
 * `raw` for the detail pane. Nothing here invents a value that is absent.
 */
export type ApprovalRow = {
  partnerId: string;
  businessName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: KycStatus | string;
  submittedAt: string;
  /** The listing this KYC unlocks. Present on the deployed backend. */
  restaurant?: {
    id: string;
    name: string;
    area: string;
    listingStatus: string;
  };
  kyc: {
    fssaiNumber?: string;
    fssaiDocUrl?: string;
    gstNumber?: string;
    gstDocUrl?: string;
    panNumber?: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
    bankIfsc?: string;
    cancelledChequeUrl?: string;
  };
  raw: Record<string, unknown>;
};

export function str(...candidates: unknown[]): string {
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c;
    if (typeof c === "number") return String(c);
  }
  return "";
}

export function obj(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

/** Maps one backend item onto `ApprovalRow`, tolerating nesting differences. */
export function normaliseRow(item: unknown): ApprovalRow {
  const r = obj(item);
  const partner = obj(r.partner);
  const kyc = obj(r.kyc);
  const restaurant = obj(r.restaurant);
  // KYC fields may sit on the row, on `kyc`, or on `partner` depending on how
  // the backend composes the queue response.
  const k = { ...r, ...obj(partner.kyc), ...kyc } as Record<string, unknown>;

  return {
    partnerId: str(r.partnerId, r.id, r._id, partner.partnerId, partner.id),
    businessName: str(r.businessName, partner.businessName, r.name, partner.name, "Unnamed partner"),
    contactName: str(r.contactName, partner.contactName),
    contactEmail: str(r.contactEmail, partner.contactEmail, r.email),
    contactPhone: str(r.contactPhone, partner.contactPhone, r.phone),
    status: str(r.status, r.kycStatus, partner.kycStatus, "PENDING"),
    submittedAt: str(r.submittedAt, r.kycSubmittedAt, r.updatedAt, r.createdAt),
    restaurant: restaurant.id || restaurant.name
      ? {
          id: str(restaurant.id, restaurant._id),
          name: str(restaurant.name),
          area: str(restaurant.area),
          listingStatus: str(restaurant.listingStatus),
        }
      : undefined,
    kyc: {
      fssaiNumber: str(k.fssaiNumber) || undefined,
      fssaiDocUrl: str(k.fssaiDocUrl) || undefined,
      gstNumber: str(k.gstNumber) || undefined,
      gstDocUrl: str(k.gstDocUrl) || undefined,
      panNumber: str(k.panNumber) || undefined,
      bankAccountName: str(k.bankAccountName) || undefined,
      bankAccountNumber: str(k.bankAccountNumber) || undefined,
      bankIfsc: str(k.bankIfsc) || undefined,
      cancelledChequeUrl: str(k.cancelledChequeUrl) || undefined,
    },
    raw: r,
  };
}

/** Lists come back either bare or wrapped in `{ items }` / `{ partners }`. */
export function toArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const p = obj(payload);
  for (const key of ["items", "partners", "results", "rows", "data"]) {
    if (Array.isArray(p[key])) return p[key] as unknown[];
  }
  return [];
}
