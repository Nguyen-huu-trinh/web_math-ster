"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Layers3, LoaderCircle } from "lucide-react";
import type { FlashcardActionResult } from "@/types/flashcards";

export const pageClass = "min-w-0 space-y-8 text-slate-900";
export const heroClass = "relative isolate flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-3xl border border-slate-700 bg-[radial-gradient(ellipse_at_top_right,rgba(250,204,21,0.16),transparent_55%),linear-gradient(120deg,#0F172A,#1E293B)] p-6 text-white shadow-xl shadow-slate-900/10 sm:p-9";
export const heroLabelClass = "mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#FACC15]";
export const questionSurfaceClass = "border border-blue-200/80 bg-gradient-to-br from-[#EFF6FF] via-white to-[#F0FDFA]";
export const answerSurfaceClass = "border border-amber-200 bg-gradient-to-br from-[#FFFBEB] via-[#FFFDF7] to-white";
export const panelClass = "min-w-0 rounded-3xl border border-slate-200/60 bg-white p-5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.06)] sm:p-7";
const buttonBase = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition duration-200 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 motion-reduce:transition-none motion-reduce:active:transform-none";
export const buttonClass = `${buttonBase} border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50`;
export const primaryClass = `${buttonBase} border-yellow-400 bg-[#FACC15] text-slate-950 shadow-md shadow-yellow-500/15 hover:border-amber-400 hover:bg-[#FDE047] active:scale-[0.99]`;
export const reviewClass = `${buttonBase} border-rose-200/80 bg-rose-50 text-rose-600 hover:bg-rose-100`;
export const learnedClass = `${buttonBase} border-emerald-200/80 bg-emerald-50 text-emerald-600 hover:bg-emerald-100`;
export const inputClass = "w-full min-w-0 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50 motion-reduce:transition-none";
export const labelClass = "text-xs font-semibold uppercase tracking-wider text-slate-500";
export const badgeClass = "inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-[#FFFBEB] px-3 py-1.5 text-xs font-semibold text-amber-800";
export const kbdClass = "rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500";
export const noteClass = "rounded-2xl border border-amber-200/50 bg-amber-50/80 px-4 py-3 text-amber-900/80";

export function useFlashcardMutation() {
  const router = useRouter();
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  async function run<T>(work: () => Promise<FlashcardActionResult<T>>, message: string) {
    if (lock.current) return null;
    lock.current = true;
    setBusy(true);
    try {
      const result = await work();
      if (!result.ok) { toast.error(result.error); return null; }
      toast.success(message);
      router.refresh();
      return result;
    } catch {
      toast.error("Không thể kết nối. Vui lòng thử lại; thay đổi chưa được xác nhận lưu.");
      return null;
    } finally { lock.current = false; setBusy(false); }
  }
  return { busy, run };
}

export function FlashcardEmpty({ title, description }: { title: string; description: string }) {
  return <div className={`${panelClass} py-16 text-center`}>
    <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl border border-yellow-300 bg-yellow-50"><Layers3 className="size-7 text-amber-600" /></div>
    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
  </div>;
}

export function FlashcardLoading() {
  return <div role="status" className="flex min-h-64 items-center justify-center gap-3 text-slate-500">
    <LoaderCircle className="size-5 animate-spin" /> Đang tải Flashcard…
  </div>;
}

export function FlashcardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div role="alert" className={`${panelClass} mx-auto my-12 max-w-lg text-center`}>
    <h2 className="text-xl font-bold">Không thể tải Flashcard</h2>
    <p className="my-4 text-slate-500">Vui lòng kiểm tra kết nối và thử lại.</p>
    <button onClick={reset} className={primaryClass}>Thử lại</button>
  </div>;
}

export function ProgressBar({ value, label, tone = "amber" }: { value: number; label: string; tone?: "amber" | "navy" }) {
  return <div>
    <div className={`mb-2.5 flex justify-between gap-3 text-xs font-medium ${tone === "navy" ? "text-slate-500" : "text-slate-400"}`}><span>{label}</span><span className={`shrink-0 tabular-nums ${tone === "navy" ? "font-bold text-slate-900" : "text-slate-600"}`}>{value}%</span></div>
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} className="h-1.5 overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none ${tone === "navy" ? "bg-[#101527]" : "bg-gradient-to-r from-amber-400 to-orange-400"}`} style={{ width: `${value}%` }} />
    </div>
  </div>;
}
