"use client";

import { useLayoutEffect, useRef } from "react";
import { MathText } from "./math-text";

// Fit normal content to a viewport-relative area. At the readable font-size
// floor, let unusually long prose grow the card instead of clipping or scrolling.
export function FitMathText({ text, compact = false, className = "" }: {
  text: string; compact?: boolean; className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = root.current;
    const content = container?.firstElementChild as HTMLElement | null;
    if (!container || !content) return;
    let frame = 0;
    let disposed = false;
    const fit = () => {
      const width = container.clientWidth;
      if (!width) return;
      const height = compact ? 112 : Math.max(160, Math.min(320, window.innerHeight * 0.32));
      const formulas = Array.from(content.querySelectorAll<HTMLElement>(".katex"));
      formulas.forEach((formula) => { formula.style.fontSize = ""; });
      let low = 14;
      let high = compact ? 14 : width < 480 ? 26 : 32;
      const fits = (size: number) => {
        content.style.fontSize = `${size}px`;
        return content.scrollHeight <= height && content.scrollWidth <= width + 1;
      };
      for (let step = 0; step < 9; step++) {
        const middle = (low + high) / 2;
        if (fits(middle)) low = middle;
        else high = middle;
      }
      content.style.fontSize = `${low}px`;
      // KaTeX matrices and display equations cannot wrap like ordinary prose.
      // Scale only oversized formulas, leaving the surrounding text readable.
      formulas.forEach((formula) => {
        const formulaWidth = Math.max(formula.offsetWidth, formula.scrollWidth);
        if (formulaWidth > width) {
          const size = parseFloat(getComputedStyle(formula).fontSize);
          formula.style.fontSize = `${size * (width - 2) / formulaWidth}px`;
        }
      });
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => { if (!disposed) fit(); });
    };
    fit();
    let previousWidth = container.clientWidth;
    const observer = new ResizeObserver(() => {
      if (container.clientWidth !== previousWidth) {
        previousWidth = container.clientWidth;
        schedule();
      }
    });
    observer.observe(container);
    window.addEventListener("resize", schedule);
    document.fonts.addEventListener("loadingdone", schedule);
    void document.fonts.ready.then(() => { if (!disposed) schedule(); });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      document.fonts.removeEventListener("loadingdone", schedule);
    };
  }, [text, compact]);

  return <div ref={root} className={`w-full min-w-0 ${className}`}>
    <MathText text={text} scrollMath={false} className="w-full leading-relaxed [overflow-wrap:anywhere]" />
  </div>;
}
