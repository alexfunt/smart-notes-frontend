import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function Empty({ icon: Icon, title, description, action, className }: EmptyProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/70 bg-card/30 px-6 py-16 text-center",
        className
      )}
    >
      <div className="rounded-full bg-accent p-3 text-accent-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
