import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { LocaleHtmlSync } from "@/lib/i18n/LocaleHtmlSync";
import { ToastHost } from "@/components/ui/Toast";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

/**
 * Display and script faces are SELF-HOSTED on purpose.
 *
 * Sinhala and Tamil are not decoration here — they are two of Sri Lanka's
 * official languages and the whole reason the onboarding surface exists. A
 * build-time fetch from fonts.googleapis.com makes both the build and the
 * script rendering depend on a third party being reachable, which has already
 * broken once. These `.woff2` files are the Google Fonts subsets, committed
 * to the repo: Noto Sans Sinhala (U+0D81–0DF4), Noto Sans Tamil (U+0B82–0BFA)
 * and Bricolage Grotesque (latin). Latin glyphs come from Geist either way.
 */
const bricolage = localFont({
  src: "./fonts/BricolageGrotesque-latin.woff2",
  variable: "--font-bricolage",
  display: "swap",
  weight: "500 700",
});

const notoSinhala = localFont({
  src: "./fonts/NotoSansSinhala-subset.woff2",
  variable: "--font-noto-sinhala",
  display: "swap",
  weight: "400 600",
  fallback: ["Iskoola Pota", "Nirmala UI", "sans-serif"],
});

const notoTamil = localFont({
  src: "./fonts/NotoSansTamil-subset.woff2",
  variable: "--font-noto-tamil",
  display: "swap",
  weight: "400 600",
  fallback: ["Nirmala UI", "Latha", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Ceylo · Partner platform",
  description:
    "Ceylo — list your restaurant, ferry service or events on Sri Lanka's booking marketplace.",
};

export const viewport: Viewport = {
  themeColor: "#faf7f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${notoSinhala.variable} ${notoTamil.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <LocaleHtmlSync />
        {children}
        <ToastHost />
      </body>
    </html>
  );
}
