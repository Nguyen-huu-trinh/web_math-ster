import Image from "next/image";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  variant?: "sidebar" | "header";
  className?: string;
}

export function BrandLogo({
  variant = "header",
  className,
}: BrandLogoProps) {
  return (
    <Image
      src="/logo4.png"
      alt="Mathster"
      width={variant === "sidebar" ? 160 : 120}
      height={variant === "sidebar" ? 48 : 42}
      priority
      className={cn(className)}
    />
  );
}