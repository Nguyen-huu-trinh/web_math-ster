"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
  import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { storageService } from "@/services/storage.service";
import { Loader2 } from "lucide-react";
interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function ThumbnailUpload({
  value,
  onChange,
}: Props) 



{
    const [uploading, setUploading] = useState(false);
 async function handleUpload(file: File) {

  const allowTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ];

  if (!allowTypes.includes(file.type)) {
    toast.error("Only PNG, JPG, JPEG and WEBP are allowed.");
    return;
  }

  const maxSize =
    5 * 1024 * 1024;

  if (file.size > maxSize) {
    toast.error("Image must be smaller than 5MB.");
    return;
  }

  try {

    setUploading(true);

    const url =
      await storageService.uploadCourseThumbnail(
        file
      );

    onChange(url);
  
    toast.success("Thumbnail uploaded");

  } catch (error) {

    console.error(error);

   toast.error("Upload failed");

  } finally {

    setUploading(false);

  }
}
  return (
    <div className="space-y-3">
      <Label>Thumbnail</Label>

      <div className="flex gap-4">

        <div className="relative flex h-28 w-44 items-center justify-center overflow-hidden rounded-lg border bg-muted">

          {value ? (
            <Image
              src={value}
              alt="Thumbnail"
              fill
              className="object-cover"
            />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          )}
          {value && (
            <button
                type="button"
                className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white"
            >
                Change
            </button>
            )}
            {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">

            <Loader2 className="h-6 w-6 animate-spin text-white" />

        </div>
        )}

        </div>

        <div className="flex-1">

          <Input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={async (e) => {

                const file =
                e.target.files?.[0];

                if (!file) return;

                await handleUpload(file);

            }}
            />

          {uploading ? (

  <div className="mt-2 flex items-center gap-2 text-sm">

        <Loader2 className="h-4 w-4 animate-spin" />

        Uploading...

    </div>

    ) : (

    <p className="mt-2 text-xs text-muted-foreground">
        Chọn ảnh từ máy tính.
    </p>

    )}
        </div>

      </div>
    </div>
  );
}