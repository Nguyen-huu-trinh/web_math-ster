"use client";

import { Dispatch, SetStateAction, useMemo, useEffect } from "react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  CreateExamDto,
  QuestionConfig,
} from "@/types/exam";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";


interface Props {
  form: CreateExamDto;
  setForm: Dispatch<SetStateAction<CreateExamDto>>;
  onConfigChange: (
    config: QuestionConfig
  ) => void;
}

export function QuestionConfigStep({
  form,
  setForm,
  onConfigChange,
}: Props) {
  const config = form.question_config;

 const isTHPT =
  form.exam_type === "MOET";

  // Tự động áp cấu trúc THPT
 useEffect(() => {
  if (!isTHPT) return;

  const fixedConfig: QuestionConfig = {
    multipleChoice: 12,
    trueFalse: 4,
    shortAnswer: 6,
  };

  if (
    config.multipleChoice ===
      fixedConfig.multipleChoice &&
    config.trueFalse ===
      fixedConfig.trueFalse &&
    config.shortAnswer ===
      fixedConfig.shortAnswer
  ) {
    return;
  }

  onConfigChange(fixedConfig);
}, [
  isTHPT,
  config.multipleChoice,
  config.trueFalse,
  config.shortAnswer,
  onConfigChange,
]);

  const totalQuestions =
    config.multipleChoice +
    config.trueFalse +
    config.shortAnswer;

  const scorePerQuestion = useMemo(() => {
    if (isTHPT) return null;

    if (totalQuestions === 0) return 0;

    return Number((10 / totalQuestions).toFixed(2));
  }, [isTHPT, totalQuestions]);

 function update(
  key:
    | "multipleChoice"
    | "trueFalse"
    | "shortAnswer",
  value: number
) {
  const newConfig: QuestionConfig = {
    ...form.question_config,
    [key]: value,
  };

  onConfigChange(newConfig);
}
  return (
    <Card className="wizard-panel">
      <CardContent className="space-y-5 p-6">
        <div className="wizard-section-title flex items-center justify-between gap-2"><h2>2. Cấu trúc & thang điểm</h2><Badge className="rounded border-amber-200 bg-amber-50 text-amber-700">{isTHPT ? "Bộ GD 2025" : "Tổng 10 điểm"}</Badge></div>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          {([{ value: "MOET", label: "Chuẩn THPT (22 câu)" }, { value: "FREE", label: "Đề tự do (Tùy chỉnh)" }] as const).map((type) => <button key={type.value} type="button" aria-pressed={form.exam_type === type.value} onClick={() => setForm((prev) => ({ ...prev, exam_type: type.value }))} className={`rounded-lg px-2 py-2.5 text-xs font-bold ${form.exam_type === type.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>{type.label}</button>)}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {([{ key: "multipleChoice", label: "Phần I (ABCD)", score: "0.25đ / câu" }, { key: "trueFalse", label: "Phần II (Đ/S)", score: "Tối đa 1.0đ" }, { key: "shortAnswer", label: "Phần III (OMR)", score: "0.5đ / câu" }] as const).map((part) => <div key={part.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center"><Label className="justify-center text-[11px] uppercase text-slate-400">{part.label}</Label>{isTHPT ? <p className="my-2 text-2xl font-extrabold text-slate-900">{config[part.key]}</p> : <Input aria-label={`Số câu ${part.label}`} type="number" min={0} step={1} value={config[part.key]} onChange={(event) => update(part.key, Number(event.target.value))} className="my-2 text-center font-bold" />}<p className="text-[11px] text-slate-500">{isTHPT ? part.score : `${scorePerQuestion}đ / câu`}</p></div>)}
        </div>
        <p className="text-xs text-slate-500">{isTHPT ? "Đúng / Sai: 0.1 – 0.25 – 0.5 – 1.0 điểm theo số ý đúng." : `Tổng ${totalQuestions} câu • Chia đều 10 điểm theo cấu trúc đề tự do.`}</p>
      </CardContent>
    </Card>
  );
}
