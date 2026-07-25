"use client";

import {
  FileText,
  Video,
  Link2,
  Presentation,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  content: any;

  role?: string;

  onEdit?: (content: any) => void;

  onDelete?: (content: any) => void;
}

export function LessonContentCard({
  content,
  role,
  onEdit,
  onDelete,
}: Props) {

  function getIcon() {

    switch (content.type) {

      case "VIDEO":
        return <Video className="h-5 w-5" />;

      case "PDF":
        return <FileText className="h-5 w-5" />;

      case "SLIDE":
        return <Presentation className="h-5 w-5" />;

      case "LINK":
        return <Link2 className="h-5 w-5" />;

      default:
        return <FileText className="h-5 w-5" />;
    }

  }

  return (

    <div
      className="
        flex
        items-center
        justify-between
        rounded-lg
        border
        p-4
        hover:bg-muted/40
      "
    >

      <div className="flex items-center gap-4">

        <div className="rounded-lg bg-primary/10 p-2 text-primary">

          {getIcon()}

        </div>

        <div>

          <div className="font-medium">

            {content.title}

          </div>

          <div className="text-sm text-muted-foreground">

            {content.type}

          </div>

        </div>

      </div>

      {role === "TEACHER" && (

        <div className="flex gap-2">

          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit?.(content)}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="text-red-500"
            onClick={() => onDelete?.(content)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>

        </div>

      )}

    </div>

  );

}