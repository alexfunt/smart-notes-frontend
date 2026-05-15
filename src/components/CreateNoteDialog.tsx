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
import { Textarea } from "./ui/Textarea";
import { Input } from "./ui/Input";
import { useCreateNote } from "@/lib/queries";

interface Props {
  tgId: number;
}

export function CreateNoteDialog({ tgId }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const mut = useCreateNote(tgId);

  function reset() {
    setTitle("");
    setContent("");
  }

  async function submit() {
    if (!content.trim()) return;
    await mut.mutateAsync({ title: title.trim(), content: content.trim() });
    setOpen(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Новая заметка
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новая заметка</DialogTitle>
          <DialogDescription>
            Запишите мысль — позже можно превратить в задачу.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Input
            placeholder="Заголовок (необязательно)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
          />
          <Textarea
            placeholder="Текст заметки…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={submit} disabled={!content.trim() || mut.isPending}>
            {mut.isPending ? "Сохраняю…" : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
