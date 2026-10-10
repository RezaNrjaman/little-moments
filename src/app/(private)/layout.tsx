import type { Metadata } from "next";
import { requirePageSession } from "@/lib/auth/session";
import { ScrapbookHeader } from "@/components/scrapbook/ScrapbookHeader";
import { FallingPetals } from "@/components/scrapbook/FallingPetals";
import { getScrapbookSettings } from "@/features/settings/queries";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * This whole group is session protected and therefore fully dynamic:
 * allow a blocking dynamic render instead of prerendering (Next.js 16).
 */
export const instant = false;

/**
 * Private route group (PRD section 9.2).
 *
 * The group only organises files - it does NOT replace authentication.
 * This layout validates the session server side on every private page,
 * and every Server Action / Route Handler validates it again by itself.
 */
export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePageSession();

  // The header is decorative: if the settings row cannot be read we still
  // render the cover with defaults, then let the page-level error boundary
  // display a friendly, actionable error (instead of a blank app shell).
  let coupleName: string = siteConfig.defaultCoupleName;
  let introMessage: string = siteConfig.defaultIntroMessage;

  try {
    const settings = await getScrapbookSettings();
    coupleName = settings.couple_name;
    introMessage = settings.intro_message;
  } catch {
    // Keep the defaults above.
  }

  return (
    <div className="safe-page-bottom flex min-h-[100dvh] flex-col">
      <FallingPetals />
      <ScrapbookHeader coupleName={coupleName} introMessage={introMessage} />
      <main className="flex-1">{children}</main>

      <footer className="pb-4 pt-10 text-center text-[11px] text-ink-soft/70">
        Little Moments - buku kecil privat kita berdua ♡
      </footer>
    </div>
  );
}
