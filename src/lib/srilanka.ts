/**
 * Sri Lanka localisation anchor — geography, identity validators, banks and
 * the §8 document matrix. Nothing India-specific lives here or anywhere else:
 * no PAN, no GST, no IFSC, no ₹.
 */

import type { DocumentType, Province, Vertical } from "./types";

export const TIMEZONE = "Asia/Colombo";

export const PROVINCES: Province[] = [
  "Western",
  "Central",
  "Southern",
  "Northern",
  "Eastern",
  "North Western",
  "North Central",
  "Uva",
  "Sabaragamuwa",
];

/** All 25 districts, mapped to their province — this drives Ops queue routing. */
export const DISTRICTS: { name: string; province: Province }[] = [
  { name: "Colombo", province: "Western" },
  { name: "Gampaha", province: "Western" },
  { name: "Kalutara", province: "Western" },
  { name: "Kandy", province: "Central" },
  { name: "Matale", province: "Central" },
  { name: "Nuwara Eliya", province: "Central" },
  { name: "Galle", province: "Southern" },
  { name: "Matara", province: "Southern" },
  { name: "Hambantota", province: "Southern" },
  { name: "Jaffna", province: "Northern" },
  { name: "Kilinochchi", province: "Northern" },
  { name: "Mannar", province: "Northern" },
  { name: "Vavuniya", province: "Northern" },
  { name: "Mullaitivu", province: "Northern" },
  { name: "Batticaloa", province: "Eastern" },
  { name: "Ampara", province: "Eastern" },
  { name: "Trincomalee", province: "Eastern" },
  { name: "Kurunegala", province: "North Western" },
  { name: "Puttalam", province: "North Western" },
  { name: "Anuradhapura", province: "North Central" },
  { name: "Polonnaruwa", province: "North Central" },
  { name: "Badulla", province: "Uva" },
  { name: "Monaragala", province: "Uva" },
  { name: "Ratnapura", province: "Sabaragamuwa" },
  { name: "Kegalle", province: "Sabaragamuwa" },
];

export const DISTRICT_NAMES = DISTRICTS.map((d) => d.name);

export function provinceForDistrict(district: string): Province | "" {
  return DISTRICTS.find((d) => d.name === district)?.province ?? "";
}

/** Ports served by the ferry vertical. */
export const PORTS = [
  "Colombo",
  "Kankesanthurai",
  "Galle",
  "Trincomalee",
  "Point Pedro",
  "Oluvil",
];

/** International sailings — passengers need a passport, per the booking rule. */
export const INTERNATIONAL_PORTS = ["Tuticorin (IN)", "Nagapattinam (IN)", "Malé (MV)"];

/* ------------------------------------------------------------------ banks */

export const BANKS: { name: string; code: string; branches: { name: string; code: string }[] }[] = [
  {
    name: "Bank of Ceylon",
    code: "7010",
    branches: [
      { name: "Colombo Fort", code: "001" },
      { name: "Kandy", code: "078" },
      { name: "Jaffna", code: "072" },
      { name: "Galle", code: "060" },
    ],
  },
  {
    name: "People's Bank",
    code: "7135",
    branches: [
      { name: "Head Office Colombo", code: "001" },
      { name: "Nugegoda", code: "015" },
      { name: "Batticaloa", code: "047" },
      { name: "Kurunegala", code: "031" },
    ],
  },
  {
    name: "Commercial Bank of Ceylon",
    code: "7056",
    branches: [
      { name: "Foreign Branch Colombo", code: "001" },
      { name: "Kollupitiya", code: "004" },
      { name: "Matara", code: "042" },
      { name: "Trincomalee", code: "066" },
    ],
  },
  {
    name: "Hatton National Bank",
    code: "7083",
    branches: [
      { name: "City Office Colombo", code: "002" },
      { name: "Kandy", code: "010" },
      { name: "Negombo", code: "018" },
      { name: "Anuradhapura", code: "025" },
    ],
  },
  {
    name: "Sampath Bank",
    code: "7278",
    branches: [
      { name: "Head Office Colombo", code: "001" },
      { name: "Wellawatte", code: "012" },
      { name: "Nuwara Eliya", code: "052" },
      { name: "Galle", code: "030" },
    ],
  },
  {
    name: "National Development Bank",
    code: "7214",
    branches: [
      { name: "Head Office Colombo", code: "001" },
      { name: "Kotahena", code: "008" },
    ],
  },
  {
    name: "Seylan Bank",
    code: "7287",
    branches: [
      { name: "Colombo Fort", code: "001" },
      { name: "Kandy", code: "020" },
      { name: "Jaffna", code: "064" },
    ],
  },
];

/* ------------------------------------------------------------- validators */

/**
 * NIC — accepts the old format (9 digits + V/X) and the new 12-digit format.
 * Validates shape only, never authenticity.
 */
