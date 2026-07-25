"use client";

import PdfViewer from "./pdf-viewer";
import AnswerSheet from "./answer-sheet";

interface Props {
  attempt: any;
  exam: any;
}

export default function StudentExamLayout({
  attempt,
  exam,
}: Props) {
  return (
    <div className="flex h-[calc(100vh-64px)]">

      {/* PDF */}

      <div className="w-1/2 border-r bg-muted/20">
        <PdfViewer
          url={exam.exam_file_url}
        />
      </div>

      {/* Phiếu đáp án */}

      <div className="w-1/2 overflow-y-auto">
        <AnswerSheet
          attempt={attempt}
          exam={exam}
        />
      </div>

    </div>
  );
}