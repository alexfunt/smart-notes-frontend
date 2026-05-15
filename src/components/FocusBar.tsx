import { cn, clamp01 } from "@/lib/utils";

interface FocusBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

export function FocusBar({ value, className, showLabel = false }: FocusBarProps) {
  const v = clamp01(value);
  const pct = Math.round(v * 100);
  const tone = v > 0.65 ? "high" : v > 0.35 ? "mid" : "low";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "absolute inset-y-0 left-0 transition-[width] duration-700 ease-out rounded-full",
            tone === "high" && "focus-grad-high",
            tone === "mid" && "bg-[hsl(var(--focus-mid))]",
            tone === "low" && "focus-grad-low"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel ? (
        <span className="w-9 text-right text-[11px] font-medium tabular-nums text-muted-foreground">
          {pct}%
        </span>
      ) : null}
    </div>
  );
}
