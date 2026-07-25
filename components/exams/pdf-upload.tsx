"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { storageService } from "@/services/storage.service";

interface Props {
  value: string;

  onChange: (url: string) => void;
}

export function PdfUpload({
  value,
  onChange,
}: Props) {
  const [loading, setLoading] =
    useState(false);

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setLoading(true);

    try {
      const url =
        await storageService.uploadExamPdf(
          file
        );

      onChange(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">

      <input
        type="file"
        accept="application/pdf"
        onChange={handleUpload}
      />

      {loading && (
        <p>Đang upload...</p>
      )}

      {value && (
        <a
          href={value}
          target="_blank"
          className="text-primary underline"
        >
          Xem PDF
        </a>
      )}

    </div>
  );
}