import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/Dialog";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { useCreateTaskFromNote } from "@/lib/queries";

interface Props {
  tgId: number;
  userNoteNumber: number;
}

export function CreateTaskDialog({ tgId, userNoteNumber }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due, setDue] = useState("");
  const mut = useCreateTaskFromNote(tgId);

  function reset() {
    setTitle("");
    setDescription("");
    setDue("");
  }

  async function submit() {
    if (!title.trim()) return;
    await mut.mutateAsync({
      userNoteNumber,
      title: title.trim(),
      description: description.trim() || undefined,
      due_date: due || undefined,
    });
    setOpen(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <Plus className="h-4 w-4" />
          Задача из заметки
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новая задача</DialogTitle>
          <DialogDescription>
            Привязана к этой заметке. Бот будет напоминать с адаптивным интервалом.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Input
            placeholder="Что нужно сделать"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
          />
          <Textarea
            placeholder="Описание (необязательно)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
          <label className="grid gap-1">
            <span className="text-xs text-muted-foreground">Срок</span>
            <Input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={submit} disabled={!title.trim() || mut.isPending}>
            {mut.isPending ? "Создаю…" : "Создать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
