"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  FileText,
 GraduationCap,
  Send,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { useSubmitAttempt } from "@/hooks/use-submit-attempt";

interface Props {
  attempt: any;
  exam: any;
}

const MC = ["A", "B", "C", "D"];
const TF = ["Đ", "S"];

export default function AnswerSheet({
  attempt,
  exam,
}: Props) {

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

  const [answers, setAnswers] = useState({
    multipleChoice: Array(
      questionConfig.multipleChoice
    ).fill(""),

    trueFalse: Array.from(
      {
        length:
          questionConfig.trueFalse,
      },
      () => ["", "", "", ""]
    ),

    shortAnswer: Array(
      questionConfig.shortAnswer
    ).fill(""),
  });

  // ============================
  // Timer
  // ============================

  const duration =
    (exam.duration_minutes ?? 60) * 60;

  const [timeLeft, setTimeLeft] =
    useState(duration);

  // ============================
  // Result
  // ============================

  const [result, setResult] =
    useState<any>(null);

  // ============================
  // Submit
  // ============================

  const submitMutation =
    useSubmitAttempt();
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
      (x: string) => x.trim() !== ""
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

      next.multipleChoice[index] = value;

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

      next.trueFalse[questionIndex][columnIndex] =
        value;

      return next;
    });
  }

  // ============================
  // Short Answer
  // ============================

  function chooseShortAnswer(
    index: number,
    value: string
  ) {
    if (result) return;

    setAnswers((prev) => {

      const next = {
        ...prev,
        shortAnswer: [...prev.shortAnswer],
      };

      next.shortAnswer[index] = value;

      return next;
    });
  }

  // ============================
  // Submit
  // ============================

  async function handleSubmit(
    confirm = true
  ) {

    if (submitMutation.isPending) return;

    if (
      confirm &&
      !window.confirm(
        "Bạn chắc chắn muốn nộp bài?"
      )
    ) {
      return;
    }

    try {

      const payload = {
        attemptId: attempt.id,
        answers: {
          multipleChoice:
            answers.multipleChoice,
          trueFalse:
            answers.trueFalse,
          shortAnswer:
            answers.shortAnswer,
        },
      };

      const data =
        await submitMutation.mutateAsync(
          payload
        );

      setResult(data);

    } catch (err) {

      console.error(err);

      alert("Nộp bài thất bại.");

    }
  }



const submitted = !!result;
const lowTime = timeLeft <= 300;
    return (

    <div className="flex h-screen flex-col bg-background">

      {/* ============================
          LEFT SIDE - PDF
      ============================ */}

      

        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="size-5 shrink-0 text-primary" />
          <span className="truncate text-sm font-semibold text-foreground">{exam.title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {!submitted ? (
            <>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-sm font-bold tabular-nums",
                  lowTime
                    ? "bg-destructive/15 text-destructive"
                    : "bg-primary/15 text-foreground",
                )}
              >
                <Clock className="size-4" />
                {displayTime}
              </span>
              <Button size="sm" onClick={() => handleSubmit(true)} disabled={submitMutation.isPending}>
                <Send />
                Nộp bài
              </Button>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 px-2.5 py-1 text-sm font-bold text-foreground">
              <GraduationCap className="size-4" />
              {result ? `${result.score} điểm` : "Đã nộp"}
            </span>
          )}
        </div>
      </header>
      
      

      {/* ============================
          RIGHT SIDE
      ============================ */}

      <div className="flex-1 overflow-y-auto bg-[#f8f6ef]">

          <div className="p-4 space-y-6">

                    {/* ==========================================
              PHẦN I · TRẮC NGHIỆM
          ========================================== */}

          {questionConfig.multipleChoice > 0 && (
<section className="rounded-xl border border-border bg-card p-4 mb-8">
  <div className="mb-3 flex items-baseline justify-between border-b pb-2">
    <h3 className="text-base font-bold">
      <span className="text-primary">PHẦN I.</span>{" "}
      Trắc nghiệm nhiều lựa chọn
    </h3>
  </div>

  <div className="columns-1 sm:columns-2 xl:columns-3 gap-x-6">
    {Array.from({
      length: questionConfig.multipleChoice,
    }).map((_, index) => (
      <div
        key={index}
        className="break-inside-avoid mb-3 flex items-center gap-3 rounded-lg px-1 py-2"
      >
        <span className="w-7 text-right font-bold">
          {index + 1}
        </span>

        <div className="flex gap-2">
          {MC.map((item) => (
            <Button
              key={item}
              size="sm"
              disabled={!!result}
              variant={
                answers.multipleChoice[index] === item
                  ? "default"
                  : "outline"
              }
              onClick={() =>
                chooseMultipleChoice(index, item)
              }
              className="rounded-full w-8 h-8 p-0"
            >
              {item}
            </Button>
          ))}
        </div>
      </div>
    ))}
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

<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

{Array.from({
length: questionConfig.trueFalse,
}).map((_, questionIndex) => (

<div
key={questionIndex}
className="rounded-lg border p-3"
>

<p className="font-semibold mb-3">
Câu {questionConfig.multipleChoice + questionIndex + 1}
</p>

{["a","b","c","d"].map((label,columnIndex)=>(

<div
key={columnIndex}
className="flex justify-between items-center mb-2"
>

<span>{label})</span>

<div className="flex gap-2">

<Button
size="sm"
variant={
answers.trueFalse[questionIndex][columnIndex]=="Đ"
?"default"
:"outline"
}
disabled={!!result}
onClick={()=>chooseTrueFalse(questionIndex,columnIndex,"Đ")}
>
Đ
</Button>

<Button
size="sm"
variant={
answers.trueFalse[questionIndex][columnIndex]=="S"
?"destructive"
:"outline"
}
disabled={!!result}
onClick={()=>chooseTrueFalse(questionIndex,columnIndex,"S")}
>
S
</Button>

</div>

</div>

))}

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

<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

{Array.from({
length: questionConfig.shortAnswer,
}).map((_,index)=>(

<div
key={index}
className="rounded-lg border p-3"
>

<p className="font-semibold mb-3">
Câu {questionConfig.multipleChoice + questionConfig.trueFalse + index +1}
</p>

<input

type="text"

value={answers.shortAnswer[index]}

disabled={!!result}

onChange={(e)=>
chooseShortAnswer(index,e.target.value)
}

className="w-full rounded-lg border h-11 px-3"

placeholder="Nhập đáp án..."

 />

</div>

))}

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
                      onClick={() =>
                        window.location.reload()
                      }
                    >

                      Làm lại

                    </Button>

                  )}

                </div>

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
                    handleSubmit(true)
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

      </div>

    

  );
}