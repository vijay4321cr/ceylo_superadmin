/**
 * Phone number handling: the country list, and turning an E.164 string into a
 * country plus national digits and back.
 *
 * Dependency-free on purpose so it can be unit-checked directly — see
 * checks/phone.check.ts.
 */

/**
 * Country dial codes, with the national number length each one expects.
 *
 * `lengths` is what makes the input strict: the field accepts only digits, and
 * only as many as the selected country actually uses, so a number is either
 * complete or visibly not.
 */
export type Country = {
  /** ISO 3166-1 alpha-2, used as the select value. */
  iso: string;
  name: string;
  dial: string;
  flag: string;
  /** Valid national-number lengths, excluding the dial code. */
  lengths: number[];
  example: string;
};

export const COUNTRIES: Country[] = [
  { iso: "LK", name: "Sri Lanka", dial: "+94", flag: "🇱🇰", lengths: [9], example: "771234567" },
  { iso: "IN", name: "India", dial: "+91", flag: "🇮🇳", lengths: [10], example: "9876543210" },
  { iso: "MV", name: "Maldives", dial: "+960", flag: "🇲🇻", lengths: [7], example: "7712345" },
  { iso: "AE", name: "United Arab Emirates", dial: "+971", flag: "🇦🇪", lengths: [9], example: "501234567" },
  { iso: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬", lengths: [8], example: "81234567" },
  { iso: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧", lengths: [10], example: "7400123456" },
  { iso: "US", name: "United States", dial: "+1", flag: "🇺🇸", lengths: [10], example: "2015550123" },
  { iso: "AU", name: "Australia", dial: "+61", flag: "🇦🇺", lengths: [9], example: "412345678" },
  { iso: "MY", name: "Malaysia", dial: "+60", flag: "🇲🇾", lengths: [9, 10], example: "123456789" },
  { iso: "QA", name: "Qatar", dial: "+974", flag: "🇶🇦", lengths: [8], example: "33123456" },
  { iso: "SA", name: "Saudi Arabia", dial: "+966", flag: "🇸🇦", lengths: [9], example: "501234567" },
];

/** Ceylo is a Sri Lankan product, so that is where the field starts. */
export const DEFAULT_COUNTRY = COUNTRIES[0];

/**
 * Splits an E.164 string into a country and its national digits. Longest dial
 * code wins, so +1 never shadows +94.
 */
export function splitPhone(e164: string): { country: Country; national: string } {
  const digits = (e164 ?? "").replace(/[^\d+]/g, "");
  const match = [...COUNTRIES]
    .sort((a, b) => b.dial.length - a.dial.length)
    .find((c) => digits.startsWith(c.dial));

  if (!match) return { country: DEFAULT_COUNTRY, national: digits.replace(/\D/g, "") };
  return { country: match, national: digits.slice(match.dial.length).replace(/\D/g, "") };
}

/** True when the national part is a length this country actually uses. */
export function isCompletePhone(e164: string): boolean {
  const { country, national } = splitPhone(e164);
  return country.lengths.includes(national.length);
}
