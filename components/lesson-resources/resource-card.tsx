"use client";

import {
  FileText,
  Video,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  resource: any;

  editable?: boolean;

  onEdit?: (resource: any) => void;

  onDelete?: (resource: any) => void;
}

export function ResourceCard({
  resource,
  editable = false,
  onEdit,
  onDelete,
}: Props) {
  const file = resource.file_links;

  const isVideo =
    resource.type === "video";

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">

      <div className="flex items-center gap-3">

        <div className="rounded-md bg-primary/10 p-2">

          {isVideo ? (
            <Video className="h-5 w-5 text-primary" />
          ) : (
            <FileText className="h-5 w-5 text-primary" />
          )}

        </div>

        <div>

          <div className="font-medium">

            {file.title}

          </div>

          <div className="flex items-center gap-2 mt-1">

            <Badge variant="secondary">

              {file.provider}

            </Badge>

            <a
              href={file.url}
              target="_blank"
              className="text-xs text-primary flex items-center gap-1"
            >
              Open

              <ExternalLink className="h-3 w-3" />

            </a>

          </div>

        </div>

      </div>

      {editable && (

        <div className="flex gap-1">

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit?.(resource)}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-red-500"
            onClick={() => onDelete?.(resource)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>

        </div>

      )}

    </div>
  );
}