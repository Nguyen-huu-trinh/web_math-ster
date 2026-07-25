"use client";

import Link from "next/link";

import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  search: string;
  onSearchChange: (value: string) => void;
}

export function ExamToolbar({
  search,
  onSearchChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

      <div className="relative w-full md:max-w-sm">

        <Search
          className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"
        />

        <Input
          value={search}
          onChange={(e) =>
            onSearchChange(e.target.value)
          }
          placeholder="Tìm đề thi..."
          className="pl-9"
        />

      </div>

      <Button
        onClick={() => {
          window.location.href = "/exams/create";
        }}
      >
        <Plus className="mr-2 h-4 w-4" />

        Tạo đề
      </Button>

    </div>
  );
}