"use client";

import { useMemo } from "react";
import { renderMathText } from "@/lib/flashcards/math";
import "katex/dist/katex.min.css";

export function MathText({ text, className = "", scrollMath = true }: { text: string; className?: string; scrollMath?: boolean }) {
  const html = useMemo(() => renderMathText(text), [text]);
  return <div dangerouslySetInnerHTML={{ __html: html }} className={`min-w-0 whitespace-pre-wrap break-words ${scrollMath ? "[&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden" : "[&_.katex-display]:overflow-visible"} ${className}`} />;
}
