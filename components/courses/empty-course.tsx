"use client";

import { BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  onCreate: () => void;
}

export function EmptyCourse({
  onCreate,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20">
      <BookOpen className="mb-4 h-14 w-14 text-muted-foreground" />

      <h2 className="text-xl font-semibold">
        No courses found
      </h2>

      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        There are currently no courses. Create your first
        course to get started.
      </p>

      <Button
        className="mt-6"
        onClick={onCreate}
      >
        Create Course
      </Button>
    </div>
  );
}