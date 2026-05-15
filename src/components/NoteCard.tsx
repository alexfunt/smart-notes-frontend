import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, MessageSquareText } from "lucide-react";
import type { Note } from "@/lib/types";
import { cn, relativeTime } from "@/lib/utils";
import { FocusBar } from "./FocusBar";

export function NoteCard({ note }: { note: Note }) {
  const dim = note.focus_score < 0.35;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
    >
      <Link
        to={`/notes/${note.user_note_number}`}
        className={cn(
          "group relative block overflow-hidden rounded-lg border border-border bg-card p-5 transition-all",
          "hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10",
          dim && "opacity-60 hover:opacity-100"
        )}
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              <span className="tabular-nums">№{note.user_note_number}</span>
              <span>·</span>
              <span>{relativeTime(note.updated_at)}</span>
              {note.source === "telegram" ? (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquareText className="h-3 w-3" />
                    tg
                  </span>
                </>
              ) : null}
            </div>
            <h3 className="mt-1.5 line-clamp-1 text-base font-semibold text-foreground">
              {note.title}
            </h3>
          </div>
          {note.focus_score > 0.7 ? (
            <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-label="высокий фокус" />
          ) : null}
        </div>

        <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{note.content}</p>

        <div className="mt-4 flex items-center gap-3">
          <FocusBar value={note.focus_score} className="flex-1" />
          <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
            focus {Math.round(note.focus_score * 100)}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
