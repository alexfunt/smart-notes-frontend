import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, Trash2, X } from "lucide-react";
import { useTelegramId } from "@/lib/auth";
import {
  useDeleteNote,
  useDeleteTask,
  useNote,
  useToggleTask,
  useUpdateNote,
} from "@/lib/queries";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Empty } from "@/components/ui/Empty";
import { FocusBar } from "@/components/FocusBar";
import { TaskCard } from "@/components/TaskCard";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { relativeTime } from "@/lib/utils";
import { NotebookPen } from "lucide-react";

export function NoteDetailPage() {
  const { number } = useParams();
  const userNoteNumber = number ? Number(number) : null;
  const { tgId } = useTelegramId();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useNote(tgId, userNoteNumber, { focus: "note" });
  const updateMut = useUpdateNote(tgId!);
  const deleteMut = useDeleteNote(tgId!);
  const toggleTask = useToggleTask(tgId!);
  const deleteTask = useDeleteTask(tgId!);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (data && !editing) setDraft(data.content);
  }, [data, editing]);

  if (isError) {
    return (
      <Empty
        icon={NotebookPen}
        title="Заметка не найдена"
        description="Возможно, она была удалена."
        action={
          <Link to="/notes">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" /> Назад к заметкам
            </Button>
          </Link>
        }
      />
    );
  }

  if (isLoading || !data || !tgId) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  async function save() {
    if (!data) return;
    if (draft.trim() && draft !== data.content) {
      await updateMut.mutateAsync({
        userNoteNumber: data.user_note_number,
        content: draft.trim(),
      });
    }
    setEditing(false);
  }

  async function del() {
    if (!data) return;
    if (!confirm("Удалить заметку и все связанные задачи?")) return;
    await deleteMut.mutateAsync(data.user_note_number);
    navigate("/notes");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link to="/notes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Все заметки
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                <X className="h-4 w-4" /> Отмена
              </Button>
              <Button
                size="sm"
                onClick={save}
                disabled={updateMut.isPending || !draft.trim()}
              >
                <Save className="h-4 w-4" />
                {updateMut.isPending ? "Сохраняю…" : "Сохранить"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                Редактировать
              </Button>
              <Button variant="ghost" size="sm" onClick={del}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </>
          )}
        </div>
      </div>

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Заметка №{data.user_note_number} · {data.source} · обновлено{" "}
              {relativeTime(data.updated_at)}
            </div>
            <h1 className="mt-2 break-words text-2xl font-bold leading-tight">
              {data.title}
            </h1>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Фокус темы</span>
            <span className="font-medium tabular-nums">
              {Math.round(data.focus_score * 100)}%
            </span>
          </div>
          <FocusBar value={data.focus_score} />
        </div>

        <div className="mt-5">
          {editing ? (
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={Math.max(6, draft.split("\n").length + 1)}
              autoFocus
              className="text-base"
            />
          ) : (
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/90">
              {data.content}
            </p>
          )}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Задачи</h2>
            <p className="text-xs text-muted-foreground">
              {data.tasks?.length ?? 0} · сортировка по статусу и порядку
            </p>
          </div>
          <CreateTaskDialog tgId={tgId} userNoteNumber={data.user_note_number} />
        </div>

        {!data.tasks?.length ? (
          <Empty
            icon={NotebookPen}
            title="Задач пока нет"
            description="Создайте задачу из этой заметки — бот будет напоминать о ней с адаптивным интервалом."
          />
        ) : (
          <div className="grid gap-2">
            <AnimatePresence mode="popLayout">
              {data.tasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onToggle={(id) => toggleTask.mutate(id)}
                  onDelete={(id) => deleteTask.mutate(id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}
