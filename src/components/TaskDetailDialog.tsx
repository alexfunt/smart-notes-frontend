import { useEffect, useState } from "react";
import { Calendar, Check, Pencil, Trash2, X, Save, Flame, Bot } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/Dialog";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Badge } from "./ui/Badge";
import { EngagementRing } from "./EngagementRing";
import { Linkify } from "./Linkify";
import type { Task } from "@/lib/types";
import { cn, formatDate, relativeTime } from "@/lib/utils";
import { useTelegramId } from "@/lib/auth";
import { useDeleteTask, useToggleTask, useUpdateTask } from "@/lib/queries";

const priorityVariant = (p: string) =>
  p === "high" ? "destructive" : p === "low" ? "secondary" : "default";

const toDateInputValue = (iso: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

interface TaskDetailDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
  const { tgId } = useTelegramId();
  const updateMut = useUpdateTask(tgId!);
  const toggleMut = useToggleTask(tgId!);
  const deleteMut = useDeleteTask(tgId!);

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [due, setDue] = useState(toDateInputValue(task.due_date));
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setEditing(false);
      setSaveError(null);
      setTitle(task.title);
      setDescription(task.description ?? "");
      setDue(toDateInputValue(task.due_date));
    }
  }, [open, task.id, task.title, task.description, task.due_date]);

  const done = task.status === "done";
  const overdue =
    !done && task.due_date && new Date(task.due_date).getTime() < Date.now();

  async function save() {
    if (!tgId) return;
    setSaveError(null);
    const titleTrim = title.trim();
    if (!titleTrim) return;
    const payload: Parameters<typeof updateMut.mutateAsync>[0] = {
      taskId: task.id,
    };
    if (titleTrim !== task.title) payload.title = titleTrim;
    if ((description ?? "") !== (task.description ?? "")) {
      payload.description = description;
    }
    const newDueIso = due ? `${due}T12:00:00Z` : null;
    const oldDueDate = task.due_date
      ? toDateInputValue(task.due_date)
      : "";
    if (due !== oldDueDate) {
      payload.due_date = newDueIso;
    }
    if (Object.keys(payload).length === 1) {
      setEditing(false);
      return;
    }
    try {
      await updateMut.mutateAsync(payload);
      setEditing(false);
    } catch (e) {
      const err = e as {
        response?: { status?: number; data?: { detail?: string } };
        message?: string;
      };
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail || err?.message;
      setSaveError(
        status
          ? `Не удалось сохранить (${status})${detail ? `: ${detail}` : ""}`
          : detail || "Не удалось сохранить"
      );
    }
  }

  async function remove() {
    if (!confirm("Удалить задачу?")) return;
    await deleteMut.mutateAsync(task.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground tabular-nums">
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
            {done ? <Badge variant="secondary">выполнена</Badge> : null}
            {overdue ? <Badge variant="warning">просрочена</Badge> : null}
          </div>
          <DialogTitle className="mt-2">
            {editing ? (
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={255}
                placeholder="Название"
                className="text-lg"
              />
            ) : (
              <span className={cn(done && "line-through decoration-muted-foreground/60")}>
                {task.title}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="mt-1 flex flex-wrap items-center gap-3 text-xs">
            {task.due_date ? (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(task.due_date)}
              </span>
            ) : null}
            {task.updated_at ? (
              <span>обновлена {relativeTime(task.updated_at)}</span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <EngagementRing value={task.engagement_score} />
              <span>{Math.round(task.engagement_score * 100)}%</span>
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          {editing ? (
            <>
              <label className="grid gap-1">
                <span className="text-xs text-muted-foreground">Описание</span>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Описание задачи. Ссылки https://… будут кликабельны."
                />
              </label>
              <label className="grid gap-1">
                <span className="text-xs text-muted-foreground">Срок</span>
                <Input
                  type="date"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                />
              </label>
            </>
          ) : task.description?.trim() ? (
            <div className="max-h-[55vh] overflow-y-auto rounded-md border border-border bg-background/40 p-3">
              <Linkify className="block whitespace-pre-line text-[14px] leading-relaxed text-foreground/90">
                {task.description}
              </Linkify>
            </div>
          ) : (
            <p className="text-sm italic text-muted-foreground">Без описания.</p>
          )}
          {saveError ? (
            <p
              role="alert"
              className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {saveError}
            </p>
          ) : null}
        </div>

        <DialogFooter className="!justify-between sm:!justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleMut.mutate(task.id)}
              disabled={toggleMut.isPending}
              aria-label={done ? "Вернуть в работу" : "Отметить выполненной"}
            >
              <Check className="h-4 w-4" />
              {done ? "Вернуть" : "Готово"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={remove}
              disabled={deleteMut.isPending}
              aria-label="Удалить задачу"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                  <X className="h-4 w-4" /> Отмена
                </Button>
                <Button
                  size="sm"
                  onClick={save}
                  disabled={!title.trim() || updateMut.isPending}
                >
                  <Save className="h-4 w-4" />
                  {updateMut.isPending ? "Сохраняю…" : "Сохранить"}
                </Button>
              </>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" /> Редактировать
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
