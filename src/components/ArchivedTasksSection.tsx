import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Archive, ChevronDown } from "lucide-react";
import type { Task } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { cn } from "@/lib/utils";

interface ArchivedTasksSectionProps {
  tasks: Task[];
  onToggle?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function ArchivedTasksSection({
  tasks,
  onToggle,
  onDelete,
}: ArchivedTasksSectionProps) {
  const [open, setOpen] = useState(false);
  if (!tasks.length) return null;

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md border border-dashed border-border bg-card/50 px-3 py-2 text-xs text-muted-foreground transition-colors",
          "hover:border-border hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        )}
      >
        <span className="inline-flex items-center gap-2">
          <Archive className="h-3.5 w-3.5" />
          {open ? "Скрыть архив" : `Показать архив · ${tasks.length}`}
        </span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 grid gap-2">
              {tasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onToggle={onToggle}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
