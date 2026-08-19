"use client";

import { useRef, useState } from "react";
import {
  Camera,
  Check,
  FileText,
  Loader2,
  RefreshCw,
  Trash2,
  Upload,
  X,
  AlertCircle,
  CalendarClock,
} from "lucide-react";
import { useT } from "@/lib/i18n/useT";
import { useOnboardingStore, type DraftDocument } from "@/lib/stores/onboardingStore";
import type { DocSpec } from "@/lib/srilanka";
import { inputDate } from "@/lib/format";
import { useNow } from "@/lib/useNow";
import { cn } from "@/lib/cn";

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPT = "application/pdf,image/jpeg,image/png,image/webp";

/**
 * One document row: drag/drop, file picker, or camera capture. The value is a
 * data URL in mock and a signed CDN URL against the real API — either way the
 * component stores a string, so this file does not change at swap time.
 */
export function DocUpload({ spec, readOnly }: { spec: DocSpec; readOnly?: boolean }) {
  const { t } = useT();
  const doc = useOnboardingStore((s) => s.draft.documents[spec.type]);
  const setDocument = useOnboardingStore((s) => s.setDocument);

  const now = useNow();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  async function accept(file: File | undefined) {
    if (!file) return;
    setError("");
    if (file.size > MAX_BYTES) return setError(t("docs.tooBig"));
    if (!ACCEPT.split(",").includes(file.type)) return setError(t("docs.badType"));

    setBusy(true);
    try {
      const fileUrl = await readAsDataUrl(file);
      setDocument(spec.type, {
        fileName: file.name,
        fileUrl,
        status: "pending",
        // Replacing a rejected document clears the rejection.
        expiresAt: doc?.expiresAt,
        uploadedAt: new Date().toISOString(),
      });
    } finally {
      setBusy(false);
    }
  }

  function setExpiry(value: string) {
    if (!doc) return;
    setDocument(spec.type, { ...doc, expiresAt: value ? new Date(value).toISOString() : undefined });
  }

  const expiryPast = !!doc?.expiresAt && new Date(doc.expiresAt).getTime() < now;
  const needsExpiry = spec.dateBound && doc && !doc.expiresAt;

  const state: "missing" | DraftDocument["status"] = doc?.status ?? "missing";

  return (
    <li
      className={cn(
        "rounded-tile border bg-paper p-3.5 transition",
        state === "rejected" ? "border-coral/50 bg-coral-tint/25" : "border-line",
        dragging && "border-ink bg-cream-deep",
      )}
      onDragOver={(e) => {
        if (readOnly) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        if (readOnly) return;
        e.preventDefault();
        setDragging(false);
        void accept(e.dataTransfer.files?.[0]);
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">
            {spec.label}
            {!spec.required && (
              <span className="ml-1.5 text-xs font-normal text-ink-faint">
                ({t("common.optional")})
              </span>
            )}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-ink-mute">{spec.hint}</p>
          {spec.perEvent && (
            <p className="mt-1 inline-flex items-center gap-1 rounded-chip bg-violet-tint px-2 py-0.5 text-[11px] text-ink">
              <CalendarClock className="size-3" aria-hidden />
              {t("docs.perEvent")}
            </p>
          )}
        </div>
        <DocStatusChip state={state} />
      </div>

      {state === "rejected" && doc?.rejectReason && (
        <p className="mt-2.5 rounded-md bg-coral-tint/70 px-2.5 py-2 text-xs text-ink">
          <span className="font-medium">{t("docs.rejectedNote")}</span> {doc.rejectReason}
        </p>
      )}

      {doc ? (
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex items-center gap-2.5 rounded-md border border-line-soft bg-sand-soft/60 px-2.5 py-2">
            <FileText className="size-4 shrink-0 text-ink-mute" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-xs text-ink">{doc.fileName}</span>
            {!readOnly && (
              <>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-chip p-1 text-ink-mute hover:bg-cream-deep hover:text-ink"
                  aria-label={t("common.replace")}
                >
                  <RefreshCw className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDocument(spec.type, undefined)}
                  className="rounded-chip p-1 text-ink-mute hover:bg-cream-deep hover:text-danger"
                  aria-label={t("common.remove")}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </>
            )}
          </div>

          {spec.dateBound && (
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-ink-soft">
                {t("docs.expiry")} <span className="text-coral">*</span>
              </span>
              <input
                type="date"
                disabled={readOnly}
                value={inputDate(doc.expiresAt)}
                onChange={(e) => setExpiry(e.target.value)}
                aria-invalid={expiryPast || !!needsExpiry}
                className={cn(
                  "h-10 rounded-tile border bg-paper px-3 text-sm text-ink focus:border-lime-deep focus:outline-none",
                  expiryPast || needsExpiry ? "border-danger" : "border-line",
                )}
              />
              {expiryPast && (
                <span role="alert" className="text-xs text-danger">
                  {t("docs.expiryPast")}
                </span>
              )}
              {needsExpiry && !expiryPast && (
                <span role="alert" className="text-xs text-danger">
                  {t("docs.expiryRequired")}
                </span>
              )}
            </label>
          )}
        </div>
      ) : (
        !readOnly && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="inline-flex h-10 items-center gap-1.5 rounded-chip border border-line bg-paper px-3 text-xs font-medium text-ink hover:bg-cream-deep sm:hidden"
            >
              <Camera className="size-3.5" aria-hidden />
              {t("docs.take")}
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="inline-flex h-10 items-center gap-1.5 rounded-chip border border-line bg-paper px-3 text-xs font-medium text-ink hover:bg-cream-deep"
            >
              {busy ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <Upload className="size-3.5" aria-hidden />
              )}
              {t("docs.choose")}
            </button>
          </div>
        )
      )}

      {error && (
        <p role="alert" className="mt-2 flex items-center gap-1.5 text-xs text-danger">
          <AlertCircle className="size-3.5" aria-hidden />
          {error}
        </p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => void accept(e.target.files?.[0] ?? undefined)}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => void accept(e.target.files?.[0] ?? undefined)}
      />
    </li>
  );
}

function DocStatusChip({ state }: { state: "missing" | DraftDocument["status"] }) {
  const { t } = useT();
  const map = {
    missing: { label: t("docs.missing"), cls: "bg-sand text-ink-mute", icon: null },
    pending: { label: t("docs.pending"), cls: "bg-peach-tint text-ink", icon: null },
    verified: {
      label: t("docs.verified"),
      cls: "bg-lime-tint text-ink",
      icon: <Check className="size-3" aria-hidden />,
    },
    rejected: {
      label: t("docs.rejected"),
      cls: "bg-coral-tint text-ink",
      icon: <X className="size-3" aria-hidden />,
    },
  } as const;
  const s = map[state];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-chip px-2 py-0.5 text-[11px] font-medium",
        s.cls,
      )}
    >
      {s.icon}
      {s.label}
    </span>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
