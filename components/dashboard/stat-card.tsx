import { Icon } from "@/components/icon";
import { Card, CardContent } from "@/components/ui/card";

export interface StatCardProps {
  label: string;
  value: number;
  icon: string;

  suffix?: string;

  // Hiển thị tùy chỉnh (ví dụ "5/12")
  displayValue?: string;

  index?: number;
}

export function StatCard({
  label,
  value,
  icon,
  suffix,
  displayValue,
  index = 0,
}: StatCardProps) {
  return (
    <Card
      className="animate-fade-in-up transition-shadow hover:shadow-md"
      style={{
        animationDelay: `${index * 60}ms`,
      }}
    >
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Icon
              name={icon}
              className="size-5"
            />
          </span>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            {label}
          </p>

          <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
            {displayValue ?? value}

            {!displayValue && suffix && (
              <span className="ml-1 text-lg text-muted-foreground">
                {suffix}
              </span>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}