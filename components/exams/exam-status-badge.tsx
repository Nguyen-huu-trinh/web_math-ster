"use client";

import { Badge } from "@/components/ui/badge";

interface Props {
  status: string;
}

export function ExamStatusBadge({
  status,
}: Props) {
  switch (status) {
    case "DRAFT":
      return (
        <Badge variant="secondary">
          Draft
        </Badge>
      );

    case "PUBLISHED":
      return (
        <Badge>
          Published
        </Badge>
      );

    case "CLOSED":
      return (
        <Badge variant="destructive">
          Closed
        </Badge>
      );

    default:
      return (
        <Badge variant="outline">
          {status}
        </Badge>
      );
  }
}