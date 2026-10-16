"use client";

import Link from "next/link";
import { ArrowLeft, Users, KeyRound, Pencil, FileText, ExternalLink, LockKeyhole, Copy, Lock, Unlock } from "lucide-react";
import "./exam-detail.css";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import {
  useDeactivateExam,
  useDuplicateExam,
  useExam,
  usePublishExam,
  useExamPrerequisites,
} from "@/hooks/use-exams";

const PdfViewer = dynamic(
  () => import("@/components/exams/pdf-viewer").then((module) => module.PdfViewer),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[700px] w-full" />,
  }
);

export default function ExamDetailPage() {
  const params = useParams();

  const id = params.id as string;

  const examQuery = useExam(id);

const prerequisitesQuery =
  useExamPrerequisites(id);

  const publish = usePublishExam();

  const close = useDeactivateExam();

  const duplicate =
    useDuplicateExam();

  if (examQuery.isLoading) {
    return (
      <div className="p-8">
        Đang húc . . . 
      </div>
    );
  }

  if (!examQuery.data) {
    return (
      <div className="p-8">
        Không tìm thấy đề thi.
      </div>
    );
  }

  const exam = examQuery.data;
  console.log("[EXAM PDF]", {
  examId: exam.id,
  examFileUrl: exam.exam_file_url,
});
function handleToggleStatus() {
  if (exam.status === "LOCKED") {
    publish.mutate(id);
    return;
  }

  if (exam.status === "OPEN") {
    close.mutate(id);
  }
}
  return (
    <div className="exam-detail space-y-5">
      <header className="detail-panel flex flex-wrap items-center justify-between gap-5 p-5 sm:p-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/exams" aria-label="Quay lại danh sách đề thi" className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200"><ArrowLeft className="size-4" /></Link>
          <div className="min-w-0">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <Badge className={`rounded-md text-[11px] font-bold ${exam.status === "OPEN" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>{exam.status === "OPEN" ? "ĐANG MỞ (OPEN)" : exam.status === "LOCKED" ? "ĐANG KHÓA (LOCKED)" : exam.status}</Badge>
              <Badge className="rounded-md border-transparent bg-slate-100 text-[11px] font-bold text-slate-600">{exam.category === "ATTENDANCE" ? "BTDD • ĐIỂM DANH" : exam.category === "PERIODIC" ? "KTĐK • ĐỊNH KỲ" : exam.category}</Badge>
              <Badge className="rounded-md border-slate-200 bg-white text-[11px] font-bold text-slate-500">{exam.exam_type}</Badge>
            </div>
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-950">{exam.title}</h1>
            {exam.description && <p className="mt-2 text-sm leading-relaxed text-slate-500">{exam.description}</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/exams/${exam.id}/answers`} className="detail-action border-transparent bg-slate-100"><Users className="size-4 text-slate-500" />Bài làm</Link>
          <Link href={`/exams/${exam.id}/answer-key`} className="detail-action"><KeyRound className="size-4 text-amber-500" />Đáp án OMR</Link>
          <Link href={`/exams/${exam.id}/edit`} className="detail-action border-slate-900 bg-slate-900 text-white hover:bg-slate-800"><Pencil className="size-4 text-amber-400" />Chỉnh sửa</Link>
        </div>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(280px,1fr)_minmax(0,2fr)]">
        <aside className="space-y-5">
          <Card className="detail-panel">
            <CardHeader><CardTitle className="detail-title">Thông số cấu hình</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div className="detail-stat"><p>Thời gian làm</p><strong>{exam.duration_minutes} phút</strong></div>
              <div className="detail-stat"><p>Điểm đạt chuẩn</p><strong className="text-emerald-700">{exam.attendance_min_score ?? "--"}{exam.attendance_min_score != null && " / 10"}</strong></div>
              <div className="detail-stat"><p>Số lần làm tối đa</p><strong>{exam.max_attempts == null ? "Không giới hạn" : `${exam.max_attempts} lượt`}</strong></div>
              <div className="detail-stat"><p>Hiện đáp án</p><strong className={exam.show_answer ? "text-emerald-700" : "text-rose-600"}>{exam.show_answer ? "Đang bật" : "Đang khóa"}</strong></div>
              <div className="detail-stat col-span-2"><p>Số ngày được phép làm</p><strong>{exam.exam_duration_days ?? "Không giới hạn"}{exam.exam_duration_days != null && " ngày"}</strong></div>
             </CardContent>
          </Card>
          <Card className="detail-panel">
            <CardHeader><CardTitle className="detail-title">Thao tác</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button onClick={handleToggleStatus} disabled={publish.isPending || close.isPending} className={`rounded-xl font-bold ${exam.status === "LOCKED" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-900 text-white hover:bg-slate-800"}`}>{exam.status === "LOCKED" ? <Unlock className="size-4" /> : <Lock className="size-4" />}{publish.isPending || close.isPending ? "Đang xử lý..." : exam.status === "LOCKED" ? "Open" : "Locked"}</Button>
              <Button variant="outline" className="rounded-xl border-slate-200 bg-white font-bold text-slate-700" onClick={() => duplicate.mutate(id)}><Copy className="size-4" />Nhân bản</Button>
            </CardContent>
          </Card>
          <Card className="detail-panel">
            <CardHeader><CardTitle className="detail-title">Đề thi tiên quyết</CardTitle></CardHeader>
            <CardContent>
              {prerequisitesQuery.isLoading ? <p className="text-sm text-slate-500">Đang tải đề thi tiên quyết…</p> : prerequisitesQuery.data?.length ? <div className="space-y-3">{prerequisitesQuery.data.map((prerequisite) => <div key={prerequisite.id} className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5"><div><p className="text-sm font-bold text-slate-900">{prerequisite.prerequisite_exam.title}</p><p className="mt-1 text-xs text-slate-500">{prerequisite.prerequisite_exam.category === "ATTENDANCE" ? "Điểm danh" : "Kiểm tra định kỳ"} · {prerequisite.prerequisite_exam.exam_type === "MOET" ? "THPT 2025" : "Tự do"}</p><p className="mt-1 text-xs text-slate-500">Học sinh phải nộp đề này trước.</p></div><LockKeyhole className="mt-1 size-4 shrink-0 text-amber-500" /></div>)}</div> : <p className="text-sm text-slate-500">Không có đề thi tiên quyết.</p>}
            </CardContent>
          </Card>


        </aside>

        <Card className="detail-panel min-w-0">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <CardTitle className="flex items-center gap-2 text-sm font-extrabold uppercase text-slate-900"><FileText className="size-4 text-amber-500" />Bản xem trước file đề thi (PDF)</CardTitle>
              {exam.exam_file_url && <a href={exam.exam_file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700">Mở tab mới <ExternalLink className="size-3.5" /></a>}
            </div>
          </CardHeader>
          <CardContent>
            <div className="detail-pdf overflow-x-auto rounded-2xl bg-slate-900">
              {exam.exam_file_url ? <PdfViewer url={exam.exam_file_url} /> : <div className="flex min-h-[520px] flex-col items-center justify-center gap-3 p-6 text-center"><FileText className="size-10 text-amber-400" /><p className="text-base font-bold text-white">Chưa có file PDF</p><p className="text-sm text-slate-400">Thêm liên kết PDF trong phần chỉnh sửa đề thi.</p></div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
