"use client";

interface Props {
  url?: string | null;
}

export default function PdfViewer({ url }: Props) {

  if (!url) {
    return (
      <div className="flex h-full items-center justify-center">
        Không có file PDF.
      </div>
    );
  }

  return (
    <iframe
      src={url}
      className="h-full w-full"
      title="exam-pdf"
    />
  );
}