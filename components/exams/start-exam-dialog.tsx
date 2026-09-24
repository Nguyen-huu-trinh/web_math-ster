"use client";

import { useState } from "react";
import { Play, Clock3, FileQuestion, RotateCcw, AlertCircle, ArrowRight, X, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { StudentExamItem } from "@/services/student-exam-client.service";

interface Props {
  exam: StudentExamItem;
  busy: boolean;
  onClose: () => void;
  onStart: () => void | Promise<void>;
}

export function StartExamDialog({ exam, busy, onClose, onStart }: Props) {
  const [ready, setReady] = useState(false);
  const parts = [
    { label: "Trắc nghiệm", count: exam.questionConfig?.multipleChoice },
    { label: "Đúng/sai", count: exam.questionConfig?.trueFalse },
    { label: "Trả lời ngắn", count: exam.questionConfig?.shortAnswer },
  ].filter((part) => typeof part.count === "number" && Number.isInteger(part.count) && part.count > 0);
  const questionCount = parts.reduce((sum, part) => sum + (part.count ?? 0), 0);
  const remaining = Math.max(0, exam.maxAttempts - exam.attempts);
  const rewardHp = exam.category === "PERIODIC" ? 50 : exam.category === "ATTENDANCE" ? 10 : null;

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
      <DialogContent showCloseButton={false} className="max-h-[90dvh] overflow-y-auto rounded-[24px] border border-slate-200 bg-white p-0 text-slate-800 shadow-2xl sm:max-w-lg">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 text-amber-500"><Play className="size-5 fill-current" /></span>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-lg font-extrabold text-slate-900">Bắt đầu làm bài thi?</DialogTitle>
            <DialogDescription className="mt-1 text-xs font-bold text-amber-700">{exam.title}</DialogDescription>
          </div>
          <button type="button" aria-label="Đóng" disabled={busy} onClick={onClose} className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 disabled:opacity-50"><X className="size-4" /></button>
        </div>
        <div className="space-y-4 px-5 pb-5 sm:px-6">
          {exam.description && <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-3 text-xs leading-relaxed"><p className="mb-1 font-bold uppercase text-amber-800">Kiến thức trọng tâm kiểm tra</p><p className="whitespace-pre-line font-semibold text-slate-700">{exam.description}</p></div>}
          <p className="text-xs leading-relaxed text-slate-500">Sau khi bắt đầu, hệ thống sẽ tính giờ ngay lập tức và ghi nhận lượt làm bài của bạn.</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="min-w-0 rounded-2xl border border-slate-100 bg-[#F8F8FC] p-3.5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-400"><Clock3 className="size-4 shrink-0" />Thời gian thi</p>
              <p className="text-sm font-extrabold text-slate-900">{exam.duration} PHÚT</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">Tính giờ ngay khi bắt đầu</p>
            </div>
            {questionCount > 0 && (
              <div className="min-w-0 rounded-2xl border border-slate-100 bg-[#F8F8FC] p-3.5">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-400"><FileQuestion className="size-4 shrink-0" />Cấu trúc đề</p>
                <p className="text-sm font-extrabold text-slate-900">{questionCount} CÂU ({parts.length} PHẦN)</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{parts.map((part) => part.label).join(" + ")}</p>
              </div>
            )}
            {rewardHp !== null && (
              <div className="min-w-0 rounded-2xl border border-emerald-200/80 bg-emerald-50/70 p-3.5">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><Zap className="size-4 shrink-0" />Thưởng Độ Trâu</p>
                <p className="text-sm font-extrabold text-emerald-800">+{rewardHp} HP ĐỘ TRÂU</p>
              </div>
            )}
            <div className="min-w-0 rounded-2xl border border-slate-100 bg-[#F8F8FC] p-3.5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-400"><RotateCcw className="size-4 shrink-0" />Số lượt nộp</p>
              <p className="text-sm font-extrabold text-slate-900">{exam.maxAttempts === 1 ? "1 LẦN DUY NHẤT" : `CÒN ${remaining}/${exam.maxAttempts} LƯỢT`}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{remaining <= 1 ? "Không được làm lại sau khi nộp" : "Mỗi lần bắt đầu sử dụng một lượt"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-rose-700"><AlertCircle className="mt-0.5 size-5 shrink-0" /><div className="text-xs leading-relaxed"><p className="mb-1 font-extrabold uppercase">Lưu ý quan trọng</p><p>Không thoát hoặc tải lại trang trong khi làm bài. Đồng hồ vẫn tiếp tục tính sau khi bạn bắt đầu; hãy nộp bài trước khi hết giờ.</p></div></div>
          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold leading-relaxed text-slate-600"><input type="checkbox" checked={ready} onChange={(event) => setReady(event.target.checked)} disabled={busy} className="mt-0.5 size-4 shrink-0 accent-amber-500" /><span>Tôi đã chuẩn bị máy tính Casio, nháp và sẵn sàng vào thi.</span></label>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
          <Button type="button" variant="outline" disabled={busy} onClick={onClose} className="rounded-xl border-slate-200 bg-white text-slate-600">Hủy</Button>
          <Button type="button" disabled={!ready || busy || remaining === 0} onClick={() => { if (ready && !busy && remaining > 0) void onStart(); }} className="rounded-xl bg-amber-500 font-bold text-slate-950 hover:bg-amber-400 disabled:opacity-40">{busy ? "Đang mở..." : "Bắt đầu ngay"}<ArrowRight className="size-4" /></Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
