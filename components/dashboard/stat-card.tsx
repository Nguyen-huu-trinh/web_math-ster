import { Icon } from "@/components/icon";
import { Card, CardContent } from "@/components/ui/card";

export interface StatCardProps {
  label: string;
  value: number;
  icon: string;

  suffix?: string;

  // Ví dụ: "52/80"
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
      className="
        animate-fade-in-up
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
      "
      style={{
        animationDelay: `${index * 60}ms`,
      }}
    >
      <CardContent className="p-1">

        {/* Header */}
        <div className="flex items-center gap-2">

          <div className="rounded-full bg-primary/10 p-2.5">

            <Icon
              name={icon}
              className="size-5 text-primary"
            />

          </div>

        <p className="whitespace-nowrap text-lg font-semibold text-foreground">
              {label}
          </p>

        </div>

        {/* Value */}
        <div className="mt-4 text-center">

          <p className="text-4xl font-bold tracking-tight tabular-nums">

            {displayValue ?? value}

            {!displayValue && suffix && (
              <span className="ml-1 text-xl font-medium text-muted-foreground">
                {suffix}
              </span>
            )}

          </p>

        </div>

      </CardContent>
    </Card>
  );
}