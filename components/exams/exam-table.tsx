"use client";
import { toast } from "sonner";
import Link from "next/link";
import { ExamEditableStatus } from "./exam-editable-status";
import { ExamEditableNumber } from "./exam-editable-number";
import { ExamEditableCourse } from "./exam-editable-course";
import {
  FileText,
  Pencil,
  KeyRound,
  Unlock,
  Lock,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Badge,
} from "@/components/ui/badge";


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  MoreVertical,
  Sparkles,
  Link2,
  Copy,
  Users,
} from "lucide-react";

import { Exam } from "@/types/exam";

interface Props {
  exams: Exam[];
  onPublish?: (id: string) => void;
  onDeactivate?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const copyExamLink = async (examId: string) => {
  const url =
    `${window.location.origin}/student-exams/open/${examId}`;

  await navigator.clipboard.writeText(url);

 toast.success("Đã sao chép liên kết đề");
};

export function ExamTable({
  exams,
  onPublish,
  onDeactivate,
  onDuplicate,
  onDelete,
}: Props)


{

  return (

    <Card className="exam-list gap-0 overflow-hidden rounded-[30px] border-slate-200 bg-white py-0 shadow-none">
      <CardContent className="p-0">
        <div className="flex items-start gap-2 border-b border-slate-100 bg-slate-50/80 px-5 py-4 text-sm font-medium text-slate-500 sm:px-8">
          <Sparkles className="size-5 shrink-0 text-amber-500" />
          <p><strong>Mẹo:</strong> Bấm trực tiếp vào <span className="underline decoration-dotted underline-offset-4">Khóa, Điểm đạt, Hạn làm bài, Thời gian</span> hoặc <span className="underline decoration-dotted underline-offset-4">Trạng thái</span> để sửa nhanh. <span className="sr-only">Enter để lưu, Esc để hủy. Để trống số ngày nếu không giới hạn.</span></p>
        </div>
        <Table className="min-w-[1000px]">

          <TableHeader>

            <TableRow>

              <TableHead className="w-[40%]">Tên đề thi &amp; phân loại</TableHead>

              <TableHead>Khóa</TableHead>

              <TableHead>Điểm đạt</TableHead>

              <TableHead>Hạn mở</TableHead>

              <TableHead>Thời gian</TableHead>

              <TableHead>Trạng thái</TableHead>

              <TableHead className="text-right">Thao tác nhanh</TableHead>

            </TableRow>

          </TableHeader>

          <TableBody>
            {exams.length === 0 && <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">Không tìm thấy đề thi phù hợp.</TableCell></TableRow>}

            {exams.map((exam) => (

              <TableRow key={exam.id}>

                <TableCell>

                  <div className="flex items-center gap-4">
                    <Badge className={exam.category === "PERIODIC" ? "rounded-xl border-amber-500 bg-amber-500 px-2.5 py-2 text-slate-950" : "rounded-xl border-slate-200 bg-slate-100 px-2.5 py-2 text-slate-600"}>{exam.category === "PERIODIC" ? "KTĐK" : "BTDD"}</Badge>
                    <div>
                    <p className="text-base font-extrabold tracking-tight text-slate-900">

                      {exam.title}

                    </p>

                    <p className="mt-0.5 text-sm font-medium text-slate-400">

                      {exam.description || `${exam.max_attempts == null ? "Không giới hạn" : exam.max_attempts} lượt làm • ${exam.exam_type === "FREE" ? "Đề tự do" : "Chuẩn THPT"}`}

                    </p>

                  </div>
                  </div>

                </TableCell>

                <TableCell>

                  <ExamEditableCourse exam={exam} />

                </TableCell>

                <TableCell>

                  <ExamEditableNumber exam={exam} field="attendance_min_score" />

                </TableCell>

                <TableCell>

                  <ExamEditableNumber exam={exam} field="exam_duration_days" />

                </TableCell>

                <TableCell>

                  <ExamEditableNumber exam={exam} field="duration_minutes" />

                </TableCell>

                <TableCell data-exam-status={exam.status}>

                  <ExamEditableStatus exam={exam} />

                </TableCell>

                <TableCell align="right">

                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/exams/${exam.id}/answers`} aria-label={`Xem bài làm của ${exam.title}`} title="Xem bài làm" className="exam-quick-action bg-slate-100"><Users className="size-4" /></Link>
                    <Link href={`/exams/${exam.id}/answer-key`} aria-label={`Đáp án của ${exam.title}`} title="Đáp án" className="exam-quick-action"><KeyRound className="size-4" /></Link>
                    <Link href={`/exams/${exam.id}`} aria-label={`Chi tiết ${exam.title}`} title="Chi tiết" className="exam-quick-action"><FileText className="size-4" /></Link>
                  <DropdownMenu>

                    <DropdownMenuTrigger aria-label={`Thao tác khác cho ${exam.title}`} className="flex size-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100">
                      <MoreVertical className="size-5" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">

                      <DropdownMenuItem
                        onClick={() => {
                            window.location.href = `/exams/${exam.id}`;
                        }}
                        >
                        <FileText className="mr-2 h-4 w-4 shrink-0" />
                        Chi tiết

                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => copyExamLink(exam.id)}
                        >
                          <Link2 className="mr-2 h-4 w-4" />
                          Copy link
                        </DropdownMenuItem>

                        
                        
                      <DropdownMenuItem
                        onClick={() => {
                            window.location.href = `/exams/${exam.id}/edit`;
                        }}
                        >
                          <Pencil className="mr-2 h-4 w-4 shrink-0" />
                        Chỉnh sửa

                        </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                            window.location.href =
                            `/exams/${exam.id}/answer-key`;
                        }}
                        >
                          <KeyRound className="mr-2 h-4 w-4 shrink-0" />
                        Đáp án

                        </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        window.location.href =
                          `/exams/${exam.id}/answers`;
                      }}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Xem bài làm
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        if (exam.status === "LOCKED") {
                          onPublish?.(exam.id);
                        } else if (exam.status === "OPEN") {
                          onDeactivate?.(exam.id);
                        }
                      }}
                    >
                    {exam.status === "LOCKED" ? (
                      <>
                        <Unlock className="mr-2 h-4 w-4 shrink-0" />
                        Open
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4 shrink-0" />
                        Lock
                      </>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() =>
                      onDuplicate?.(exam.id)
                    }
                  >
                    <Copy className="mr-2 h-4 w-4 shrink-0" />
                    Nhân bản
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() =>
                      onDelete?.(exam.id)
                    }
                  >
                    <Trash2 className="mr-2 h-4 w-4 shrink-0" />
                    Xóa
                  </DropdownMenuItem>

                    </DropdownMenuContent>

                  </DropdownMenu>
                  </div>

                </TableCell>

              </TableRow>

            ))}

          </TableBody>

        </Table>

      </CardContent>

    </Card>

  );

}
