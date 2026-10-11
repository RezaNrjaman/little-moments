"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type FadeInImageProps = {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
};

/**
 * FadeInImage (DESIGN.md section 15.2): the photo itself fades in once it has
 * finished downloading, so a slow photo never "pops" into a polaroid whose
 * reveal animation is already over.
 *
 * The img ships with opacity 0 (`.lm-photo` in globals.css) and only fades in
 * when React marks it loaded, following the same safety rules as `Reveal`:
 * - JavaScript disabled -> the <noscript> style in the root layout shows it.
 * - Already cached      -> checked after hydration, since onLoad would not
 *                          fire again for a photo that finished too early.
 * - Failed download     -> shown anyway so the frame is never left empty.
 */
export function FadeInImage({ src, alt, className, loading }: FadeInImageProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = imgRef.current;
    if (!img?.complete) return;
    // rAF keeps this asynchronous and gives the browser a painted frame.
    const frame = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      loading={loading}
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(true)}
      className={cn("lm-photo", loaded && "lm-photo-in", className)}
    />
  );
}
