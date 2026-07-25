"use client";

import PdfViewer from "./pdf-viewer";
import AnswerSheet from "./answer-sheet";

interface Props {
  attempt: any;
  exam: any;
  questions: any[];
}

export default function StudentExamLayout({
  attempt,
  exam,
  questions,
}: Props) {
  return (
    <div className="flex h-[calc(100vh-64px)]">

      {/* PDF bên trái */}

      <div className="w-[72%] border-r bg-muted/20">

        <PdfViewer
          url={exam.exam_file_url}
        />

      </div>

      {/* Phiếu trả lời bên phải */}

      <div className="w-[28%] overflow-hidden">

        <AnswerSheet
          attempt={attempt}
          exam={exam}
          questions={questions}
        />

      </div>

    </div>
  );
}