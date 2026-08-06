"use client";


import dynamic from "next/dynamic";
import {
  FileText,
  ListChecks,
} from "lucide-react";
import { Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import AnswerSheet from "./answer-sheet";
import { Skeleton } from "@/components/ui/skeleton";

const PdfViewer = dynamic(
  () => import("./pdf-viewer"),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-full w-full" />
    ),
  }
);

interface ExamAnswers {
  multipleChoice: string[];
  trueFalse: string[][];
  shortAnswer: string[][];
}

interface ExamSession {
  attempt: any;
  exam: any;
  pdfUrl: string;
  remainingSeconds: number;
  savedAnswers: ExamAnswers;
}

interface Props {
  session: ExamSession;
}

export default function StudentExamLayout({
  session,
}: Props) {
  const {
    attempt,
    exam,
    pdfUrl,
    remainingSeconds,
    savedAnswers,
  } = session;

  const [mobileView, setMobileView] =
    useState<"pdf" | "sheet">("pdf");
  const [timeLeft, setTimeLeft] =
  useState(remainingSeconds);

useEffect(() => {
  setTimeLeft(remainingSeconds);
}, [remainingSeconds]);

useEffect(() => {
  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 0) return 0;
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, []);

const displayTime = useMemo(() => {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}, [timeLeft]);

const lowTime = timeLeft <= 300;

  return (
    <div className="h-screen overflow-hidden bg-slate-100">

      {/* ==========================================
          DESKTOP
      ========================================== */}

      <div className="hidden h-full md:flex">

        {/* PDF */}

        <div className="w-1/2 overflow-hidden border-r bg-white">

          <PdfViewer
            url={pdfUrl}
          />

        </div>

        {/* ANSWER SHEET */}

        <div className="w-1/2 overflow-y-auto bg-[#f8f6ef]">

          <AnswerSheet
            attempt={attempt}
            exam={exam}
            remainingSeconds={remainingSeconds}
            savedAnswers={savedAnswers}
          />

        </div>

      </div>

      {/* ==========================================
          MOBILE
      ========================================== */}

      <div className="flex h-full flex-col bg-white">

  <div className="flex items-center justify-between border-b bg-card px-4 py-3">

    <span className="truncate text-sm font-semibold">
      {exam.title}
    </span>

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

  </div>

  <div className="flex-1">
    <PdfViewer url={pdfUrl} />
  </div>



        {/* ============== ANSWER SHEET ============== */}

        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-200",

            mobileView === "sheet"
              ? "opacity-100 z-10"
              : "opacity-0 pointer-events-none"
          )}
        >

          <AnswerSheet
            attempt={attempt}
            exam={exam}
            remainingSeconds={remainingSeconds}
            savedAnswers={savedAnswers}
          />

        </div>

      </div>

      {/* ==========================================
          FLOAT BUTTON
      ========================================== */}

      <button
        type="button"
        onClick={() =>
          setMobileView((view) =>
            view === "pdf"
              ? "sheet"
              : "pdf"
          )
        }
        className="
          fixed
          bottom-5
          right-5
          z-50
          flex
          items-center
          gap-2
          rounded-full
          bg-primary
          px-5
          py-3
          text-sm
          font-semibold
          text-primary-foreground
          shadow-xl
          transition-all
          hover:scale-105
          active:scale-95
          md:hidden
        "
      >
        {mobileView === "pdf" ? (
          <>
            <ListChecks className="size-5" />
            Phiếu đáp án
          </>
        ) : (
          <>
            <FileText className="size-5" />
            Xem đề thi
          </>
        )}
      </button>

    </div>
  );
}