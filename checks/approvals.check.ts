import { normaliseRow } from "../src/lib/services/approvalNormalise.ts";

let fail = 0;
const check = (name: string, cond: boolean) => {
  if (!cond) {
    fail++;
    console.log("FAIL:", name);
  }
};

// Flat shape — what the stub (and the collection's Submit KYC payload) implies.
const flat = normaliseRow({
  partnerId: "ptr_1",
  businessName: "CYLO Demo Kitchen",
  contactName: "Partner Owner",
  contactEmail: "partner@cylo.app",
  contactPhone: "+919900001111",
  status: "PENDING",
  submittedAt: "2026-08-13T00:00:00.000Z",
  fssaiNumber: "12345678901234",
  gstNumber: "29ABCDE1234F1Z5",
  panNumber: "ABCDE1234F",
  bankAccountNumber: "1234567890",
  bankIfsc: "HDFC0001234",
  cancelledChequeUrl: "https://cdn.cylo.app/kyc/cheque.pdf",
});
check("flat: partnerId", flat.partnerId === "ptr_1");
check("flat: businessName", flat.businessName === "CYLO Demo Kitchen");
check("flat: status", flat.status === "PENDING");
check("flat: fssai", flat.kyc.fssaiNumber === "12345678901234");
check("flat: ifsc", flat.kyc.bankIfsc === "HDFC0001234");
check("flat: cheque url", flat.kyc.cancelledChequeUrl?.startsWith("https://") === true);
check("flat: raw preserved", (flat.raw as Record<string, unknown>).gstNumber === "29ABCDE1234F1Z5");

// Nested shape — partner object plus a separate kyc object.
const nested = normaliseRow({
  id: "ptr_2",
  kycStatus: "PENDING",
  createdAt: "2026-08-01T00:00:00.000Z",
  partner: { businessName: "Indiranagar Social", contactName: "Meera Iyer" },
  kyc: { panNumber: "ZYXWV9876Q", bankAccountName: "Indiranagar Social" },
});
check("nested: id falls back to partnerId", nested.partnerId === "ptr_2");
check("nested: businessName from partner", nested.businessName === "Indiranagar Social");
check("nested: contactName from partner", nested.contactName === "Meera Iyer");
check("nested: status from kycStatus", nested.status === "PENDING");
check("nested: submittedAt from createdAt", nested.submittedAt === "2026-08-01T00:00:00.000Z");
check("nested: pan from kyc object", nested.kyc.panNumber === "ZYXWV9876Q");

// Minimal shape — must not crash, and must not invent values.
const bare = normaliseRow({ partnerId: "ptr_3" });
check("bare: id kept", bare.partnerId === "ptr_3");
check("bare: name placeholder is honest", bare.businessName === "Unnamed partner");
check("bare: contact blank not 'undefined'", bare.contactName === "" && bare.contactEmail === "");
check("bare: missing kyc stays undefined", bare.kyc.fssaiNumber === undefined);
check("bare: status defaults to PENDING", bare.status === "PENDING");

// Junk input must not throw.
let threw = false;
try {
  normaliseRow(null);
  normaliseRow("nonsense");
  normaliseRow(42);
} catch {
  threw = true;
}
check("junk input does not throw", !threw);
check("null yields empty id", normaliseRow(null).partnerId === "");

// A verbatim row from the deployed backend (ceylo-backend.onrender.com), so a
// change to the mapping that would break the real queue fails here first.
const live = normaliseRow({
  partnerId: "6a856b895432e374d33112ba",
  businessName: "Vijay PLTD",
  contactName: "vijay bodhne",
  contactPhone: "+917387941149",
  kycStatus: "PENDING",
  kyc: {
    fssaiNumber: "48462658498494",
    gstNumber: "dwd465454wd54",
    panNumber: "oppokmu891p",
    bankAccountName: "vijay mallya",
    bankAccountNumber: "632454187",
    bankIfsc: "564288dsqw464",
    _id: "6a856c535432e374d33112e0",
  },
  restaurant: {
    id: "6a856c235432e374d33112d3",
    name: "Vijay restaurent",
    cityId: "6a54e568f82610873d06b191",
    area: "Koregaun park",
    listingStatus: "PENDING_KYC",
  },
  submittedAt: "2026-08-19T08:41:55.283Z",
});
check("live: partnerId", live.partnerId === "6a856b895432e374d33112ba");
check("live: businessName", live.businessName === "Vijay PLTD");
check("live: kycStatus maps to status", live.status === "PENDING");
check("live: contact phone", live.contactPhone === "+917387941149");
check("live: no email is blank, not invented", live.contactEmail === "");
check("live: nested fssai", live.kyc.fssaiNumber === "48462658498494");
check("live: nested ifsc", live.kyc.bankIfsc === "564288dsqw464");
check("live: doc urls absent stay undefined", live.kyc.fssaiDocUrl === undefined);
check("live: restaurant name", live.restaurant?.name === "Vijay restaurent");
check("live: restaurant area", live.restaurant?.area === "Koregaun park");
check("live: listing status", live.restaurant?.listingStatus === "PENDING_KYC");
check("live: submittedAt", live.submittedAt === "2026-08-19T08:41:55.283Z");

// A dedicated kyc object must win over a stray same-named key on the row.
const shadowed = normaliseRow({
  partnerId: "ptr_4",
  panNumber: "STALE0000X",
  kyc: { panNumber: "CORRECT123Z" },
});
check("nested kyc beats a row-level key of the same name", shadowed.kyc.panNumber === "CORRECT123Z");

// Rows without a restaurant block must not fabricate one.
check("no restaurant block stays undefined", bare.restaurant === undefined);

console.log(fail === 0 ? "PASS: all 33 approval-normaliser checks" : `FAILED ${fail} checks`);
process.exitCode = fail === 0 ? 0 : 1;
