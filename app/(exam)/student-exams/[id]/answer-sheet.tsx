"use client";
import { useRef } from "react";
import { useEffect, useMemo, useState, } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  FileText,
 GraduationCap,
  Send,
} from "lucide-react";
import ExamHeader from "./exam-header";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useSaveAnswer } from "@/hooks/use-save-answer";
import { Button } from "@/components/ui/button";

import { useSubmitAttempt } from "@/hooks/use-submit-attempt";
import { useStartExam } from "@/hooks/use-start-exam";




interface ExamAnswers {
  multipleChoice: string[];
  trueFalse: string[][];
  shortAnswer: string[][];
}

interface Props {
  attempt: any;
  exam: any;
  remainingSeconds: number;
  savedAnswers: ExamAnswers;
}

const MC = ["A", "B", "C", "D"];
const TF = ["Đ", "S"];
const SHORT_ANSWER_COLS = 4;
const DIGITS = ["0","1","2","3","4","5","6","7","8","9"];
export default function AnswerSheet({
  attempt,
  exam,
  remainingSeconds,
  savedAnswers,
}: Props)  

{

  const router = useRouter();

  // ============================
  // Question Config
  // ============================


  const questionConfig =
    exam.question_config ?? {
      multipleChoice: 0,
      trueFalse: 0,
      shortAnswer: 0,
    };

  // ============================
  // Answers
  // ============================
const [answers, setAnswers] = useState(() => ({
  multipleChoice:
    savedAnswers?.multipleChoice ??
    Array(questionConfig.multipleChoice).fill(""),

  trueFalse:
    savedAnswers?.trueFalse?.length
      ? savedAnswers.trueFalse
      : Array.from(
          {
            length: questionConfig.trueFalse,
          },
          () => ["", "", "", ""]
        ),

  shortAnswer:
    savedAnswers?.shortAnswer?.length
      ? savedAnswers.shortAnswer
      : Array.from(
          {
            length: questionConfig.shortAnswer,
          },
          () => ["", "", "", ""]
        ),
}));
const answersRef = useRef(answers);

useEffect(() => {
  answersRef.current = answers;
}, [answers]);

  // ============================
  // Timer
  // ============================

 const [timeLeft, setTimeLeft] =
  useState(remainingSeconds);

  useEffect(() => {
  setTimeLeft(
    remainingSeconds
  );
}, [remainingSeconds]);
  // ============================
  // Result
  // ============================

  const [result, setResult] =
    useState<any>(null);
const [submitDialogOpen, setSubmitDialogOpen] =
  useState(false);
const saveTimeout =
useRef<NodeJS.Timeout | null>(
    null
);

  // ============================
  // Submit
  // ============================



  const submitMutation =
    useSubmitAttempt();

    const submittedRef = useRef(false);
    const saveAnswerMutation =
    useSaveAnswer();
  const startExamMutation = useStartExam();
  
      // ============================
  // Countdown Timer
  // ============================

  useEffect(() => {
    if (result) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(false);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [result]);

  function autoSaveAnswers(
    nextAnswers: typeof answers
) {

    if (!attempt?.id) return;

    if (saveTimeout.current) {

        clearTimeout(
            saveTimeout.current
        );

    }

    saveTimeout.current =
        setTimeout(() => {

            saveAnswerMutation.mutate({

                attemptId:
                    attempt.id,

                answers:
                    nextAnswers,

            });

        }, 500);

}
  // ============================
  // Display Time
  // ============================

  const displayTime = useMemo(() => {

    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;

    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  }, [timeLeft]);

  // ============================
  // Answered Count
  // ============================

  const answeredCount = useMemo(() => {

    let total = 0;

    total += answers.multipleChoice.filter(
      (x: string) => x !== ""
    ).length;

    total += answers.trueFalse.filter(
      (row: string[]) =>
        row.every((x) => x !== "")
    ).length;

   total += answers.shortAnswer.filter(
  (row: string[]) =>
    row.some((x) => x !== "")
).length;

    return total;

  }, [answers]);

  // ============================
  // Total Questions
  // ============================

  const totalQuestions =
    questionConfig.multipleChoice +
    questionConfig.trueFalse +
    questionConfig.shortAnswer;

  // ============================
  // Progress
  // ============================

  const progress =
    totalQuestions === 0
      ? 0
      : (answeredCount / totalQuestions) * 100;
        // ============================
  // Multiple Choice
  // ============================

  function chooseMultipleChoice(
  index: number,
  value: string
) {
  if (result) return;

  setAnswers((prev) => {
    const next = {
      ...prev,
      multipleChoice: [...prev.multipleChoice],
    };

    // Click lại đáp án đang chọn → hủy chọn
    if (next.multipleChoice[index] === value) {
      next.multipleChoice[index] = "";
    } else {
      // Click đáp án khác → chuyển sang đáp án mới
      next.multipleChoice[index] = value;
    }

    answersRef.current = next;
    autoSaveAnswers(next);

    return next;
  });
}
  // ============================
  // True False
  // ============================

  function chooseTrueFalse(
  questionIndex: number,
  columnIndex: number,
  value: string
) {
  if (result) return;

  setAnswers((prev) => {
    const next = {
      ...prev,
      trueFalse: prev.trueFalse.map(
        (row) => [...row]
      ),
    };

    // Click lại đáp án đang chọn → hủy chọn
    if (
      next.trueFalse[questionIndex][columnIndex] === value
    ) {
      next.trueFalse[questionIndex][columnIndex] = "";
    } else {
      // Chọn đáp án mới
      next.trueFalse[questionIndex][columnIndex] = value;
    }

    answersRef.current = next;
    autoSaveAnswers(next);

    return next;
  });
}
  // ============================
  // Short Answer
  // ============================

 function chooseShortAnswer(
  questionIndex: number,
  columnIndex: number,
  value: string
) {
  if (result) return;

  setAnswers((prev) => {
    const next = {
      ...prev,
      shortAnswer:
        prev.shortAnswer.map(
          (row) => [...row]
        ),
    };

    // Click lại ký tự đang chọn → hủy ký tự đó
    if (
      next.shortAnswer[questionIndex][columnIndex] === value
    ) {
      next.shortAnswer[questionIndex][columnIndex] = "";
    } else {
      // Chọn ký tự mới
      next.shortAnswer[questionIndex][columnIndex] = value;
    }

    answersRef.current = next;
    autoSaveAnswers(next);

    return next;
  });
}

  // ============================
  // Submit
  // ============================

 async function handleSubmit(
  confirm = true
) {
  // ==========================================
  // CHỐNG SUBMIT TRÙNG
  // ==========================================

  if (submittedRef.current) {
    return;
  }

  if (submitMutation.isPending) {
    return;
  }

  // Đánh dấu NGAY LẬP TỨC
  // để chặn click / timer / force-submit
  submittedRef.current = true;


  // ==========================================
  // HỦY AUTOSAVE ĐANG CHỜ
  // ==========================================

  if (saveTimeout.current) {
    clearTimeout(saveTimeout.current);
    saveTimeout.current = null;
  }


  try {

    // ========================================
    // LẤY ANSWERS MỚI NHẤT
    // ========================================

    const currentAnswers = {
      multipleChoice:
        answersRef.current.multipleChoice,

      trueFalse:
        answersRef.current.trueFalse,

      shortAnswer:
        answersRef.current.shortAnswer,
    };


    // ========================================
    // SUBMIT
    // ========================================

    const data =
      await submitMutation.mutateAsync({
        attemptId: attempt.id,
        answers: currentAnswers,
      });


    // ========================================
    // THÀNH CÔNG
    // ========================================

    setResult(data);

    setSubmitDialogOpen(false);

    window.dispatchEvent(
      new Event("submit-success")
    );

  } catch (err) {

    // Cho phép thử lại
    submittedRef.current = false;

    console.error(
      "SUBMIT EXAM ERROR:",
      err
    );

    alert(
      err instanceof Error
        ? err.message
        : "Nộp bài thất bại."
    );
  }
}

useEffect(() => {

  function forceSubmit() {

    console.log("force submit");

    handleSubmit(false);

  }

  window.addEventListener(
    "force-submit",
    forceSubmit
  );

  return () => {

    window.removeEventListener(
      "force-submit",
      forceSubmit
    );

  };

}, []);



async function handleRetry() {
  try {
    const data = await startExamMutation.mutateAsync(exam.id);

    router.push(`/student-exams/${data.id}`);
  } catch (err: any) {
    console.error(err);
    alert(err.message);
  }
}

const submitted = !!result;
const lowTime = timeLeft <= 300;

const showAnswer = submitted && exam.show_answer;

const answerKey = exam.answer_key ?? {
  multipleChoice: [],
  trueFalse: [],
  shortAnswer: [],
};



    return (

    <div className="flex h-screen flex-col bg-background">

      {/* ============================
          LEFT SIDE - PDF
      ============================ */}

      

<ExamHeader
  title={exam.title}
  displayTime={displayTime}
  lowTime={lowTime}
  submitted={submitted}
  score={result?.score}
  submitting={submitMutation.isPending}
  onSubmit={() => setSubmitDialogOpen(true)}
/>
      
      

      {/* ============================
          RIGHT SIDE
      ============================ */}

      <div className="flex-1 overflow-y-auto bg-[#f8f6ef]">

          <div className="p-4 space-y-6">

                    {/* ==========================================
              PHẦN I · TRẮC NGHIỆM
          ========================================== */}

{questionConfig.multipleChoice > 0 && (
  <section className="mb-8 rounded-xl border border-border bg-card p-4">
    {/* Header */}
    <div className="mb-3 flex items-baseline justify-between border-b pb-2">
      <h3 className="text-base font-bold">
        <span className="text-primary">PHẦN I.</span> Trắc nghiệm nhiều lựa chọn
      </h3>
    </div>

    {/* Question Grid */}
    <div className="columns-1 gap-x-6 sm:columns-1 md:columns-2 lg:columns-2 2xl:columns-3 min-[1920px]:columns-5 min-[2560px]:columns-6">
      {Array.from({ length: questionConfig.multipleChoice }).map((_, index) => {
        const selected = answers.multipleChoice[index];
        const correct = answerKey.multipleChoice[index];

        return (
          <div
            key={index}
            /* Đã đổi justify-between thành justify-start và thêm gap-3 */
            className="mb-3 flex items-center justify-start gap-3 break-inside-avoid rounded-lg px-2 py-1.5"
          >
            {/* Cụm Icon + STT đứng sát nhau */}
            <div className="flex items-center gap-1.5">
              {/* Vùng chứa Icon (cố định độ rộng để không bị lệch hàng khi chưa có icon) */}
              <div className="flex h-6 w-5 items-center justify-center text-base font-bold">
                {showAnswer && (
                  <span className={selected === correct ? "text-green-600" : "text-red-600"}>
                    {selected === correct ? "✓" : "✕"}
                  </span>
                )}
              </div>

              {/* Số thứ tự */}
              <span className="w-5 text-right font-bold">{index + 1}</span>
            </div>

            {/* Các nút A, B, C, D nằm ngay liền sau STT */}
            <div className="flex gap-2">
              {MC.map((item) => {
                const isSelected = selected === item;
                const isCorrect = item === correct;

                return (
                  <Button
                    key={item}
                    size="sm"
                    disabled={submitted}
                    variant="outline"
                    onClick={() => chooseMultipleChoice(index, item)}
                    className={cn(
                      "h-8 w-8 rounded-full p-0 transition-colors",

                       // 1. Chưa nộp bài + học sinh đã chọn
                    !showAnswer &&
                      isSelected &&
                      "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground hover:border-primary dark:bg-primary dark:text-primary-foreground dark:border-primary dark:hover:bg-primary dark:hover:text-primary-foreground dark:hover:border-primary",

                    // 2. Đã nộp bài + đáp án đúng
                    showAnswer &&
                      isCorrect &&
                      "bg-green-600 text-white border-green-600 hover:bg-green-600 hover:text-white hover:border-green-600 dark:bg-green-600 dark:text-white dark:border-green-600 dark:hover:bg-green-600 dark:hover:text-white dark:hover:border-green-600",

                    // 3. Đã nộp bài + học sinh chọn sai
                    showAnswer &&
                      isSelected &&
                      !isCorrect &&
                      "bg-red-600 text-white border-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 dark:bg-red-600 dark:text-white dark:border-red-600 dark:hover:bg-red-600 dark:hover:text-white dark:hover:border-red-600"
                  )}
                  >
                    {item}
</Button>
  );

})}
        </div>
      </div>
    );
})}
  </div>
</section>

          )}
                    {/* ==========================================
              PHẦN II · ĐÚNG / SAI
          ========================================== */}

          {questionConfig.trueFalse > 0 && (

            <section className="rounded-xl border border-border bg-card p-4 mb-8">

<div className="mb-3 flex justify-between border-b pb-2">
<h3 className="font-bold">
<span className="text-primary">PHẦN II.</span> Đúng / Sai
</h3>
</div>

<div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-4 min-[2560px]:grid-cols-5">

{Array.from({
length: questionConfig.trueFalse,
}).map((_, questionIndex) => (

<div
key={questionIndex}
className="rounded-lg border p-3"
>
<div className="mb-3 flex items-center justify-between">

  <p className="font-semibold">
  Câu {questionConfig.multipleChoice + questionIndex + 1}
</p>

  {showAnswer && (() => {

    const student = answers.trueFalse[questionIndex];

    const key = answerKey.trueFalse?.[questionIndex] ?? [];

    const ok =
      JSON.stringify(student) === JSON.stringify(key);

    return ok ? (
      <span className="text-green-600 text-lg">✓</span>
    ) : (
      <span className="text-red-600 text-lg">✕</span>
    );

  })()}

</div>

{["a", "b", "c", "d"].map((label, columnIndex) => {

 const selected =
    answers.trueFalse?.[questionIndex]?.[columnIndex] ?? "";
  const correct =
    answerKey.trueFalse?.[questionIndex]?.[columnIndex];

  return (
<div
key={columnIndex}
className="flex justify-between items-center mb-2"
>

<span>{label})</span>

<div className="flex gap-2">

<Button
  size="sm"
  variant="outline"
  disabled={submitted}
  onClick={() =>
    chooseTrueFalse(
      questionIndex,
      columnIndex,
      "Đ"
    )
  }
  className={cn(
  !showAnswer &&
    selected === "Đ" &&
    "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground hover:border-primary dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground",

  showAnswer &&
    correct === "Đ" &&
    "bg-green-600 text-white border-green-600 hover:bg-green-600 hover:text-white hover:border-green-600 dark:bg-green-600 dark:text-white dark:border-green-600 dark:hover:bg-green-600 dark:hover:text-white dark:hover:border-green-600",

  showAnswer &&
    selected === "Đ" &&
    selected !== correct &&
    "bg-red-600 text-white border-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 dark:bg-red-600 dark:text-white dark:border-red-600 dark:hover:bg-red-600 dark:hover:text-white dark:hover:border-red-600"
    )}
>
  Đ
</Button>

<Button
  size="sm"
  variant="outline"
  disabled={submitted}
  onClick={() =>
    chooseTrueFalse(
      questionIndex,
      columnIndex,
      "S"
    )
  }
  className={cn(
  !showAnswer &&
    selected === "S" &&
     "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground hover:border-primary dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground",

  showAnswer &&
    correct === "S" &&
 "bg-green-600 text-white border-green-600 hover:bg-green-600 hover:text-white hover:border-green-600 dark:bg-green-600 dark:text-white dark:border-green-600 dark:hover:bg-green-600 dark:hover:text-white dark:hover:border-green-600",
  showAnswer &&
    selected === "S" &&
    selected !== correct &&
    "bg-red-600 text-white border-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 dark:bg-red-600 dark:text-white dark:border-red-600 dark:hover:bg-red-600 dark:hover:text-white dark:hover:border-red-600"
)}
>
  S
</Button>

</div>

</div>

);})}

</div>

))}

</div>

</section>

          )}
                    {/* ==========================================
              PHẦN III · TRẢ LỜI NGẮN
          ========================================== */}

          {questionConfig.shortAnswer > 0 && (

            <section className="rounded-xl border border-border bg-card p-4 mb-8">

<div className="mb-3 border-b pb-2">
<h3 className="font-bold">
<span className="text-primary">PHẦN III.</span>
Trả lời ngắn
</h3>
</div>

<div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 min-[2560px]:grid-cols-4">

{Array.from({
  length: questionConfig.shortAnswer,
}).map((_, index) => {

  const studentAnswer = answers.shortAnswer[index]
  .join("")
  .replace(/\s/g, "")
  .trim();

const correctAnswer = String(
  answerKey.shortAnswer?.[index] ?? ""  
)
  .replace(/\s/g, "")
  .trim();

const isCorrect =
  studentAnswer !== "" &&
  studentAnswer === correctAnswer;

  return (

<div
key={index}
className="rounded-lg border p-3"
>
<div className="mb-3 flex items-center justify-between">

  <p className="font-semibold">
    Câu {questionConfig.multipleChoice + questionConfig.trueFalse + index + 1}
  </p>

  {showAnswer && (

    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-blue-600">
          Đáp án: {correctAnswer}
      </span>
      {isCorrect ? (

        <span className="text-green-600 font-bold text-lg">
          ✓
        </span>

      ) : (

        <span className="text-red-600 font-bold text-lg">
          ✕
        </span>

      )}

    </div>

  )}

</div>

<div className="grid grid-cols-4 gap-1">

  {Array.from({
    length: SHORT_ANSWER_COLS,
  }).map((_, columnIndex) => {

   const current =
    answers.shortAnswer?.[index]?.[columnIndex] ?? "";
       const fullCorrect =
  String(answerKey.shortAnswer?.[index] ?? "");

const correctChars = fullCorrect.split("");

const correct =
  correctChars[columnIndex] ?? "";
    return (

      <div
  key={columnIndex}
  className="flex flex-col items-center gap-1"
>

        <div
  className={cn(
    "relative flex h-11 w-11 items-center justify-center rounded border font-bold transition-all",

    !showAnswer &&
      current &&
      "border-primary bg-primary/10",

    showAnswer &&
      current === correct &&
      current !== "" &&
      "bg-green-600 border-green-600 text-white",

    showAnswer &&
      current !== "" &&
      current !== correct &&
      "bg-red-600 border-red-600 text-white"
  )}
>
{current}


</div>
        <div className="flex flex-col gap-1">

  {/* dòng 1 */}

  <Button
  size="sm"
  className={cn(
    "h-7 w-7 p-0 text-sm font-semibold",

    current === "-"
      ? "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground hover:border-primary dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground"
      : "bg-background text-foreground border-input hover:bg-background hover:text-foreground dark:bg-background dark:text-foreground dark:hover:bg-background dark:hover:text-foreground"
  )}
  variant="outline"
    disabled={!!result || columnIndex !== 0}
    onClick={() =>
      chooseShortAnswer(index, columnIndex, "-")
    }
  >
    {columnIndex === 0 ? "-" : ""}
  </Button>

  {/* dòng 2 */}

  <Button
  size="sm"
  className={cn(
    "h-7 w-7 p-0 text-xs",

    current === "."
     ? "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground hover:border-primary dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground"
      : "bg-background text-foreground border-input hover:bg-background hover:text-foreground dark:bg-background dark:text-foreground dark:hover:bg-background dark:hover:text-foreground"
  )}
  variant="outline"
    disabled={
      !!result ||
      !(columnIndex === 1 || columnIndex === 2)
    }
    onClick={() =>
      chooseShortAnswer(index, columnIndex, ".")
    }
  >
    {columnIndex === 1 || columnIndex === 2
      ? "."
      : ""}
  </Button>

  {/* dòng 3 -> 12 */}

  {DIGITS.map((d) => (

    <Button
  key={d}
  size="sm"
  className={cn(
    "h-7 w-7 p-0 text-xs",

    current === d
      ? "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground hover:border-primary dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground"
      : "bg-background text-foreground border-input hover:bg-background hover:text-foreground dark:bg-background dark:text-foreground dark:hover:bg-background dark:hover:text-foreground"
  )}
  variant="outline"
  disabled={!!result}
  onClick={() =>
    chooseShortAnswer(
      index,
      columnIndex,
      d
    )
  }
>
  {d}
</Button>

  ))}

</div>

      </div>

    );

  })}

</div>

</div>

);
})}

</div>

</section>
          )}
                    {/* ==========================================
              KẾT QUẢ
          ========================================== */}

          {result && (

            <Card className="mb-8 border-green-300">

              <CardHeader>

                <CardTitle>

                  Kết quả bài làm

                </CardTitle>

              </CardHeader>

              <CardContent className="space-y-5">

                <div className="text-center">

                  <p className="text-sm text-muted-foreground">

                    Điểm số

                  </p>

                  <p className="mt-2 text-5xl font-bold text-blue-600">

                    {Number(result.score).toFixed(2)}

                  </p>

                </div>

                <div
                  className={
                    result.passed
                      ? "rounded-lg bg-green-100 p-4 text-center font-bold text-green-700"
                      : "rounded-lg bg-red-100 p-4 text-center font-bold text-red-700"
                  }
                >

                  {result.passed
                    ? "✓ ĐẠT"
                    : "✗ CHƯA ĐẠT"}

                </div>

                <div className="grid grid-cols-2 gap-3">

                  <Button
                    onClick={() =>
                      router.push("/student-exams")
                    }
                  >

                    Quay về danh sách

                  </Button>

                  {(exam.max_attempts ?? 1) >
                    attempt.attempt_number && (

                    <Button
                      variant="outline"
                      onClick={handleRetry}
                    >
                      Làm lại
                    </Button>

                  )}

                </div>

              </CardContent>

            </Card>

          )}
          {showAnswer && (

  <Card className="mb-8 border-blue-300">

    <CardHeader>

      <CardTitle>

        Đáp án đã được mở

      </CardTitle>

    </CardHeader>

    <CardContent>

      <p className="text-sm text-muted-foreground">

        Đáp án đúng đã được hiển thị ngay trên từng câu hỏi.

        <br />

        Màu xanh là đáp án đúng.

        <br />

        Màu đỏ là đáp án bạn làm sai.

      </p>

    </CardContent>

  </Card>

)}

          {/* ==========================================
              NÚT NỘP BÀI
          ========================================== */}

          {!result && (

           <Card className="rounded-2xl shadow-sm border">

              <CardContent className="pt-6">

                <Button
                  className="h-12 w-full text-base font-semibold"
                  disabled={submitMutation.isPending}
                 onClick={() =>
                      setSubmitDialogOpen(true)
                  }
                >

                  {submitMutation.isPending
                    ? "Đang nộp bài..."
                    : "Nộp bài"}

                </Button>

              </CardContent>

            </Card>

          )}</div>

        </div>

        <AlertDialog
  open={submitDialogOpen}
  onOpenChange={setSubmitDialogOpen}
>
  <AlertDialogContent>

    <AlertDialogHeader>

      <AlertDialogTitle>
        Xác nhận nộp bài
      </AlertDialogTitle>

      <AlertDialogDescription>
        Sau khi nộp bài bạn sẽ không thể thay đổi đáp án.
        Bạn có chắc chắn muốn nộp bài?
      </AlertDialogDescription>

    </AlertDialogHeader>

    <AlertDialogFooter>

      <AlertDialogCancel>
        Huỷ
      </AlertDialogCancel>

      <AlertDialogAction
  disabled={submitMutation.isPending}
  onClick={async (event) => {
    event.preventDefault();

    if (submitMutation.isPending) {
      return;
    }

    await handleSubmit(false);
  }}
>
  {submitMutation.isPending
    ? "Đang nộp bài..."
    : "Nộp bài"}
</AlertDialogAction>

    </AlertDialogFooter>

  </AlertDialogContent>
</AlertDialog>

      </div>

    

  );
}