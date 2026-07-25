"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export function UploadExamFile({
  value,
  onChange,
}: Props) {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) return;

      setLoading(true);

      try {
        const formData = new FormData();

        formData.append("file", file);

        const response = await fetch(
          "/api/exams/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok)
          throw new Error();

        const data = await response.json();

        onChange(data.url);
      } finally {
        setLoading(false);
      }
    },
    [onChange]
  );

  const { getRootProps, getInputProps } =
    useDropzone({
      accept: {
        "application/pdf": [".pdf"],
      },
      multiple: false,
      onDrop,
    });

  return (
    <div className="space-y-4">

      <div
        {...getRootProps()}
        className="cursor-pointer rounded-lg border-2 border-dashed p-10 text-center hover:bg-muted"
      >
        <input {...getInputProps()} />

        <p className="font-medium">
          Kéo PDF vào đây
        </p>

        <p className="text-sm text-muted-foreground">
          hoặc click để chọn
        </p>

      </div>

      {loading && (
        <Button disabled>
          Uploading...
        </Button>
      )}

      {value && (
        <iframe
          src={value}
          className="h-[500px] w-full rounded-lg border"
        />
      )}
    </div>
  );
}