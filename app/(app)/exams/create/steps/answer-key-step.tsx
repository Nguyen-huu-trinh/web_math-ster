"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { AnswerKey, CreateExamDto } from "@/types/exam";

interface Props {
  form: CreateExamDto;
  setForm: Dispatch<SetStateAction<CreateExamDto>>;
}

export function AnswerKeyStep({ form, setForm }: Props) {
  const [quickAnswers, setQuickAnswers] = useState("");
  const [quickError, setQuickError] = useState("");
  const config = form.question_config;
  const secondStart = config.multipleChoice;
  const thirdStart = secondStart + config.trueFalse;
  const freeScore = (secondStart + config.trueFalse + config.shortAnswer) ? Number((10 / (thirdStart + config.shortAnswer)).toFixed(2)) : 0;

  // Keep the same arrays and string values consumed by the existing backend.
  function update(section: keyof AnswerKey, index: number, value: string, column?: number) {
    setForm((prev) => {
      const next: AnswerKey = {
        multipleChoice: Array.from({ length: config.multipleChoice }, (_, i) => prev.answer_key.multipleChoice[i] ?? ""),
        trueFalse: Array.from({ length: config.trueFalse }, (_, i) => Array.from({ length: 4 }, (_, j) => prev.answer_key.trueFalse[i]?.[j] ?? "")),
        shortAnswer: Array.from({ length: config.shortAnswer }, (_, i) => prev.answer_key.shortAnswer[i] ?? ""),
      };
      if (section === "trueFalse" && column !== undefined) next.trueFalse[index][column] = value;
      else if (section !== "trueFalse") next[section][index] = value;
      return { ...prev, answer_key: next };
    });
  }

  function fillQuickAnswers() {
    const answers = quickAnswers.toUpperCase().replace(/[\s,;]+/g, "");
    if (answers.length !== config.multipleChoice || !/^[ABCD]*$/.test(answers)) {
      setQuickError(`Nhập đúng ${config.multipleChoice} ký tự A, B, C hoặc D.`);
      return;
    }
    setForm((prev) => ({ ...prev, answer_key: { ...prev.answer_key, multipleChoice: answers.split("") } }));
    setQuickError("");
  }

  return (
    <div className="space-y-5">
      {config.multipleChoice > 0 && <section className="answer-panel">
        <div className="answer-section-heading"><h2>Phần I • Trắc nghiệm 4 lựa chọn (Câu 1 – {secondStart})</h2><span>{form.exam_type === "MOET" ? "0.25" : freeScore} điểm / câu</span></div>

        {quickError && <p role="alert" className="mb-3 text-sm text-rose-600">{quickError}</p>}
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-4">
          {Array.from({ length: secondStart }, (_, index) => (
            <div key={index} className="answer-entry mb-3 break-inside-avoid">
              <span className="shrink-0 font-extrabold text-slate-900">{index + 1}.</span>
              <div className="flex gap-1.5" role="group" aria-label={`Đáp án câu ${index + 1}`}>
                {["A", "B", "C", "D"].map((answer) => (
                  <button key={answer} type="button" aria-label={`Câu ${index + 1}: ${answer}`} aria-pressed={form.answer_key.multipleChoice[index] === answer} onClick={() => update("multipleChoice", index, answer)} className={`flex size-8 items-center justify-center rounded-full border text-sm font-bold transition-colors ${form.answer_key.multipleChoice[index] === answer ? "border-slate-900 bg-slate-900 text-amber-400" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-100"}`}>
                    {answer}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>}

      {config.trueFalse > 0 && <section className="answer-panel">
        <div className="answer-section-heading"><h2>Phần II • Trắc nghiệm đúng / sai (Câu {secondStart + 1} – {thirdStart})</h2><span>{form.exam_type === "MOET" ? "Thang điểm Bộ GD (0.1 – 0.25 – 0.5 – 1.0đ)" : `${freeScore} điểm / câu`}</span></div>
        <p className="mb-4 text-sm leading-relaxed text-slate-500">Chọn Đ cho đúng, S cho sai.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: config.trueFalse }, (_, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="mb-3 text-sm font-extrabold text-slate-900">Câu {secondStart + index + 1} <span className="float-right text-xs font-medium text-slate-500">4 mệnh đề</span></p>
              {["a", "b", "c", "d"].map((label, column) => (
                <div key={label} className="mb-2 flex items-center justify-between gap-3 text-sm font-bold">
                  <span>{label})</span>
                  <div className="flex gap-1.5" role="group" aria-label={`Câu ${secondStart + index + 1} ý ${label}`}>
                    {["Đ", "S"].map((answer) => (
                      <button key={answer} type="button" aria-label={`Câu ${secondStart + index + 1} ý ${label}: ${answer}`} aria-pressed={form.answer_key.trueFalse[index]?.[column] === answer} onClick={() => update("trueFalse", index, answer, column)} className={`flex size-8 items-center justify-center rounded-md border text-sm font-bold transition-colors ${form.answer_key.trueFalse[index]?.[column] === answer ? "border-slate-900 bg-slate-900 text-amber-400" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-100"}`}>
                        {answer}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>}

      {config.shortAnswer > 0 && <section className="answer-panel">
        <div className="answer-section-heading"><h2>Phần III • Trả lời ngắn (Câu {thirdStart + 1} – {thirdStart + config.shortAnswer})</h2><span>{form.exam_type === "MOET" ? "0.5" : freeScore} điểm / câu</span></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: config.shortAnswer }, (_, index) => <label key={index} className="answer-entry"><div><p className="font-extrabold text-slate-900">Câu {thirdStart + index + 1}</p><p className="mt-1 text-xs font-medium text-slate-500">Tối đa 4 ký tự</p></div><Input aria-label={`Đáp án câu ${thirdStart + index + 1}`} placeholder="VD: -2.5" maxLength={4} autoComplete="off" value={form.answer_key.shortAnswer[index] ?? ""} onChange={(event) => { const value = event.target.value.replace(",", "."); if (/^-?\d*\.?\d*$/.test(value)) update("shortAnswer", index, value); }} className="w-28 text-center font-extrabold placeholder:font-normal placeholder:text-slate-400" /></label>)}
        </div>
      </section>}
      {thirdStart + config.shortAnswer === 0 && <p className="answer-panel text-center text-slate-500">Chưa có câu hỏi. Quay lại cấu hình để thêm số câu.</p>}
    </div>
  );
}
