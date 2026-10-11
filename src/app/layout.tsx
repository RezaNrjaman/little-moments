import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Fredoka, Nunito_Sans } from "next/font/google";
import { ToastNotifications } from "@/components/scrapbook/ToastNotifications";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Little Moments",
  description: "Buku kecil privat kita berdua - foto, cerita, dan kenangan.",
  // This scrapbook is private: never index it in search engines.
  robots: { index: false, follow: false },
};

/**
 * Mobile-first viewport (PRD section 10: responsive web).
 * `viewportFit: "cover"` lets the scrapbook use the full screen on notched
 * phones; safe areas are respected through the `safe-*` helpers in
 * globals.css. Zoom is intentionally left enabled for accessibility.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fff7f0",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      className={`${fredoka.variable} ${nunitoSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Photos stay hidden until `Reveal` / `FadeInImage` animate them in.
            Without JavaScript nothing ever triggers that, so show them plainly. */}
        <noscript>
          <style>{`.lm-reveal{opacity:1!important;transform:none!important}.lm-photo{opacity:1!important}`}</style>
        </noscript>
        {children}
        <ToastNotifications />
      </body>
    </html>
  );
}
