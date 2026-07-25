"use client";

import { BookOpen, Pencil, Trash2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Props {
  chapter: any;

  children?: React.ReactNode;

  onEdit?: (chapter: any) => void;

  onDelete?: (chapter: any) => void;

  onAddLesson?: (chapter: any) => void;
}

export function ChapterCard({
  chapter,
  children,
  onEdit,
  onDelete,
  onAddLesson,
}: Props) {
  return (
    <AccordionItem value={chapter.id}>
      <AccordionTrigger>
        <div className="flex w-full items-center justify-between pr-4">
          {/* Left */}
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />

            <div className="text-left">
              <p className="font-medium">
                {chapter.title}
              </p>
            </div>
          </div>

          {/* Right */}
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Badge variant="secondary">
              {chapter.lessons?.length ?? 0} Lessons
            </Badge>

            {/* Add Lesson */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onAddLesson?.(chapter);
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>

            {/* Edit Chapter */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(chapter);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>

            {/* Delete Chapter */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(chapter);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent>
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}