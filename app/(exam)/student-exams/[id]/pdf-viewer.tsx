"use client";

import { ReactNode } from "react";

interface Props {
  url?: string | null;

  children?: ReactNode;
}

export default function PdfViewer({
  url,
  children,
}: Props) {
  if (!url) {
    return (
      <div className="flex h-full items-center justify-center">
        Không có file PDF.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Toolbar */}
      {children}

      {/* PDF */}
      <iframe
        src={url}
        title="exam-pdf"
        className="flex-1 w-full border-0"
      />
    </div>
  );
}