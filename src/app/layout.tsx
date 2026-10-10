import type { Metadata } from "next";
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      className={`${fredoka.variable} ${nunitoSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <ToastNotifications />
      </body>
    </html>
  );
}
