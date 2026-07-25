"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PdfViewer } from "@/components/exams/pdf-viewer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  useCloseExam,
  useDuplicateExam,
  useExam,
  usePublishExam,
} from "@/hooks/use-exams";

export default function ExamDetailPage() {
  const params = useParams();

  const id = params.id as string;

  const examQuery = useExam(id);

  const publish = usePublishExam();

  const close = useCloseExam();

  const duplicate =
    useDuplicateExam();

  if (examQuery.isLoading) {
    return (
      <div className="p-8">
        Đang tải...
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

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            {exam.title}
          </h1>

          <p className="mt-2 text-muted-foreground">
            {exam.description}
          </p>

        </div>

        <div className="flex gap-2">

        <Link href={`/exams/${exam.id}/edit`}>
            <Button>
            Chỉnh sửa
            </Button>
        </Link>

        <Link href={`/exams/${exam.id}/answer-key`}>
            <Button variant="outline">
            Đáp án
            </Button>
        </Link>

        </div>

      </div>

      <div className="flex flex-wrap gap-2">

        <Badge>
          {exam.exam_type}
        </Badge>

        <Badge variant="secondary">
          {exam.category}
        </Badge>

        <Badge variant="outline">
          {exam.status}
        </Badge>

      </div>

      <div className="grid gap-6 lg:grid-cols-3">

  {/* Thông tin */}

  <Card className="lg:col-span-1">

    <CardHeader>

      <CardTitle>
        Thông tin đề thi
      </CardTitle>

    </CardHeader>

    <CardContent className="space-y-5">

      <div>

        <p className="text-sm text-muted-foreground">
          Thời gian
        </p>

        <p className="font-medium">
          {exam.duration_minutes} phút
        </p>

      </div>

      <div>

        <p className="text-sm text-muted-foreground">
          Loại đề
        </p>

        <p className="font-medium">
          {exam.exam_type}
        </p>

      </div>

      <div>

        <p className="text-sm text-muted-foreground">
          Danh mục
        </p>

        <p className="font-medium">
          {exam.category}
        </p>

      </div>

      <div>

        <p className="text-sm text-muted-foreground">
          Điểm điểm danh
        </p>

        <p className="font-medium">
          {exam.attendance_min_score ?? "--"}
        </p>

      </div>

      <div>

        <p className="text-sm text-muted-foreground">
          Số lần làm
        </p>

        <p className="font-medium">
          {exam.max_attempts}
        </p>

      </div>

      <div>

        <p className="text-sm text-muted-foreground">
          Hiện đáp án
        </p>

        <p className="font-medium">
          {exam.show_answer ? "Có" : "Không"}
        </p>

      </div>

    </CardContent>

  </Card>

  {/* PDF */}

  <div className="lg:col-span-2">

    <Card>

      <CardHeader>

        <CardTitle>
          File đề thi
        </CardTitle>

      </CardHeader>

      <CardContent>

        {exam.exam_file_url ? (

          <PdfViewer
            url={exam.exam_file_url}
          />

        ) : (

          <div className="flex h-[700px] items-center justify-center rounded-lg border">

            <p className="text-muted-foreground">
              Chưa có file PDF
            </p>

          </div>

        )}

      </CardContent>

    </Card>

  </div>

</div>
      

      <Card>

        <CardHeader>

          <CardTitle>
            Thao tác
          </CardTitle>

        </CardHeader>

        <CardContent className="flex gap-3">

          <Button
            onClick={() =>
              publish.mutate(id)
            }
          >
            Publish
          </Button>

          <Button
            variant="secondary"
            onClick={() =>
              close.mutate(id)
            }
          >
            Close
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              duplicate.mutate(id)
            }
          >
            Nhân bản
          </Button>

        </CardContent>

      </Card>

    </div>
  );
}