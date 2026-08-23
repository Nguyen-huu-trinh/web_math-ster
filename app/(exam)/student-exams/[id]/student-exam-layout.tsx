"use client";

import { useMediaQuery } from "usehooks-ts";
import dynamic from "next/dynamic";
import {
  FileText,
  ListChecks,
} from "lucide-react";
import { Clock } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import AnswerSheet from "./answer-sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
    review?: boolean;
    viewerRole?: "STUDENT" | "TEACHER" | "ADMIN";
    returnUrl?: string;
}

export default function StudentExamLayout({
  session,
  review = false,
  viewerRole = "STUDENT",
  returnUrl,
}: Props) {
  const {
    attempt,
    exam,
    pdfUrl,
    remainingSeconds,
    savedAnswers,
  } = session;

const [showExitDialog, setShowExitDialog] =
  useState(false);
  const [submitted, setSubmitted] =
    useState(review);

const finishExamRef =
  useRef(false);

const [exitCountdown, setExitCountdown] =
  useState(30);

const exitTimer =
  useRef<NodeJS.Timeout | null>(null);

 

useEffect(() => {

  if (review || !showExitDialog) {
    return;
  }

  exitTimer.current = setInterval(() => {

    setExitCountdown((prev) => {

      if (prev <= 1) {

        clearInterval(exitTimer.current!);

        if (!submitted) {
          window.dispatchEvent(
            new Event("force-submit")
          );
        }

        return 0;
      }

      return prev - 1;
    });

  }, 1000);

  return () => {
    if (exitTimer.current) {
      clearInterval(exitTimer.current);
    }
  };

}, [review, showExitDialog, submitted]);

async function resumeExam() {

  try {

    await document.documentElement.requestFullscreen();

    setShowExitDialog(false);

    if (exitTimer.current) {

      clearInterval(exitTimer.current);

    }

  } catch {

    // Người dùng từ chối vào fullscreen

  }

}

  const [mobileView, setMobileView] =
    useState<"pdf" | "sheet">("pdf");

    const isDesktop =
  useMediaQuery("(min-width:768px)");
const [examStarted, setExamStarted] =
  useState(review);
useEffect(() => {
  if (review) {
    setSubmitted(true);
    setExamStarted(true);
  }
}, [review]);

async function startFullscreen() {

  // Review không cần fullscreen
  if (review) {
    setExamStarted(true);
    return;
  }

  try {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  } catch (e) {
    console.error(e);
  }

  setExamStarted(true);
}

  const [timeLeft, setTimeLeft] =
  useState(remainingSeconds);

useEffect(() => {
  setTimeLeft(remainingSeconds);
}, [remainingSeconds]);



useEffect(() => {
  if (review || submitted) {
    return;
  }

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 0) return 0;

      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [review, submitted]);

const displayTime = useMemo(() => {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}, [timeLeft]);

const lowTime = timeLeft <= 300;

useEffect(() => {
  function handleFullscreenChange() {

    // REVIEW MODE:
    // Không yêu cầu fullscreen
    if (review) {
      return;
    }

    if (!document.fullscreenElement) {

      if (finishExamRef.current) {
        return;
      }

      setShowExitDialog(true);
      setExitCountdown(30);
    }
  }

  document.addEventListener(
    "fullscreenchange",
    handleFullscreenChange
  );

  return () =>
    document.removeEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

}, [review]);

useEffect(() => {
  function handleSubmitSuccess() {
    console.log("[EXAM] SUBMIT SUCCESS");

    // Đánh dấu đã nộp trước
    finishExamRef.current = true;

    // Đã nộp → không còn popup thoát fullscreen
    setSubmitted(true);
    setShowExitDialog(false);

    // Hủy countdown thoát fullscreen nếu đang chạy
    if (exitTimer.current) {
      clearInterval(exitTimer.current);
      exitTimer.current = null;
    }

    // REVIEW thì không cần thoát fullscreen
    if (review) {
      return;
    }

    // Thoát fullscreen
    if (document.fullscreenElement) {
      document
        .exitFullscreen()
        .catch((error) => {
          console.error(
            "[EXAM] EXIT FULLSCREEN ERROR:",
            error
          );
        });
    }
  }

  window.addEventListener(
    "submit-success",
    handleSubmitSuccess
  );

  return () => {
    window.removeEventListener(
      "submit-success",
      handleSubmitSuccess
    );
  };
}, [review]);

  return (
    <div className="h-screen overflow-hidden bg-slate-100">

      {
           !review && !examStarted && (

            <div
            className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-black/80
            "
            >

            <div className="rounded-xl bg-white p-8 shadow-xl">

            <h2 className="mb-3 text-xl font-bold">

            Bắt đầu làm bài

            </h2>

            <p className="mb-6 text-gray-600">

            Hệ thống sẽ chuyển sang chế độ toàn màn hình.

            </p>

            <Button
            onClick={startFullscreen}
            >

            Bắt đầu

            </Button>

            </div>

            </div>

            )
            }

{showExitDialog && (
  <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80">

    <div className="w-[420px] rounded-xl bg-white p-8">

      <h2 className="text-xl font-bold text-red-600">
        Bạn đã thoát khỏi chế độ thi
      </h2>

      <p className="mt-3 text-gray-600">
        Bài thi sẽ được kết thúc sau
      </p>

      <p className="my-5 text-center text-5xl font-bold text-red-600">
        {exitCountdown}
      </p>

      <p className="text-gray-600">
        giây nếu bạn không quay lại chế độ toàn màn hình.
      </p>

      <div className="mt-8 flex gap-3">

        <Button
          className="flex-1"
          onClick={resumeExam}
        >
          Quay lại toàn màn hình
        </Button>

        <Button
          variant="destructive"
          onClick={() =>
          window.dispatchEvent(
            new Event("force-submit")
          )
        }
        >
          Nộp bài ngay
        </Button>

      </div>

    </div>

  </div>
)}

      {/* ==========================================
          DESKTOP
      ========================================== */}
      {isDesktop && (
      <div className=" h-full md:flex">

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
            review={review}
            viewerRole={viewerRole}
             returnUrl={returnUrl}
          />

        </div>

      </div>
      )}

      {/* ==========================================
          MOBILE
      ========================================== */}
{!isDesktop && (
<div className="flex h-full flex-col ">

 

<div className="relative flex-1">
  <div
  className={cn(
    "absolute inset-0 transition-opacity duration-200",
    mobileView === "pdf"
      ? "opacity-100 z-10"
      : "opacity-0 pointer-events-none"
  )}
>
   <div className="flex items-center justify-between border-b bg-card px-4 py-3">

    <span className="truncate text-sm font-semibold">
      {exam.title}
    </span>

  {!review && (
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

  </div>
  <PdfViewer
    url={pdfUrl}
  />

</div>


  {/* <div className="flex-1">
    <PdfViewer url={pdfUrl} />
  </div> */}



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
            review={review}
          />

        </div>

      </div>
      </div>
)}

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