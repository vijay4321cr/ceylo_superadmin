"use client";

import { useId } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { toCents, fromCents } from "@/lib/format";

const CONTROL =
  "w-full rounded-tile border bg-paper px-3 text-ink placeholder:text-ink-faint " +
  "focus:outline-none focus:ring-2 focus:ring-lime-deep/40 focus:border-lime-deep transition";

/* ------------------------------------------------------------------ shell */

export function Field({
  label,
  hint,
  error,
  required,
  optional,
  children,
  htmlFor,
  className,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: string;
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink-soft">
          {label}
          {required && <span className="ml-1 text-coral">*</span>}
          {optional && <span className="ml-1.5 text-xs font-normal text-ink-faint">({optional})</span>}
        </label>
      )}
      {children}
      {error ? (
        <p role="alert" className="flex items-start gap-1.5 text-xs text-danger">
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-ink-mute">{hint}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ input */

export function Input({
  label,
  hint,
  error,
  required,
  optional,
  className,
  dense,
  ...rest
}: {
  label?: string;
  hint?: string;
  error?: string;
  optional?: string;
  dense?: boolean;
} & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      htmlFor={id}
      className={className}
    >
      <input
        id={id}
        aria-invalid={!!error}
        className={cn(CONTROL, dense ? "h-9 text-sm" : "h-11", error ? "border-danger" : "border-line")}
        {...rest}
      />
    </Field>
  );
}

export function Textarea({
  label,
  hint,
  error,
  required,
  optional,
  className,
  ...rest
}: {
  label?: string;
  hint?: string;
  error?: string;
  optional?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      htmlFor={id}
      className={className}
    >
      <textarea
        id={id}
        rows={4}
        aria-invalid={!!error}
        className={cn(CONTROL, "py-2.5 leading-relaxed", error ? "border-danger" : "border-line")}
        {...rest}
      />
    </Field>
  );
}

export function Select({
  label,
  hint,
  error,
  required,
  optional,
  options,
  placeholder,
  className,
  dense,
  ...rest
}: {
  label?: string;
  hint?: string;
  error?: string;
  optional?: string;
  dense?: boolean;
  placeholder?: string;
  options: { value: string; label: string }[];
} & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      optional={optional}
      htmlFor={id}
      className={className}
    >
      <select
        id={id}
        aria-invalid={!!error}
        className={cn(
          CONTROL,
          dense ? "h-9 text-sm" : "h-11",
          error ? "border-danger" : "border-line",
        )}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/** Money always comes in and goes out as integer LKR cents. */
export function MoneyInput({
  label,
  hint,
  error,
  required,
  valueCents,
  onChangeCents,
  className,
  dense,
  placeholder = "0.00",
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  valueCents: number;
  onChangeCents: (cents: number) => void;
  className?: string;
  dense?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={id} className={className}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-mute">
          Rs
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          aria-invalid={!!error}
          value={valueCents ? String(fromCents(valueCents)) : ""}
          onChange={(e) => onChangeCents(toCents(e.target.value))}
          className={cn(
            CONTROL,
            "pl-9 tabular-nums",
            dense ? "h-9 text-sm" : "h-11",
            error ? "border-danger" : "border-line",
          )}
        />
      </div>
    </Field>
  );
}

/* ------------------------------------------------------------- selection */

export function Checkbox({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-tile border border-line bg-paper p-3 transition",
        checked && "border-ink bg-cream-deep",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition",
          checked ? "border-ink bg-ink text-cream" : "border-line bg-paper",
        )}
      >
        {checked && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-ink-mute">{description}</span>}
      </span>
    </label>
  );
}

export function RadioGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  error,
  columns = 1,
}: {
  label?: string;
  value: T;
  options: { value: T; label: string; description?: string }[];
  onChange: (v: T) => void;
  error?: string;
  columns?: 1 | 2;
}) {
  return (
    <Field label={label} error={error}>
      <div
        role="radiogroup"
        className={cn("grid gap-2", columns === 2 ? "sm:grid-cols-2" : "grid-cols-1")}
      >
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={cn(
                "flex items-start gap-3 rounded-tile border p-3 text-left transition",
                active ? "border-ink bg-cream-deep" : "border-line bg-paper hover:bg-cream-deep/60",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition",
                  active ? "border-ink" : "border-line",
                )}
              >
                {active && <span className="size-2.5 rounded-full bg-ink" />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-ink">{o.label}</span>
                {o.description && (
                  <span className="mt-0.5 block text-xs text-ink-mute">{o.description}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </Field>
  );
}

/** Multi-select pill row — cuisines, occasions, channels. */
export function ChipSelect({
  label,
  options,
  selected,
  onToggle,
  error,
  hint,
}: {
  label?: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  error?: string;
  hint?: string;
}) {
  return (
    <Field label={label} error={error} hint={hint}>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const active = selected.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(o)}
              className={cn(
                "rounded-chip border px-3 py-1.5 text-sm transition",
                active
                  ? "border-ink bg-ink text-cream"
                  : "border-line bg-paper text-ink-soft hover:bg-cream-deep",
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
    </Field>
  );
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Days are 1–7, Monday first. Reused by dining hours and ferry schedules. */
export function WeekdayPicker({
  label,
  value,
  onChange,
  error,
}: {
  label?: string;
  value: number[];
  onChange: (days: number[]) => void;
  error?: string;
}) {
  return (
    <Field label={label} error={error}>
      <div className="flex flex-wrap gap-1.5">
        {WEEKDAYS.map((d, i) => {
          const day = i + 1;
          const active = value.includes(day);
          return (
            <button
              key={d}
              type="button"
              aria-pressed={active}
              onClick={() =>
                onChange(active ? value.filter((v) => v !== day) : [...value, day].sort())
              }
              className={cn(
                "h-10 w-12 rounded-tile border text-xs font-medium transition",
                active
                  ? "border-ink bg-ink text-cream"
                  : "border-line bg-paper text-ink-mute hover:bg-cream-deep",
              )}
            >
              {d}
            </button>
          );
        })}
      </div>
    </Field>
  );
}

export function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        {description && <p className="mt-0.5 text-xs text-ink-mute">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
          checked ? "border-ink bg-ink" : "border-line bg-sand-soft",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4.5 rounded-full bg-paper transition-all",
            checked ? "left-[22px]" : "left-0.5",
          )}
          style={{ width: 18, height: 18 }}
        />
      </button>
    </div>
  );
}
