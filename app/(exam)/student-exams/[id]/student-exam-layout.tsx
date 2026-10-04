"use client";
import { ShieldAlert, Maximize2, AppWindowMac, AlertTriangle, Play } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import dynamic from "next/dynamic";
import {
  FileText,
  ListChecks,
} from "lucide-react";
import type { ExamSession } from "@/lib/exam/session/types";
import { Clock } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import AnswerSheetNew from "@/components/exams/answer-sheet/answer-sheet-new";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useFullscreenGrace } from "@/components/exams/use-fullscreen-grace";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
const PdfViewer = dynamic(
  () => import("./pdf-viewer"),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-full w-full" />
    ),
  }
);

// interface ExamAnswers {
//   multipleChoice: string[];
//   trueFalse: string[][];
//   shortAnswer: string[][];
// }

// interface ExamSession {
//   attempt: any;
//   exam: any;
//   pdfUrl: string;
//   remainingSeconds: number;
//   savedAnswers: ExamAnswers;
// }

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
  expiresAt,
  savedAnswers,
} = session;

  const [submitted, setSubmitted] =
    useState(review);

const finishExamRef =
  useRef(false);
const wakeLockRef =
  useRef<WakeLockSentinel | null>(null);


  const [mobileView, setMobileView] =
    useState<"pdf" | "sheet">("pdf");

    const isDesktop =
  useMediaQuery("(min-width:768px)");
const [examStarted, setExamStarted] =
  useState(review);
const { secondsLeft: fullscreenSecondsLeft, submitFailed, retrySubmit } =
  useFullscreenGrace(examStarted && !review && !submitted, attempt.id);
const [restoringFullscreen, setRestoringFullscreen] = useState(false);

async function restoreFullscreen() {
  if (fullscreenSecondsLeft === 0 || restoringFullscreen) return;
  setRestoringFullscreen(true);
  try {
    await document.documentElement.requestFullscreen();
  } catch {
    toast.error("Không thể bật toàn màn hình. Vui lòng bấm thử lại trước khi hết thời gian.");
  } finally {
    setRestoringFullscreen(false);
  }
}
useEffect(() => {
  if (review) {
    setSubmitted(true);
    setExamStarted(true);
  }
}, [review]);

async function requestWakeLock() {
  if (review || submitted) {
    return;
  }

  if (!("wakeLock" in navigator)) {
    console.warn(
      "[EXAM] Screen Wake Lock is not supported."
    );
    return;
  }

  try {
    wakeLockRef.current =
      await navigator.wakeLock.request(
        "screen"
      );

    console.log(
      "[EXAM] Screen Wake Lock enabled"
    );

  } catch (error) {
    console.warn(
      "[EXAM] Wake Lock request failed:",
      error
    );
  }
}

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
  await requestWakeLock();

  setExamStarted(true);
}

const [timeLeft, setTimeLeft] =
  useState(remainingSeconds);


  useEffect(() => {

  if (review || submitted) {
    return;
  }

  async function handleVisibilityChange() {

    if (
      document.visibilityState !==
      "visible"
    ) {
      return;
    }

    if (
      wakeLockRef.current === null
    ) {
      await requestWakeLock();
    }
  }

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  return () => {
    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
  };

}, [review, submitted]);

useEffect(() => {
  if (review || submitted) {
    return;
  }

function updateTimer() {
  const remaining =
    Math.max(
      0,
      Math.ceil(
        (expiresAt - Date.now()) /
          1000
      )
    );

  setTimeLeft(remaining);

  if (
    remaining === 0 &&
    !finishExamRef.current
  ) {
    console.warn(
      "[EXAM] DEADLINE REACHED - FORCE SUBMIT"
    );

    finishExamRef.current = true;

    window.dispatchEvent(
      new Event("force-submit")
    );
  }
}

  // Đồng bộ ngay khi effect chạy
  updateTimer();

  const timer =
    window.setInterval(
      updateTimer,
      1000
    );

  return () => {
    window.clearInterval(timer);
  };
}, [
  expiresAt,
  review,
  submitted,
]);

const displayTime = useMemo(() => {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}, [timeLeft]);

const lowTime = timeLeft <= 300;

