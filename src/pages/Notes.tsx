import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NotebookPen, Search, SortDesc, SortAsc } from "lucide-react";
import { useTelegramId } from "@/lib/auth";
import { useNotes } from "@/lib/queries";
import { NoteCard } from "@/components/NoteCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Empty } from "@/components/ui/Empty";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CreateNoteDialog } from "@/components/CreateNoteDialog";
import { TopFocus } from "@/components/TopFocus";

type Sort = "focus_desc" | "focus_asc" | "recent";

export function NotesPage() {
  const { tgId } = useTelegramId();
  const { data, isLoading, isError } = useNotes(tgId);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("focus_desc");

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    const out = q
      ? data.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q)
        )
      : data.slice();
    out.sort((a, b) => {
      if (sort === "focus_desc") return b.focus_score - a.focus_score;
      if (sort === "focus_asc") return a.focus_score - b.focus_score;
      return (
        new Date(b.updated_at || 0).getTime() -
        new Date(a.updated_at || 0).getTime()
      );
    });
    return out;
  }, [data, query, sort]);

  const stats = useMemo(() => {
    if (!data?.length) return null;
    const avgFocus = data.reduce((s, n) => s + n.focus_score, 0) / data.length;
    return { count: data.length, avgFocus };
  }, [data]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Заметки</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {stats
              ? `${stats.count} шт. · средний фокус ${Math.round(stats.avgFocus * 100)}%`
              : "—"}
          </p>
        </div>
        {tgId ? <CreateNoteDialog tgId={tgId} /> : null}
      </div>

      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по заголовку и содержимому"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border bg-card/50 p-1">
          <Button
            size="sm"
            variant={sort === "focus_desc" ? "secondary" : "ghost"}
            onClick={() => setSort("focus_desc")}
          >
            <SortDesc className="h-3.5 w-3.5" />
            Фокус
          </Button>
          <Button
            size="sm"
            variant={sort === "focus_asc" ? "secondary" : "ghost"}
            onClick={() => setSort("focus_asc")}
          >
            <SortAsc className="h-3.5 w-3.5" />
            Низкий
          </Button>
          <Button
            size="sm"
            variant={sort === "recent" ? "secondary" : "ghost"}
            onClick={() => setSort("recent")}
          >
            Недавние
          </Button>
        </div>
      </div>

      {!query && data && data.length >= 3 && sort === "focus_desc" ? (
        <TopFocus notes={data} />
      ) : null}

      {isError ? (
        <Empty
          icon={NotebookPen}
          title="Не удалось загрузить заметки"
          description="Проверьте, запущен ли backend на http://127.0.0.1:8000"
        />
      ) : isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Empty
          icon={NotebookPen}
          title={data?.length ? "Ничего не найдено" : "Заметок пока нет"}
          description={
            data?.length
              ? "Попробуйте изменить запрос."
              : "Напишите боту или создайте здесь — её можно превратить в задачу."
          }
          action={tgId ? <CreateNoteDialog tgId={tgId} /> : undefined}
        />
      ) : (
        <motion.div
          layout
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
