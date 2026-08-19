/** Tiny class joiner — no dependency needed for what this app does. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
