import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, ArrowUpRight } from "lucide-react";
import type { Note } from "@/lib/types";
import { FocusBar } from "./FocusBar";
import { relativeTime, cn } from "@/lib/utils";

interface TopFocusProps {
  notes: Note[];
  className?: string;
}

export function TopFocus({ notes, className }: TopFocusProps) {
  const top = [...notes]
    .filter((n) => n.focus_score > 0)
    .sort((a, b) => b.focus_score - a.focus_score)
    .slice(0, 3);

  if (top.length < 1) return null;

  return (
    <section className={cn("mb-6", className)}>
      <div className="mb-3 flex items-center gap-2">
        <div className="inline-flex h-7 items-center gap-1.5 rounded-full bg-primary/15 px-3 text-xs font-semibold text-primary">
          <Flame className="h-3.5 w-3.5" />
          В фокусе сейчас
        </div>
        <span className="text-xs text-muted-foreground">
          темы, к которым ты возвращаешься чаще всего
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {top.map((note, i) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to={`/notes/${note.user_note_number}`}
              className="group relative block overflow-hidden rounded-lg border border-primary/30 bg-gradient-to-br from-primary/[0.08] via-card to-card p-5 transition-all hover:border-primary/60 hover:shadow-xl hover:shadow-primary/15"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/20 blur-3xl opacity-60 transition-opacity group-hover:opacity-100" />

              <div className="relative flex items-center justify-between gap-3">
                <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>

              <h3 className="relative mt-3 line-clamp-1 text-base font-semibold">{note.title}</h3>
              <p className="relative mt-1 line-clamp-2 text-sm text-muted-foreground">
                {note.content}
              </p>

              <div className="relative mt-4 flex items-center gap-3">
                <FocusBar value={note.focus_score} className="flex-1" />
                <span className="text-[11px] font-semibold tabular-nums text-primary">
                  {Math.round(note.focus_score * 100)}%
                </span>
              </div>

              <div className="relative mt-2 text-[11px] text-muted-foreground">
                №{note.user_note_number} · {relativeTime(note.updated_at)}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
