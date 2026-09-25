"use client";

import { Clock, ListChecks, RotateCcw, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExamHeaderProps {
  title: string;
  examCode?: string | null;
  displayTime: string;
  lowTime: boolean;
  submitted: boolean;
  score?: number | null;
  submitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
  onRetry: () => void;
  canRetry: boolean;
}

export default function ExamHeader({
  title, examCode, displayTime, lowTime, submitted, score,
  submitting, onSubmit, onBack, onRetry, canRetry,
}: ExamHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-800 bg-[#0f172a] px-3 md:fixed md:inset-x-0 md:top-0 md:z-30 md:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="hidden size-8 shrink-0 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs font-black text-amber-400 md:flex min-[480px]:flex">MS</span>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <h1 title={title} className="truncate text-sm font-extrabold text-white">{title}</h1>
            {examCode && <span className="hidden max-w-28 shrink-0 truncate rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-300 md:inline min-[640px]:inline" title={`Mã đề: ${examCode}`}>Mã đề: {examCode}</span>}
          </div>
          <p className="mt-0.5 truncate text-[10px] text-slate-400">{submitted ? "Xem lại bài làm" : "Chế độ làm bài trực tuyến"}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {submitted ? (
          <>
            {score !== null && score !== undefined && <span className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-2 py-2 text-[11px] font-black text-amber-400"><span className="hidden md:inline min-[560px]:inline">Kết quả: </span>{Number(score).toFixed(2)} / 10</span>}
            
            {canRetry && <Button onClick={onRetry} title="Làm lại" aria-label="Làm lại" className="h-8 rounded-lg bg-amber-500 px-2 text-xs font-black text-slate-950 hover:bg-amber-400"><RotateCcw className="size-3.5" /><span className="hidden md:inline min-[640px]:inline">Làm lại</span></Button>}
          </>
        ) : (
          <>
            <span role="timer" aria-label={`Thời gian còn lại ${displayTime}`} className={cn("flex items-center gap-1.5 rounded-xl border px-2.5 py-2 font-mono text-sm font-bold tabular-nums", lowTime ? "border-rose-500/40 bg-rose-500/10 text-rose-300" : "border-slate-700 bg-slate-800/90 text-slate-200")}>
              <Clock className={cn("size-3.5", lowTime ? "text-rose-400" : "text-amber-400")} />{displayTime}
            </span>
            <Button type="button" size="sm" disabled={submitting} onClick={onSubmit} aria-label="Nộp bài thi" className="h-8 rounded-xl bg-amber-500 px-2.5 text-xs font-black text-slate-950 shadow-sm hover:bg-amber-400">
              <Send className="size-3.5" /><span className="hidden md:inline min-[480px]:inline">{submitting ? "Đang nộp..." : "Nộp bài thi"}</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
