import { redirect } from "next/navigation";
import { PasswordGate } from "@/components/auth/PasswordGate";
import { getSession } from "@/lib/auth/session";

/** Fully dynamic: it redirects based on the session cookie. */
export const instant = false;

/** `/` - Password Gate. An existing session goes straight to the timeline. */
export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/memories");

  return (
    <main>
      <PasswordGate />
    </main>
  );
}
