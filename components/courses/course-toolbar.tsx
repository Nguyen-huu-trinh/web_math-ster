"use client";

import { Search } from "lucide-react";

import { ReactNode } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

interface CourseToolbarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  children?: ReactNode;
}

export function CourseToolbar({
  keyword,
  onKeywordChange,
  children,
}: CourseToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <InputGroup className="sm:max-w-sm">
        <InputGroupInput
          placeholder="Search course..."
          value={keyword}
          onChange={(e) =>
            onKeywordChange(e.target.value)
          }
        />

        <InputGroupAddon>
          <Search className="h-4 w-4" />
        </InputGroupAddon>
      </InputGroup>

      {children}
    </div>
  );
}