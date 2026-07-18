"use client";

import { useEffect, useRef, useState } from "react";

type TypeSpecimenProps = Readonly<{
  /** Utility name shown as the label, e.g. "text-heading". */
  label: string;
  /** The full utility class — passed literally so Tailwind can see it. */
  className: string;
  children: string;
}>;

/**
 * Renders one step of the type ramp and reports the metrics it actually
 * resolved to (size / line-height / letter-spacing / weight), measured from
 * its own computed style so the display can never drift from the tokens.
 */
export function TypeSpecimen({ label, className, children }: TypeSpecimenProps) {
  const sampleRef = useRef<HTMLParagraphElement>(null);
  const [metrics, setMetrics] = useState("");

  useEffect(() => {
    if (!sampleRef.current) {
      return;
    }
    const style = getComputedStyle(sampleRef.current);
    const letterSpacing = style.letterSpacing === "normal" ? "0" : style.letterSpacing;
    setMetrics(
      `${style.fontSize} / lh ${style.lineHeight} / ls ${letterSpacing} / w ${style.fontWeight}`,
    );
  }, [className]);

  return (
    <div className="flex flex-col gap-1 border-b py-3 last:border-b-0">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <code className="font-mono text-caption text-muted-foreground">{label}</code>
        <code className="font-mono text-caption text-muted-foreground">{metrics || "…"}</code>
      </div>
      <p ref={sampleRef} className={className}>
        {children}
      </p>
    </div>
  );
}
