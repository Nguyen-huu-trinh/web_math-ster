import { useEffect, useMemo, useState } from "react";

interface Props {
  initialSeconds: number;
  enabled: boolean;
  onFinish: () => void;
}

export function useCountdown({
  initialSeconds,
  enabled,
  onFinish,
}: Props) {
  const [timeLeft, setTimeLeft] =
    useState(initialSeconds);

  useEffect(() => {
    setTimeLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onFinish();
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [enabled, onFinish]);

  const displayTime = useMemo(() => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;

    return `${String(m).padStart(
      2,
      "0"
    )}:${String(s).padStart(2, "0")}`;
  }, [timeLeft]);

  return {
    timeLeft,
    displayTime,
    lowTime: timeLeft <= 300,
  };
}