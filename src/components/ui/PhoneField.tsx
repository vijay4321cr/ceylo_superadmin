"use client";

import { useId, useMemo } from "react";
import { Field } from "./Field";
import { COUNTRIES, DEFAULT_COUNTRY, splitPhone } from "@/lib/phone";
import { cn } from "@/lib/cn";

export { COUNTRIES, DEFAULT_COUNTRY, splitPhone, isCompletePhone } from "@/lib/phone";
export type { Country } from "@/lib/phone";

/**
 * Phone entry as two controls that produce one E.164 value.
 *
 * The text input holds the national number only — no dial code, no spaces, no
 * brackets. Anything non-numeric is dropped as it is typed or pasted, and the
 * length is capped at what the chosen country uses, so the value handed to the
 * API is always clean.
 */
export function PhoneField({
  label = "Phone number",
  value,
  onChange,
  error,
  hint,
  required,
  disabled,
  autoFocus,
}: {
  label?: string;
  /** E.164, e.g. "+94771234567". */
  value: string;
  onChange: (e164: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const id = useId();
  const { country, national } = useMemo(() => splitPhone(value), [value]);
  const maxLength = Math.max(...country.lengths);

  function setCountry(iso: string) {
    const next = COUNTRIES.find((c) => c.iso === iso) ?? DEFAULT_COUNTRY;
    // Keep what was typed, but never more than the new country allows.
    const trimmed = national.slice(0, Math.max(...next.lengths));
    onChange(`${next.dial}${trimmed}`);
  }

  function setNational(raw: string) {
    const digits = raw.replace(/\D/g, "").slice(0, maxLength);
    onChange(`${country.dial}${digits}`);
  }

  const remaining = country.lengths.includes(national.length)
    ? null
    : `${maxLength - national.length} more digit${maxLength - national.length === 1 ? "" : "s"}`;

  return (
    <Field
      label={label}
      error={error}
      required={required}
      htmlFor={id}
      hint={
        error
          ? undefined
          : (hint ??
            (national.length === 0
              ? `${country.dial} · digits only, e.g. ${country.example}`
              : remaining
                ? `${country.dial} · ${remaining}`
                : `Will be sent as ${country.dial}${national}`))
      }
    >
      <div
        className={cn(
          "flex rounded-tile border bg-paper transition focus-within:border-lime-deep focus-within:ring-2 focus-within:ring-lime-deep/40",
          error ? "border-danger" : "border-line",
          disabled && "opacity-50",
        )}
      >
        <select
          aria-label="Country"
          disabled={disabled}
          value={country.iso}
          onChange={(e) => setCountry(e.target.value)}
          className="h-11 shrink-0 rounded-l-tile border-0 bg-transparent pl-3 pr-1 text-sm text-ink focus:outline-none"
        >
          {COUNTRIES.map((c) => (
            <option key={c.iso} value={c.iso}>
              {c.flag} {c.dial} {c.name}
            </option>
          ))}
        </select>

        <span aria-hidden className="my-2 w-px shrink-0 bg-line" />

        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          autoFocus={autoFocus}
          disabled={disabled}
          aria-invalid={!!error}
          placeholder={country.example}
          maxLength={maxLength}
          value={national}
          onChange={(e) => setNational(e.target.value)}
          onPaste={(e) => {
            // Paste often carries "+94 77 123 4567" — take the digits, and drop
            // a leading dial code if the user pasted a full international form.
            e.preventDefault();
            const pasted = e.clipboardData.getData("text");
            const bare = pasted.replace(/\D/g, "");
            const dialDigits = country.dial.replace("+", "");
            setNational(bare.startsWith(dialDigits) ? bare.slice(dialDigits.length) : bare);
          }}
          className="h-11 w-full min-w-0 rounded-r-tile border-0 bg-transparent px-3 tabular-nums text-ink placeholder:text-ink-faint focus:outline-none"
        />
      </div>
    </Field>
  );
}
