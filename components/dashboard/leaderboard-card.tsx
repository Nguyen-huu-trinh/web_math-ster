import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { LeaderboardStudent, RewardMoneyStudent, DoTrauStudent } from "@/services/dashboard-client.service";

interface LeaderboardCardProps {
  title: string;
  description: string;
  entries: LeaderboardStudent[] | RewardMoneyStudent[] | DoTrauStudent[];
 valueType?: "count" | "money" | "points";
  startRank?: number;
}

export function LeaderboardCard({
  title,
  description,
  entries,
  valueType = "count",
  startRank = 1,
}: LeaderboardCardProps) {
  return (
    <Card className="h-full animate-fade-in-up shadow-sm">

      <CardHeader className="pb-1">

        <CardTitle className="text-lg flex items-center gap-2">

          

          {title}

        </CardTitle>

        <p className="text-sm leading-5 text-muted-foreground">

          {description}

        </p>

      </CardHeader>

      <CardContent className="space-y-3">

        {entries.map((student, index) => {const rank = startRank + index; return (

          <div
            key={student.student_id}
            className="
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-border/50
              bg-background
              px-3
              py-2
              transition-all
              hover:border-primary/40
              hover:shadow-sm
            "
          >

            {/* Rank */}

            <div
              className={cn(
                 "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",

                rank === 1 && "bg-yellow-500",

                rank === 2 && "bg-slate-400",

                rank === 3 && "bg-amber-600",

                rank > 3 && "bg-primary"
              )}
            >
              {rank}
            </div>

            {/* Student */}

            <div className="min-w-0 flex-1">

              <p className="truncate text-sm font-semibold">

                  <span className="font-mono text-primary">

                      {student.student_code}

                  </span>

                  <span className="mx-2 text-muted-foreground">

                      -

                  </span>

                  <span>

                      {student.full_name}

                  </span>

              </p>

          </div>

            {/* Value */}

            <div
    className="
        shrink-0
        rounded-lg
        bg-primary/10
        px-3
        py-1
    "
>

    <span
        className="
            font-bold
            text-primary
            tabular-nums
        "
    >
        {valueType === "money"
            ? `${Number(
                  (student as RewardMoneyStudent)
                      .reward_money ?? 0
              ).toLocaleString("vi-VN")}đ`
            : valueType === "points"
                ? `${Number(
                      (student as DoTrauStudent)
                          .points ?? 0
                  )}`
                : (student as LeaderboardStudent)
                      .count}
    </span>

</div>

          </div>

        )})}

      </CardContent>

    </Card>
  );
}