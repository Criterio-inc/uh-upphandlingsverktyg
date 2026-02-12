import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercent?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "success" | "warning" | "destructive";
  className?: string;
}

const heightMap = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

const colorMap = {
  primary: "bg-primary",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  destructive: "bg-red-500",
};

export function ProgressBar({
  value,
  label,
  showPercent = true,
  size = "md",
  color = "primary",
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  // Auto-color based on value
  const autoColor = color === "primary"
    ? clamped >= 80 ? "bg-green-500"
      : clamped >= 50 ? "bg-primary"
      : clamped >= 25 ? "bg-yellow-500"
      : "bg-red-500"
    : colorMap[color];

  return (
    <div className={cn("space-y-1", className)}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
          {showPercent && <span className="text-xs font-medium">{clamped}%</span>}
        </div>
      )}
      <div className={cn("w-full rounded-full bg-muted overflow-hidden", heightMap[size])}>
        <div
          className={cn("rounded-full transition-all duration-500 ease-out", heightMap[size], autoColor)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