export function isValidNic(value: string): boolean {
  const v = value.trim().toUpperCase().replace(/\s/g, "");
  if (/^\d{9}[VX]$/.test(v)) return true;
  if (/^\d{12}$/.test(v)) return true;
  return false;
}

/** Sri Lankan mobile: +94 7X XXX XXXX. Accepts 07X… and 947… shorthand too. */
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/[^\d+]/g, "");
  return (
    /^\+947\d{8}$/.test(digits) || /^07\d{8}$/.test(digits) || /^947\d{8}$/.test(digits)
  );
}

/** Normalise any accepted phone shape into canonical +947XXXXXXXX. */
export function normalisePhone(value: string): string {
  const digits = value.replace(/[^\d]/g, "");
  if (digits.startsWith("94")) return `+${digits}`;
  if (digits.startsWith("0")) return `+94${digits.slice(1)}`;
  if (digits.startsWith("7")) return `+94${digits}`;
  return value;
}

export function formatPhone(value: string): string {
  const n = normalisePhone(value).replace("+94", "");
  if (n.length !== 9) return value;
  return `+94 ${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5)}`;
}

/** Registrar of Companies BRN — e.g. PV 12345 / PB 4567 / a 6–10 char code. */
export function isValidBrn(value: string): boolean {
  return /^[A-Za-z]{0,3}\s?\d{4,10}$/.test(value.trim());
}

/** Inland Revenue TIN — 9 digits, sometimes shown with a trailing check digit. */
export function isValidTin(value: string): boolean {
  return /^\d{9}(\d{3})?$/.test(value.trim().replace(/[\s-]/g, ""));
}

