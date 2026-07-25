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

  return (
    <div className="rounded-xl border bg-background p-6">

      <Document
        file={url}
        onLoadSuccess={({ numPages }) =>
          setPages(numPages)
        }
      >
        {Array.from(
          { length: pages },
          (_, index) => (
            <div
              key={index}
              className="mb-6 flex justify-center"
            >
              <Page
                pageNumber={index + 1}
                width={800}
              />
            </div>
          )
        )}
      </Document>

    </div>
  );
}