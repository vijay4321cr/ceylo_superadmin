import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  splitPhone,
  isCompletePhone,
} from "../src/lib/phone.ts";

let fail = 0;
const check = (name: string, cond: boolean) => {
  if (!cond) {
    fail++;
    console.log("FAIL:", name);
  }
};

// Splitting an E.164 value back into its parts.
check("splits a Sri Lankan number", (() => {
  const { country, national } = splitPhone("+94771234567");
  return country.iso === "LK" && national === "771234567";
})());

check("splits an Indian number", (() => {
  const { country, national } = splitPhone("+919876543210");
  return country.iso === "IN" && national === "9876543210";
})());

// The reason longest-prefix matching matters: +1 must not shadow +91 or +94.
check("+1 does not shadow +91", splitPhone("+919876543210").country.iso === "IN");
check("+1 does not shadow +94", splitPhone("+94771234567").country.iso === "LK");
check("a genuine +1 number still resolves", (() => {
  const { country, national } = splitPhone("+12015550123");
  return country.iso === "US" && national === "2015550123";
})());
check("+960 beats +96 prefixes", splitPhone("+9607712345").country.iso === "MV");

// Formatting noise must never survive.
check("strips spaces", splitPhone("+94 77 123 4567").national === "771234567");
check("strips dashes and brackets", splitPhone("+91-98765-43210").national === "9876543210");
check("strips a pasted (201) 555-0123", splitPhone("+1 (201) 555-0123").national === "2015550123");

// Empty and unknown input must not throw or invent a country.
check("empty value falls back to the default country", (() => {
  const { country, national } = splitPhone("");
  return country.iso === DEFAULT_COUNTRY.iso && national === "";
})());
check("dial code alone yields no national digits", splitPhone("+94").national === "");
check("unknown dial code keeps the digits", splitPhone("+99912345").national.length > 0);

// Completeness is per country, not a single global rule.
check("complete LK number", isCompletePhone("+94771234567"));
check("LK number one digit short is incomplete", !isCompletePhone("+9477123456"));
check("LK number one digit long is incomplete", !isCompletePhone("+947712345678"));
check("complete IN number", isCompletePhone("+919876543210"));
check("IN number at LK length is incomplete", !isCompletePhone("+91987654321"));
check("complete MV number is only 7 digits", isCompletePhone("+9607712345"));
check("empty is not complete", !isCompletePhone(""));
check("dial code alone is not complete", !isCompletePhone("+94"));

// A country allowing two lengths accepts both.
check("MY accepts 9 digits", isCompletePhone("+60123456789".slice(0, 3 + 9)));
check("MY accepts 10 digits", isCompletePhone("+601234567890"));

// The country table itself must stay coherent.
check("every dial code starts with +", COUNTRIES.every((c) => c.dial.startsWith("+")));
check("every country has at least one length", COUNTRIES.every((c) => c.lengths.length > 0));
check(
  "every example matches one of that country's lengths",
  COUNTRIES.every((c) => c.lengths.includes(c.example.replace(/\D/g, "").length)),
);
check("iso codes are unique", new Set(COUNTRIES.map((c) => c.iso)).size === COUNTRIES.length);
check("default country is in the list", COUNTRIES.includes(DEFAULT_COUNTRY));

console.log(fail === 0 ? "PASS: all 26 phone checks" : `FAILED ${fail} checks`);
process.exitCode = fail === 0 ? 0 : 1;
