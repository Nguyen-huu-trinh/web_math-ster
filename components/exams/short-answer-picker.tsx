"use client";

import { cn } from "@/lib/utils";

const DIGITS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
];

const MAX = 6;

interface Props {
  value: string;
  onChange(value: string): void;
}

export function ShortAnswerPicker({
  value,
  onChange,
}: Props) {
  const chars = value.padEnd(MAX, " ").split("");

  function update(col: number, char: string) {
    const next = [...chars];
    next[col] = char;
    onChange(next.join("").trimEnd());
  }

  return (
    <div className="flex gap-2">

      {chars.map((current, col) => (

        <div
          key={col}
          className="flex flex-col items-center gap-1"
        >

          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded border font-bold",
              current.trim()
                ? "border-primary bg-primary/10"
                : "border-dashed"
            )}
          >
            {current.trim() || "·"}
          </div>

          <button
            type="button"
            onClick={() => update(col, "-")}
            className="rounded border px-2 text-xs"
          >
            -
          </button>

          <button
            type="button"
            onClick={() => update(col, ".")}
            className="rounded border px-2 text-xs"
          >
            .
          </button>

          {DIGITS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => update(col, d)}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border text-xs transition",
                current === d
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              )}
            >
              {d}
            </button>
          ))}

        </div>

      ))}

    </div>
  );
}