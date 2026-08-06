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

export default function ExamToolbar({

  title,

  displayTime,

  lowTime,

  submitted,

  score,

  submitting,

  onSubmit,

}: Props) {

  return (

    <header className="flex items-center justify-between border-b bg-card px-4 py-2">

      <div className="flex items-center gap-2">

        <FileText className="size-5 text-primary" />

        <span className="font-semibold truncate">

          {title}

        </span>

      </div>

      <div className="flex items-center gap-3">

        {!submitted ? (

          <>

            <span
              className={cn(

                "inline-flex items-center gap-2 rounded-lg px-3 py-1 font-mono text-sm font-bold",

                lowTime

                  ? "bg-red-100 text-red-600"

                  : "bg-primary/10"

              )}
            >

              <Clock className="size-4" />

              {displayTime}

            </span>

            <Button

              size="sm"

              onClick={onSubmit}

              disabled={submitting}

            >

              <Send className="size-4 mr-1" />

              Nộp bài

            </Button>

          </>

        ) : (

          <span className="flex items-center gap-2 rounded-lg bg-green-100 px-3 py-1 font-semibold text-green-700">

            <GraduationCap className="size-4" />

            {score} điểm

          </span>

        )}

      </div>

    </header>

  );

}