import { clamp01 } from "@/lib/utils";

interface EngagementRingProps {
  value: number;
  size?: number;
  stroke?: number;
}

export function EngagementRing({ value, size = 36, stroke = 4 }: EngagementRingProps) {
  const v = clamp01(value);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - v);
  const pct = Math.round(v * 100);
  const tone =
    v > 0.65 ? "hsl(var(--focus-high))" : v > 0.35 ? "hsl(var(--focus-mid))" : "hsl(var(--focus-low))";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={tone}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      <span className="absolute text-[10px] font-semibold tabular-nums text-foreground">{pct}</span>
    </div>
  );
}
