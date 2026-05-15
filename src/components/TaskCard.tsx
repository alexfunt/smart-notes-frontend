import { motion } from "framer-motion";
import { Check, Trash2, Calendar, Bot, Flame } from "lucide-react";
import type { Task } from "@/lib/types";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { EngagementRing } from "./EngagementRing";
import { cn, formatDate } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onToggle?: (id: number) => void;
  onDelete?: (id: number) => void;
  compact?: boolean;
}

const priorityVariant = (p: string) =>
  p === "high" ? "destructive" : p === "low" ? "secondary" : "default";

export function TaskCard({ task, onToggle, onDelete, compact }: TaskCardProps) {
  const done = task.status === "done";
  const overdue =
    !done && task.due_date && new Date(task.due_date).getTime() < Date.now();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.24 }}
      className={cn(
        "group relative flex items-start gap-3 rounded-md border border-border bg-card p-4 transition-all",
        "hover:border-primary/40 hover:shadow-md",
        done && "opacity-60"
      )}
    >
      <button
        type="button"
        onClick={() => onToggle?.(task.id)}
        aria-label={done ? "Вернуть в работу" : "Отметить выполненной"}
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all",
          done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-transparent hover:border-primary hover:bg-primary/10"
        )}
      >
        {done ? <Check className="h-3.5 w-3.5" /> : null}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "text-[11px] uppercase tracking-wider text-muted-foreground tabular-nums"
            )}
          >
            №{task.user_task_number}
          </span>
          <Badge variant={priorityVariant(task.priority) as never}>
            {task.priority === "high" && <Flame className="mr-1 h-3 w-3" />}
            {task.priority}
          </Badge>
          {task.ai_generated ? (
            <Badge variant="outline">
              <Bot className="mr-1 h-3 w-3" /> AI
            </Badge>
          ) : null}
          {overdue ? <Badge variant="warning">просрочена</Badge> : null}
        </div>

        <h4
          className={cn(
            "mt-1.5 text-sm font-medium leading-snug text-foreground",
            done && "line-through decoration-muted-foreground/60"
          )}
        >
          {task.title}
        </h4>

        {!compact && task.description ? (
          <p className="mt-1 line-clamp-2 whitespace-pre-line text-xs text-muted-foreground">
            {task.description}
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          {task.due_date ? (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(task.due_date)}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <EngagementRing value={task.engagement_score} />
        {onDelete ? (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onDelete(task.id)}
            className="opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Удалить задачу"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        ) : null}
      </div>
    </motion.div>
  );
}
