"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * PasswordGate (DESIGN.md section 19: "romantic lock screen").
 * The password is sent over HTTPS to the server, which verifies the hash
 * and sets an HttpOnly session cookie. Nothing is stored in localStorage.
 */
export function PasswordGate() {
  const router = useRouter();

  const floatStyle = (rotate: string): CSSProperties =>
    ({ "--float-rotate": rotate }) as CSSProperties;

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (!response.ok || !payload?.ok) {
        setError(payload?.error ?? "Buku kenangan belum bisa dibuka sekarang.");
        setIsSubmitting(false);
        return;
      }

      router.push("/memories");
      router.refresh();
    } catch {
      setError("Tidak dapat menghubungi server. Periksa koneksi kamu.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* Floating scrapbook stickers */}
      <span
        aria-hidden
        className="sticker animate-float absolute left-[8%] top-[12%] h-12 w-12 bg-butter text-lg"
        style={floatStyle("-8deg")}
      >
        ✿
      </span>
      <span
        aria-hidden
        className="sticker animate-float absolute right-[10%] top-[18%] h-14 w-14 bg-mint text-xl"
        style={floatStyle("10deg")}
      >
        ♡
      </span>
      <span
        aria-hidden
        className="sticker animate-float absolute bottom-[14%] left-[14%] h-11 w-11 bg-lavender text-base"
        style={floatStyle("6deg")}
      >
        ★
      </span>
      <span
        aria-hidden
        className="sticker animate-float absolute bottom-[10%] right-[12%] h-12 w-12 bg-pink text-lg"
        style={floatStyle("-6deg")}
      >
        ❀
      </span>

      <form
        onSubmit={handleSubmit}
        className="polaroid relative z-10 w-full max-w-sm animate-fade-in px-6 pb-8 pt-10 text-center sm:px-8"
      >
        <span className="tape" aria-hidden />

        <div className="sticker mx-auto mb-4 h-16 w-16 bg-pink text-2xl">
          <LockKeyhole className="h-7 w-7 text-ink" aria-hidden />
        </div>

        <h1 className="font-heading text-3xl font-semibold text-ink">
          <Heart
            className="mr-1 inline h-5 w-5 -translate-y-0.5 fill-[#f27d8d] text-[#f27d8d]"
            aria-hidden
          />
          Little Moments
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Koleksi kecil kenangan kita tersembunyi di balik gembok mungil ini.
        </p>

        <div className="mt-6 space-y-2 text-left">
          <Label htmlFor="password">Kata sandi</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Masukkan kata sandi kita"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "password-error" : undefined}
              required
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-soft transition-colors hover:text-ink"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {error ? (
          <p
            id="password-error"
            role="alert"
            className="mt-3 rounded-[var(--radius-sm)] bg-[#ffe3e6] px-3 py-2 text-xs font-medium text-[#a13d4a]"
          >
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          className="mt-5 w-full"
          size="lg"
          disabled={isSubmitting || password.length === 0}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Membuka...
            </>
          ) : (
            "Buka buku kita ♡"
          )}
        </Button>

        <p className="mt-4 text-[11px] text-ink-soft/80">
          Buku privat. Hanya untuk kita berdua.
        </p>
      </form>
    </div>
  );
}
