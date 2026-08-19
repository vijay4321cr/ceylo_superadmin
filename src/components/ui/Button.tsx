"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "ink";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-lime text-ink hover:bg-lime-deep border-transparent font-semibold",
  secondary: "bg-paper text-ink border-line hover:bg-cream-deep",
  ghost: "bg-transparent text-ink-soft border-transparent hover:bg-cream-deep",
  danger: "bg-danger text-white border-transparent hover:brightness-95 font-semibold",
  ink: "bg-ink text-cream border-transparent hover:bg-ink-soft font-semibold",
};

const SIZES: Record<Size, string> = {
  // 44px tall — an applicant taps this on a phone mid-service.
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

type Props = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  full?: boolean;
  href?: string;
  children?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  full = false,
  href,
  className,
  children,
  disabled,
  ...rest
}: Props) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-chip border transition-colors select-none",
    "disabled:opacity-45 disabled:pointer-events-none",
    VARIANTS[variant],
    SIZES[size],
    full && "w-full",
    className,
  );

  if (href && !disabled && !loading) {
    return (
      <Link href={href} className={classes}>
        {icon}
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}