/** VAT registration number — TIN followed by 7000/7001 style suffix. */
export function isValidVat(value: string): boolean {
  const v = value.trim().replace(/[\s-]/g, "");
  return v === "" || /^\d{9}(7\d{3})?$/.test(v);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function isValidAccountNumber(value: string): boolean {
  return /^\d{6,16}$/.test(value.trim().replace(/\s/g, ""));
}

/* -------------------------------------------------- §8 document matrix */

export type DocSpec = {
  type: DocumentType;
  /** i18n key under `docs.` — applicant-facing label. */
  labelKey: string;
  /** English label — the admin console is English-only. */
  label: string;
  hint: string;
  required: boolean;
  /** Date-bound: drives expiry reminders and the auto-flag on lapse. */
  dateBound: boolean;
  /** Events: a per-event document, re-collected each time, not per partner. */
  perEvent?: boolean;
  /** Only asked when a condition holds (alcohol served, VAT registered…). */
  conditional?: "vat" | "alcohol" | "tourist";
};

export const COMMON_DOCS: DocSpec[] = [
  {
    type: "brn_certificate",
    labelKey: "brn_certificate",
    label: "Business registration (ROC / BRN certificate)",
    hint: "Legal entity proof issued by the Registrar of Companies.",
    required: true,
    dateBound: false,
  },
  {
    type: "tin_certificate",
    labelKey: "tin_certificate",
    label: "TIN certificate (Inland Revenue)",
    hint: "Your Taxpayer Identification Number certificate.",
    required: true,
    dateBound: false,
  },
  {
    type: "vat_certificate",
    labelKey: "vat_certificate",
    label: "VAT registration certificate",
    hint: "Only where your turnover requires VAT registration.",
    required: false,
    dateBound: false,
    conditional: "vat",
  },
  {
    type: "signatory_nic",
    labelKey: "signatory_nic",
    label: "Signatory NIC (both sides) or passport",
    hint: "Identity of the person signing the merchant agreement.",
    required: true,
    dateBound: false,
  },
  {
    type: "bank_proof",
    labelKey: "bank_proof",
    label: "Bank proof (cancelled cheque / bank letter)",
    hint: "Must match the payout account exactly.",
    required: true,
    dateBound: false,
  },
];

export const DINING_DOCS: DocSpec[] = [
  {
    type: "trade_licence",
    labelKey: "trade_licence",
    label: "Local authority trade licence",
    hint: "Municipal Council, Urban Council or Pradeshiya Sabha. Renewed annually.",
    required: true,
    dateBound: true,
  },
  {
    type: "phi_certificate",
    labelKey: "phi_certificate",
    label: "Public Health Inspector (PHI) certificate",
    hint: "Health and sanitary clearance for the premises.",
    required: true,
    dateBound: true,
  },
  {
    type: "sltda_registration",
    labelKey: "sltda_registration",
    label: "SLTDA registration",
    hint: "Sri Lanka Tourism Development Authority — where the venue serves tourists.",
    required: false,
    dateBound: true,
    conditional: "tourist",
  },
  {
    type: "liquor_licence",
    labelKey: "liquor_licence",
    label: "Liquor licence",
    hint: "Only if you serve alcohol.",
    required: false,
    dateBound: true,
    conditional: "alcohol",
  },
];

export const FERRY_DOCS: DocSpec[] = [
  {
    type: "vessel_registration",
    labelKey: "vessel_registration",
    label: "Vessel registration certificate",
    hint: "Issued by the Merchant Shipping Secretariat.",
    required: true,
    dateBound: true,
  },
  {
    type: "seaworthiness_certificate",
    labelKey: "seaworthiness_certificate",
    label: "Seaworthiness / survey certificate",
    hint: "Current survey for each vessel you will sail.",
    required: true,
    dateBound: true,
  },
  {
    type: "slpa_clearance",
    labelKey: "slpa_clearance",
    label: "Passenger vessel licence / SLPA clearance",
    hint: "Clearance for every port you serve.",
    required: true,
    dateBound: true,
  },
  {
    type: "vessel_insurance",
    labelKey: "vessel_insurance",
    label: "Insurance — hull & machinery, P&I, passenger liability",
    hint: "Passenger liability cover is mandatory to sell tickets.",
    required: true,
    dateBound: true,
  },
  {
    type: "master_coc",
    labelKey: "master_coc",
    label: "Master's Certificate of Competency",
    hint: "On file for the master of each vessel.",
    required: true,
    dateBound: true,
  },
  {
    type: "safety_equipment_certificate",
    labelKey: "safety_equipment_certificate",
    label: "Safety equipment / life-saving appliance certificate",
    hint: "Life jackets, rafts and signalling equipment survey.",
    required: true,
    dateBound: true,
  },
];

/**
 * Events are the special case: the partner is approved once, but the
 * `perEvent` documents below are re-collected for every event that goes to
 * moderation before it can sell.
 */
export const EVENT_DOCS: DocSpec[] = [
  {
    type: "organiser_entity_proof",
    labelKey: "organiser_entity_proof",
    label: "Organiser entity proof",
    hint: "Proof the organising entity exists and is you.",
    required: true,
    dateBound: false,
  },
  {
    type: "venue_noc",
    labelKey: "venue_noc",
    label: "Venue permission / NOC",
    hint: "Collected per event, not once per partner.",
    required: true,
    dateBound: true,
    perEvent: true,
  },
  {
    type: "event_permit",
    labelKey: "event_permit",
    label: "Local authority event permit",
    hint: "Per event, from the council covering the venue.",
    required: true,
    dateBound: true,
    perEvent: true,
  },
  {
    type: "police_permit",
    labelKey: "police_permit",
    label: "Police permit for public gatherings",
    hint: "Per event, from the police division covering the venue.",
    required: true,
    dateBound: true,
    perEvent: true,
  },
  {
    type: "fire_safety_clearance",
    labelKey: "fire_safety_clearance",
    label: "Fire safety clearance for the venue",
    hint: "Current clearance held by the venue.",
    required: true,
    dateBound: true,
  },
  {
    type: "public_liability_insurance",
    labelKey: "public_liability_insurance",
    label: "Public liability insurance",
    hint: "Cover for attendees at your events.",
    required: true,
    dateBound: true,
  },
];

export const VERTICAL_DOCS: Record<Vertical, DocSpec[]> = {
  dining: DINING_DOCS,
  ferry: FERRY_DOCS,
  event: EVENT_DOCS,
};

/**
 * The document checklist for a set of verticals — this is what makes a
 * dining-only applicant never see a seaworthiness certificate.
 */
export function documentsFor(
  verticals: Vertical[],
  flags: { vatRegistered?: boolean; servesAlcohol?: boolean; servesTourists?: boolean } = {},
): DocSpec[] {
  const out: DocSpec[] = [...COMMON_DOCS];
  for (const v of verticals) out.push(...VERTICAL_DOCS[v]);

  return out.filter((d) => {
    if (d.conditional === "vat") return !!flags.vatRegistered;
    if (d.conditional === "alcohol") return !!flags.servesAlcohol;
    if (d.conditional === "tourist") return !!flags.servesTourists;
    return true;
  });
}

const ALL_SPECS: DocSpec[] = [...COMMON_DOCS, ...DINING_DOCS, ...FERRY_DOCS, ...EVENT_DOCS];

export function docSpec(type: DocumentType): DocSpec | undefined {
  return ALL_SPECS.find((d) => d.type === type);
}

export function docLabel(type: DocumentType): string {
  return docSpec(type)?.label ?? type;
}

export const CUISINES = [
  "Sri Lankan",
  "Seafood",
  "Rice & Curry",
  "South Indian",
  "Chinese",
  "Japanese",
  "Italian",
  "Continental",
  "Barbecue",
  "Cafe & Bakery",
  "Vegetarian",
  "Street Food",
];

export const EVENT_CATEGORIES = [
  "Music",
  "Theatre",
  "Comedy",
  "Festival",
  "Sports",
  "Conference",
  "Workshop",
  "Food & Drink",
];

export const DINING_OCCASIONS = [
  "Birthday",
  "Anniversary",
  "Business meal",
  "Date night",
  "Family gathering",
];
