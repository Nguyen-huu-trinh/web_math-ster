"use client";

import {
  Clock,
  FileText,
  GraduationCap,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {

  title: string;

  displayTime: string;

  lowTime: boolean;

  submitted: boolean;

  score?: number;

  submitting: boolean;

  onSubmit: () => void;

}

export default function ExamHeader({

  title,

  displayTime,

  lowTime,

  submitted,

  score,

  submitting,

  onSubmit,

}: Props) {

  return (

<header className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-3 py-2 sm:px-4">

<div className="flex min-w-0 items-center gap-2">

<FileText className="size-5 shrink-0 text-primary"/>

<span className="truncate text-sm font-semibold">

{title}

</span>

</div>

<div className="flex shrink-0 items-center gap-3">

{!submitted ? (

<>

<span

className={cn(

"inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-sm font-bold tabular-nums",

lowTime

? "bg-destructive/15 text-destructive"

: "bg-primary/15 text-foreground"

)}

>

<Clock className="size-4"/>

{displayTime}

</span>

<Button

size="sm"

disabled={submitting}

onClick={onSubmit}

>

<Send className="mr-1 size-4"/>

Nộp bài

</Button>

</>

) : (

<span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 px-2.5 py-1 text-sm font-bold">

<GraduationCap className="size-4"/>

{score ?? 0} điểm

</span>

)}

</div>

</header>

);

}