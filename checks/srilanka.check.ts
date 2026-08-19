import { documentsFor, isValidNic, isValidPhone, isValidTin, isValidBrn, provinceForDistrict, DISTRICTS } from "../src/lib/srilanka.ts";

let fail = 0;
const check = (name: string, cond: boolean) => { if (!cond) { fail++; console.log("FAIL:", name); } };

// Vertical-aware document checklist (Phase 2 acceptance criterion)
const diningOnly = documentsFor(["dining"]).map(d => d.type);
check("dining-only excludes seaworthiness", !diningOnly.includes("seaworthiness_certificate"));
check("dining-only excludes vessel registration", !diningOnly.includes("vessel_registration"));
check("dining-only includes trade licence", diningOnly.includes("trade_licence"));
check("dining-only includes PHI", diningOnly.includes("phi_certificate"));
check("dining-only includes common BRN/TIN", diningOnly.includes("brn_certificate") && diningOnly.includes("tin_certificate"));
check("no VAT cert unless flagged", !diningOnly.includes("vat_certificate"));
check("VAT cert when flagged", documentsFor(["dining"], { vatRegistered: true }).map(d=>d.type).includes("vat_certificate"));
check("no liquor licence unless flagged", !diningOnly.includes("liquor_licence"));
check("liquor licence when flagged", documentsFor(["dining"], { servesAlcohol: true }).map(d=>d.type).includes("liquor_licence"));

const ferry = documentsFor(["ferry"]).map(d => d.type);
check("ferry gets all six vessel docs", ["vessel_registration","seaworthiness_certificate","slpa_clearance","vessel_insurance","master_coc","safety_equipment_certificate"].every(t => ferry.includes(t as never)));
check("ferry excludes PHI", !ferry.includes("phi_certificate"));

const ev = documentsFor(["event"]);
check("event per-event docs marked perEvent", ev.filter(d=>d.perEvent).map(d=>d.type).sort().join(",") === "event_permit,police_permit,venue_noc");

// NIC — both formats, §2.4
check("NIC old format", isValidNic("123456789V") && isValidNic("123456789X"));
check("NIC new 12-digit", isValidNic("200012345678"));
check("NIC rejects short", !isValidNic("12345678V"));
check("NIC rejects 11 digits", !isValidNic("20001234567"));
check("NIC rejects letters", !isValidNic("ABCDEFGHIV"));

// Phone +94
check("phone +94 form", isValidPhone("+94771234567"));
check("phone 07x form", isValidPhone("0771234567"));
check("phone spaced", isValidPhone("+94 77 123 4567"));
check("phone rejects Indian", !isValidPhone("+919812345678"));
check("phone rejects landline-length", !isValidPhone("+9477123456"));

// Tax identity — TIN not PAN
check("TIN 9 digits", isValidTin("123456789"));
check("TIN rejects PAN shape", !isValidTin("ABCDE1234F"));
check("BRN accepts PV form", isValidBrn("PV 123456"));

// Geography — all 25 districts, province lookup
check("25 districts seeded", DISTRICTS.length === 25);
check("Jaffna → Northern", provinceForDistrict("Jaffna") === "Northern");
check("Colombo → Western", provinceForDistrict("Colombo") === "Western");
check("Batticaloa → Eastern", provinceForDistrict("Batticaloa") === "Eastern");

console.log(fail === 0 ? "PASS: all 26 domain checks" : `FAILED ${fail} checks`);

process.exitCode = fail === 0 ? 0 : 1;
