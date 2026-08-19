"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Focus-trapped dialog. Escape closes, focus returns to the opener, and the
 * whole thing is keyboard-navigable — staff run the review pane from the
 * keyboard all day.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: "sm" | "md" | "lg";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement as HTMLElement;

    const panel = panelRef.current;
    const firstControl = panel?.querySelector<HTMLElement>(
      "input, textarea, select, button:not([data-close])",
    );
    if (firstControl) firstControl.focus();
    else panel?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const items = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      openerRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-3xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-ink/40 anim-fade"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "anim-pop relative z-10 flex max-h-[90vh] w-full flex-col rounded-t-tile border border-line bg-paper shadow-pop sm:rounded-tile",
          widths[width],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-ink-mute">{description}</p>}
          </div>
          <button
            type="button"
            data-close
            onClick={onClose}
            aria-label="Close"
            className="rounded-chip p-1 text-ink-mute hover:bg-cream-deep hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-line bg-sand-soft/50 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
