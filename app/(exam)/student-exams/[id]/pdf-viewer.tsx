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
  const isGoogleDrive = Boolean(url && /^https:\/\/drive\.google\.com(?:\/|$)/i.test(url));

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
      <div className="relative min-h-0 flex-1">
        <iframe
          src={url}
          title="exam-pdf"
          className="h-full w-full border-0"
        />
        {isGoogleDrive && (
          <div
            aria-hidden="true"
            className="pointer-events-auto absolute right-0 top-0 z-10 h-20 w-20 cursor-default bg-transparent"
            onPointerDown={(event) => event.preventDefault()}
            onContextMenu={(event) => event.preventDefault()}
          />
        )}
      </div>
    </div>
  );
}