useEffect(() => {
  async function handleSubmitSuccess() {
    console.log("[EXAM] SUBMIT SUCCESS");

    // Đánh dấu đã nộp trước
    finishExamRef.current = true;

    // Đã nộp → không còn popup thoát fullscreen
    setSubmitted(true);
    if (wakeLockRef.current) {
  await wakeLockRef.current.release();
  wakeLockRef.current = null;
}
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

useEffect(() => {
  return () => {
    if (wakeLockRef.current) {
      void wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };
}, []);

  return (
    <div className="h-dvh overflow-hidden bg-slate-100">

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
        bg-black
      "
    >



<div className="w-[90%] max-w-md rounded-3xl bg-white p-6 shadow-xl sm:p-7">
  {/* Header */}
  <div className="mb-6 flex items-center gap-4">
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-500">
      <ShieldAlert className="h-7 w-7" />
    </div>
    <div>
      <h2 className="text-xl font-bold tracking-tight text-slate-900">
        Quy Chế Phòng Thi
      </h2>
      <p className="mt-0.5 text-sm text-slate-500">
        Đọc kỹ trước khi xác nhận làm bài
      </p>
    </div>
  </div>

  {/* Rules List */}
  <div className="space-y-3.5">
    {/* Rule 1 */}
    <div className="flex items-center gap-3.5 rounded-2xl bg-slate-50/80 p-4">
      <Maximize2 className="h-5 w-5 shrink-0 text-slate-600" />
      <p className="text-sm font-normal text-slate-700">
        Hệ thống tự động kích hoạt chế độ{" "}
        <strong className="font-bold text-slate-900">
          toàn màn hình (Full-screen)
        </strong>
        .
      </p>
    </div>

    {/* Rule 2 */}
    <div className="flex items-center gap-3.5 rounded-2xl bg-slate-50/80 p-4">
      <AppWindowMac className="h-5 w-5 shrink-0 text-slate-600" />
<p className="text-sm font-normal text-slate-700">
  Trong lúc làm bài có các <strong>vấn đề</strong> về kỹ thuật hãy <strong>tắt</strong> tab trình duyệt và <strong>mở lại</strong> để tiếp tục làm bài.
</p>
    </div>

    {/* Rule 3 (Warning) */}
    <div className="flex items-center gap-3.5 rounded-2xl border border-red-100 bg-red-50/60 p-4">
      <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
      <p className="text-sm font-medium text-red-700">
        Nếu thoát toàn màn hình, hãy quay lại trong vòng{" "}
        <strong className="font-bold text-red-900">
          30 giây để tiếp tục làm bài
        </strong>
        . Hết thời gian này, hệ thống sẽ tự động nộp bài.
      </p>
    </div>
  </div>

  {/* CTA Button */}
  <button
    type="button"
    onClick={startFullscreen}
    className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f172a] py-3.5 text-base font-semibold text-white transition-opacity hover:opacity-90 active:scale-[0.99]"
  >
    <Play className="h-4 w-4 fill-amber-400 text-amber-400" />
    <span>Đã hiểu &amp; Bắt đầu làm bài</span>
  </button>
</div>

            </div>

            )
            }


      <AlertDialog open={!review && !submitted && fullscreenSecondsLeft !== null}>
        <AlertDialogContent className="z-[10000] w-[calc(100%-2rem)] rounded-3xl p-6 sm:max-w-md">
          <AlertDialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <ShieldAlert className="size-6 shrink-0 text-amber-500" />
            Bạn đã thoát chế độ toàn màn hình
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed text-slate-600">
            Hệ thống sẽ tự động nộp bài sau 30 giây. Vui lòng quay lại chế độ toàn màn hình để tiếp tục.
          </AlertDialogDescription>
          <div role="timer" aria-label="Thời gian còn lại trước khi tự động nộp bài" className="py-3 text-center text-5xl font-bold tabular-nums text-rose-600">
            {fullscreenSecondsLeft ?? 30}<span className="ml-2 text-base font-medium">giây</span>
          </div>
          <p className="text-center text-xs text-slate-500">Thời gian làm bài vẫn tiếp tục được tính.</p>
          {fullscreenSecondsLeft === 0 ? (
            submitFailed ? <>
              <p role="alert" className="text-sm text-rose-600">Nộp bài chưa thành công. Vui lòng kiểm tra kết nối và thử lại.</p>
              <Button onClick={retrySubmit}>Thử nộp lại</Button>
            </> : <p role="status" className="text-center text-sm font-semibold">Đang tự động nộp bài…</p>
          ) : (
            <Button disabled={restoringFullscreen} onClick={restoreFullscreen} className="h-auto min-h-12 whitespace-normal rounded-2xl bg-slate-900 px-4 py-3 text-white hover:bg-slate-800">
              <Maximize2 className="size-4 shrink-0 text-amber-400" />
              {restoringFullscreen ? "Đang bật toàn màn hình…" : "Quay lại chế độ toàn màn hình"}
            </Button>
          )}
        </AlertDialogContent>
      </AlertDialog>

      {/* ==========================================
          DESKTOP
      ========================================== */}
      {isDesktop && (
      <div className="h-full gap-3 bg-slate-50 p-3 pt-[68px] md:flex">

        {/* PDF */}

        <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">

          <PdfViewer
            url={pdfUrl}
          />

        </div>

        {/* ANSWER SHEET */}

        <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">

          <AnswerSheetNew
            attempt={attempt}
            exam={exam}
            remainingSeconds={remainingSeconds}
            expiresAt={expiresAt}
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
   <div className="flex h-14 items-center justify-between gap-3 border-b border-slate-800 bg-[#0f172a] px-4">

    <span className="truncate text-sm font-extrabold text-white">
      {exam.title}
    </span>

  {!review && (
    <span
      className={cn(
        "flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-sm font-bold",
        lowTime
          ? "border border-rose-500/40 bg-rose-500/10 text-rose-300"
          : "border border-slate-700 bg-slate-800/90 text-slate-200"
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

          <AnswerSheetNew
            attempt={attempt}
            exam={exam}
            remainingSeconds={remainingSeconds}
            expiresAt={expiresAt}
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
