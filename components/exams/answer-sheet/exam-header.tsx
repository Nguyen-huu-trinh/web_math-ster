"use client";

import {
  Clock,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

interface ExamHeaderProps {
  title: string;

  displayTime: string;

  lowTime: boolean;

  submitted: boolean;

  score?: number | null;

  submitting: boolean;

  onSubmit: () => void;
}

export default function ExamHeader({
  title,
  displayTime,
  lowTime,
  submitted,
  score,
  submitting,
  onSubmit,
}: ExamHeaderProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b bg-card px-4 py-3">
      {/* ==========================================
          TITLE
      ========================================== */}

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold sm:text-base">
          {title}
        </h2>
      </div>

      {/* ==========================================
          RIGHT SIDE
      ========================================== */}

      <div className="ml-3 flex shrink-0 items-center gap-2">
        {/* SCORE */}

        {submitted &&
          score !== null &&
          score !== undefined && (
            <span className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-bold">
              {Number(score).toFixed(2)}
            </span>
          )}

        {/* TIMER */}

        {!submitted && (
          <span
            className={cn(
              "flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-sm font-bold",

              lowTime
                ? "bg-red-100 text-red-600"
                : "bg-primary/10"
            )}
          >
            <Clock className="size-4" />

            {displayTime}
          </span>
        )}

        {/* SUBMIT */}

        {!submitted && (
          <Button
            type="button"
            size="sm"
            disabled={submitting}
            onClick={onSubmit}
            className="hidden sm:flex"
          >
            <Send className="mr-2 size-4" />

            {submitting
              ? "Đang nộp..."
              : "Nộp bài"}
          </Button>
        )}
      </div>
    </div>
  );
}