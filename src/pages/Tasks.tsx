import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ListTodo, Search } from "lucide-react";
import { useTelegramId } from "@/lib/auth";
import { useDeleteTask, useTasks, useToggleTask } from "@/lib/queries";
import { TaskCard } from "@/components/TaskCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Empty } from "@/components/ui/Empty";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type StatusFilter = "all" | "pending" | "done";
type PriorityFilter = "all" | "low" | "medium" | "high";
type Sort = "engagement" | "due" | "recent";

export function TasksPage() {
  const { tgId } = useTelegramId();
  const { data, isLoading, isError } = useTasks(tgId);
  const toggleMut = useToggleTask(tgId!);
  const deleteMut = useDeleteTask(tgId!);

  const [query, setQuery] = useState("");
  const [statusF, setStatusF] = useState<StatusFilter>("all");
  const [priorityF, setPriorityF] = useState<PriorityFilter>("all");
  const [sort, setSort] = useState<Sort>("engagement");

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    let out = data.slice();
    if (statusF !== "all") out = out.filter((t) => t.status === statusF);
    if (priorityF !== "all") out = out.filter((t) => t.priority === priorityF);
    if (q) out = out.filter((t) => t.title.toLowerCase().includes(q));

    out.sort((a, b) => {
      if (sort === "engagement") return b.engagement_score - a.engagement_score;
      if (sort === "due") {
        const ax = a.due_date ? new Date(a.due_date).getTime() : Number.POSITIVE_INFINITY;
        const bx = b.due_date ? new Date(b.due_date).getTime() : Number.POSITIVE_INFINITY;
        return ax - bx;
      }
      return (
        new Date(b.updated_at || 0).getTime() -
        new Date(a.updated_at || 0).getTime()
      );
    });
    return out;
  }, [data, query, statusF, priorityF, sort]);

  const stats = useMemo(() => {
    if (!data?.length) return null;
    return {
      total: data.length,
      pending: data.filter((t) => t.status === "pending").length,
      done: data.filter((t) => t.status === "done").length,
      avgEng: data.reduce((s, t) => s + t.engagement_score, 0) / data.length,
    };
  }, [data]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Задачи</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {stats
            ? `${stats.total} всего · ${stats.pending} в работе · ${stats.done} готово · средняя вовлечённость ${Math.round(stats.avgEng * 100)}%`
            : "—"}
        </p>
      </div>

      <div className="mb-5 grid gap-2 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по задачам"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          <FilterGroup
            value={statusF}
            onChange={setStatusF}
            options={[
              ["all", "Все"],
              ["pending", "В работе"],
              ["done", "Готово"],
            ]}
          />
          <FilterGroup
            value={priorityF}
            onChange={setPriorityF}
            options={[
              ["all", "Любой"],
              ["high", "High"],
              ["medium", "Med"],
              ["low", "Low"],
            ]}
          />
          <FilterGroup
            value={sort}
            onChange={setSort}
            options={[
              ["engagement", "Вовлечённость"],
              ["due", "Срок"],
              ["recent", "Свежие"],
            ]}
          />
        </div>
      </div>

      {isError ? (
        <Empty
          icon={ListTodo}
          title="Не удалось загрузить задачи"
          description="Проверьте, что backend поднят и доступен."
        />
      ) : isLoading ? (
        <div className="grid gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Empty
          icon={ListTodo}
          title={data?.length ? "Под фильтры ничего не подходит" : "Задач пока нет"}
          description={
            data?.length
              ? "Сбросьте поиск или фильтры."
              : "Откройте заметку и создайте задачу — она привяжется к теме."
          }
        />
      ) : (
        <motion.div layout className="grid gap-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onToggle={(id) => toggleMut.mutate(id)}
                onDelete={(id) => deleteMut.mutate(id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

interface FilterGroupProps<V extends string> {
  value: V;
  onChange: (v: V) => void;
  options: [V, string][];
}
function FilterGroup<V extends string>({ value, onChange, options }: FilterGroupProps<V>) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-card/50 p-1">
      {options.map(([v, l]) => (
        <Button
          key={v}
          size="sm"
          variant={value === v ? "secondary" : "ghost"}
          onClick={() => onChange(v)}
        >
          {l}
        </Button>
      ))}
    </div>
  );
}
