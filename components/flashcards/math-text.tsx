"use client";

import { useMemo } from "react";
import { renderMathText } from "@/lib/flashcards/math";
import "katex/dist/katex.min.css";

export function MathText({ text, className = "" }: { text: string; className?: string }) {
  const html = useMemo(() => renderMathText(text), [text]);
  return <div dangerouslySetInnerHTML={{ __html: html }} className={`min-w-0 whitespace-pre-wrap break-words [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden ${className}`} />;
}
