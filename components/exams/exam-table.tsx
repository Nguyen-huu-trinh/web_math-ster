"use client";

import Link from "next/link";
import { ExamStatusBadge } from "./exam-status-badge";
import { Button } from "@/components/ui/button";
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
  onPublish?: (id: string) => void;
  onClose?: (id: string) => void;
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
    `${window.location.origin}/student-exams/start/${examId}`;

  await navigator.clipboard.writeText(url);

  alert("Đã sao chép liên kết đề");
};

export function ExamTable({
  exams,
  onPublish,
  onClose,
  onDuplicate,
  onDelete,
}: Props)


{

  return (

    <Card>

      <CardContent className="space-y-6 p-6">

        <div className="flex items-center justify-between">

          <div className="relative w-96">

            <Search
              className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
            />

            <Input
              placeholder="Tìm đề thi..."
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

        <Table>

          <TableHeader>

            <TableRow>

              <TableHead>Tên đề</TableHead>

              <TableHead>Loại</TableHead>

              <TableHead>Danh mục</TableHead>

              <TableHead>Thời gian</TableHead>

              <TableHead>Trạng thái</TableHead>

              <TableHead></TableHead>

            </TableRow>

          </TableHeader>

          <TableBody>

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

                  {exam.exam_type}

                </TableCell>

                <TableCell>

                  {exam.category}

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

                        Chi tiết

                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => copyExamLink(exam.id)}
                        >
                          <Link2 className="mr-2 h-4 w-4" />
                          Sao chép liên kết
                        </DropdownMenuItem>

                        
                        
                      <DropdownMenuItem
                        onClick={() => {
                            window.location.href = `/exams/${exam.id}/edit`;
                        }}
                        >

                        Chỉnh sửa

                        </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                            window.location.href =
                            `/exams/${exam.id}/answer-key`;
                        }}
                        >

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
                        onClick={() =>
                          onPublish?.(exam.id)
                        }
                      >
                        Publish
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          onClose?.(exam.id)
                        }
                      >
                        Close
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          onDuplicate?.(exam.id)
                        }
                      >
                        Nhân bản
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() =>
                          onDelete?.(exam.id)
                        }
                      >
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