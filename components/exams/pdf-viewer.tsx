"use client";

import { Document, Page, pdfjs } from "react-pdf";
import { useState } from "react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  url: string;
}

export function PdfViewer({ url }: Props) {
  const [pages, setPages] = useState(0);

  // Nếu là link Google Drive (chứa drive.google.com)
  const isGoogleDrive = url.includes("drive.google.com");

  if (isGoogleDrive) {
    // Đảm bảo link kết thúc bằng /preview để hiển thị trong iframe
    const embedUrl = url.replace(/\/view.*$/, "/preview");

    return (
      <div className="rounded-xl border bg-background p-2">
        <iframe
          src={embedUrl}
          className="h-[750px] w-full rounded-lg border-0"
          allow="autoplay"
        />
      </div>
    );
  }

  // Nếu là link PDF trực tiếp (.pdf từ Supabase / S3 / R2...)
  return (
    <div className="rounded-xl border bg-background p-6">
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setPages(numPages)}
      >
        {Array.from({ length: pages }, (_, index) => (
          <div key={index} className="mb-6 flex justify-center">
            <Page pageNumber={index + 1} width={800} />
          </div>
        ))}
      </Document>
    </div>
  );
}