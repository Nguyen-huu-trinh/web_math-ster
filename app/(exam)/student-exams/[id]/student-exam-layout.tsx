"use client";

import { useState } from "react";
import { FileText, ListChecks } from "lucide-react";

import PdfViewer from "./pdf-viewer";
import AnswerSheet from "./answer-sheet";

interface Props {
  attempt: any;
  exam: any;
}

export default function StudentExamLayout({
  attempt,
  exam,
}: Props) {
  const [mobileView, setMobileView] = useState<
    "pdf" | "sheet"
  >("pdf");

  return (
    <div className="h-screen overflow-hidden bg-slate-100">

      {/* ===========================
          DESKTOP
      =========================== */}

      <div className="hidden h-full md:flex">

        {/* PDF */}

        <div className="w-1/2 border-r bg-white overflow-hidden">
          <PdfViewer
            url={exam.exam_file_url}
          />
        </div>

        {/* ANSWER SHEET */}

        <div className="w-1/2 overflow-y-auto bg-[#f8f6ef]">
          <AnswerSheet
            attempt={attempt}
            exam={exam}
          />
        </div>

      </div>

      {/* ===========================
          MOBILE
      =========================== */}

      <div className="h-full md:hidden">

        {mobileView === "pdf" ? (

          <PdfViewer
            url={exam.exam_file_url}
          />

        ) : (

          <AnswerSheet
            attempt={attempt}
            exam={exam}
          />

        )}

      </div>

      {/* ===========================
          MOBILE FLOAT BUTTON
      =========================== */}

      <button
        type="button"
        onClick={() =>
          setMobileView((v) =>
            v === "pdf"
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