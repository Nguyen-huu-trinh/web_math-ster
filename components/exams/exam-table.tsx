"use client";
import { toast } from "sonner";
import Link from "next/link";
import { ExamStatusBadge } from "./exam-status-badge";
import { ExamEditableNumber } from "./exam-editable-number";
import { Button } from "@/components/ui/button";
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
  Input,
} from "@/components/ui/input";

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
  MoreHorizontal,
  Plus,
  Search,
  Link2,
  Copy,
  Users,
} from "lucide-react";

import { Exam } from "@/types/exam";

interface Props {
  exams: Exam[];
  keyword: string;
  onKeywordChange: (value: string) => void;
  onPublish?: (id: string) => void;
  onDeactivate?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// function statusBadge(status: string) {
//   switch (status) {
//     case "DRAFT":
//       return (
//         <Badge variant="secondary">
//           Draft
//         </Badge>
//       );

//     case "PUBLISHED":
//       return (
//         <Badge>
//           Published
//         </Badge>
//       );

//     case "CLOSED":
//       return (
//         <Badge variant="destructive">
//           Closed
//         </Badge>
//       );

//     default:
//       return (
//         <Badge variant="outline">
//           {status}
//         </Badge>
//       );
//   }
// }
const copyExamLink = async (examId: string) => {
  const url =
    `${window.location.origin}/student-exams/open/${examId}`;

  await navigator.clipboard.writeText(url);

 toast.success("Đã sao chép liên kết đề");
};

export function ExamTable({
  exams,
  keyword,
  onKeywordChange,
  onPublish,
  onDeactivate,
  onDuplicate,
  onDelete,
}: Props)


{

  return (

    <Card>

      <CardContent className="space-y-6 p-6">

        <div className="flex flex-wrap items-center justify-between gap-3">

          <div className="relative w-full sm:w-96">

            <Search
              className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
            />

            <Input
              placeholder="Tìm đề thi..."
              aria-label="Tìm đề thi"
              value={keyword}
              onChange={(event) => onKeywordChange(event.target.value)}
              className="pl-9"
            />

          </div>

          <Link href="/exams/create">
            <Button>
                <Plus className="mr-2 h-4 w-4" />
                Tạo đề
            </Button>
            </Link>
        </div>

        <p className="text-sm text-muted-foreground">Bấm vào điểm hoặc số ngày để sửa. Enter để lưu, Esc để hủy. Để trống số ngày nếu không giới hạn.</p>

        <Table>

          <TableHeader>

            <TableRow>

              <TableHead>Tên đề</TableHead>

              <TableHead>Điểm điểm danh</TableHead>

              <TableHead>Số ngày được phép làm</TableHead>

              <TableHead>Thời gian</TableHead>

              <TableHead>Trạng thái</TableHead>

              <TableHead></TableHead>

            </TableRow>

          </TableHeader>

          <TableBody>
            {exams.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Không tìm thấy đề thi phù hợp.</TableCell></TableRow>}

            {exams.map((exam) => (

              <TableRow key={exam.id}>

                <TableCell>

                  <div>

                    <p className="font-medium">

                      {exam.title}

                    </p>

                    <p className="text-sm text-muted-foreground">

                      {exam.description}

                    </p>

                  </div>

                </TableCell>

                <TableCell>

                  <ExamEditableNumber exam={exam} field="attendance_min_score" />

                </TableCell>

                <TableCell>

                  <ExamEditableNumber exam={exam} field="exam_duration_days" />

                </TableCell>

                <TableCell>

                  {exam.duration_minutes} phút

                </TableCell>

                <TableCell>

                  <ExamStatusBadge
                    status={exam.status}
                />

                </TableCell>

                <TableCell align="right">

                  <DropdownMenu>

                   <DropdownMenuTrigger>

                    <Button
                        variant="ghost"
                        size="icon"
                    >

                        <MoreHorizontal className="h-4 w-4" />

                    </Button>

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

                </TableCell>

              </TableRow>

            ))}

          </TableBody>

        </Table>

      </CardContent>

    </Card>

  );

}
