"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import { useUploadExamFile } from "@/hooks/use-exams";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

export function UploadExamFile({
  value,
  onChange,
}: Props) {
  const uploadExamFile = useUploadExamFile();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) return;

      try {
        const data = await uploadExamFile.mutateAsync(file);

        onChange(data.url);
      } catch {}
    },
    [onChange, uploadExamFile]
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

      {uploadExamFile.isPending && (
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
