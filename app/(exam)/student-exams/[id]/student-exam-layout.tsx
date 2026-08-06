"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  FileText,
  ListChecks,
} from "lucide-react";

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

  return (
    <div className="h-screen overflow-hidden bg-slate-100">

      {/* ===========================
          DESKTOP
      =========================== */}

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

      {/* ===========================
          MOBILE
      =========================== */}

      <div className="h-full md:hidden">

        {mobileView === "pdf" ? (

          <PdfViewer
            url={pdfUrl}
          />

        ) : (

          <AnswerSheet
            attempt={attempt}
            exam={exam}
            remainingSeconds={remainingSeconds}
            savedAnswers={savedAnswers}
          />

        )}

      </div>

      {/* ===========================
          MOBILE FLOAT BUTTON
      =========================== */}

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
          transition
          hover:scale-105
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