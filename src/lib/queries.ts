import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { api } from "./api";
import type { Note, NoteWithTasks, Task } from "./types";

const tgPath = (tgId: number) => `/telegram/users/${tgId}`;

export const qk = {
  notes: (tgId: number) => ["notes", tgId] as const,
  note: (tgId: number, n: number) => ["note", tgId, n] as const,
  tasks: (tgId: number) => ["tasks", tgId] as const,
};

export function useNotes(tgId: number | null) {
  return useQuery({
    queryKey: tgId ? qk.notes(tgId) : ["notes", "anon"],
    enabled: !!tgId,
    queryFn: async () => {
      const { data } = await api.get<Note[]>(`${tgPath(tgId!)}/notes`);
      return data;
    },
  });
}

export function useNote(
  tgId: number | null,
  userNoteNumber: number | null,
  opts?: { focus?: "note" | "task" }
) {
  return useQuery({
    queryKey: tgId && userNoteNumber ? qk.note(tgId, userNoteNumber) : ["note", "anon"],
    enabled: !!tgId && !!userNoteNumber,
    queryFn: async () => {
      const params = opts?.focus ? { focus: opts.focus } : undefined;
      const { data } = await api.get<NoteWithTasks>(
        `${tgPath(tgId!)}/notes/${userNoteNumber}`,
        { params }
      );
      return data;
    },
  });
}

export function useTasks(tgId: number | null) {
  return useQuery({
    queryKey: tgId ? qk.tasks(tgId) : ["tasks", "anon"],
    enabled: !!tgId,
    queryFn: async () => {
      const { data } = await api.get<Task[]>(`${tgPath(tgId!)}/tasks`);
      return data;
    },
  });
}

function invalidateAll(client: QueryClient, tgId: number) {
  client.invalidateQueries({ queryKey: qk.notes(tgId) });
  client.invalidateQueries({ queryKey: qk.tasks(tgId) });
  // Захватывает все ["note", tgId, *] — детали заметок с их задачами.
  client.invalidateQueries({ queryKey: ["note", tgId] });
}

export function useUpdateNote(tgId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { userNoteNumber: number; content: string }) => {
      const { data } = await api.patch<Note>(
        `${tgPath(tgId)}/notes/${vars.userNoteNumber}`,
        { content: vars.content }
      );
      return data;
    },
    onSuccess: (_, vars) => {
      client.invalidateQueries({ queryKey: qk.note(tgId, vars.userNoteNumber) });
      client.invalidateQueries({ queryKey: qk.notes(tgId) });
    },
  });
}

export function useDeleteNote(tgId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (userNoteNumber: number) => {
      await api.delete(`${tgPath(tgId)}/notes/${userNoteNumber}`);
    },
    onSuccess: () => invalidateAll(client, tgId),
  });
}

export function useCreateTaskFromNote(tgId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      userNoteNumber: number;
      title: string;
      description?: string;
      due_date?: string;
    }) => {
      const { data } = await api.post<Task>(
        `${tgPath(tgId)}/notes/${vars.userNoteNumber}/tasks`,
        {
          title: vars.title,
          description: vars.description,
          due_date: vars.due_date,
        }
      );
      return data;
    },
    onSuccess: (_, vars) => {
      client.invalidateQueries({ queryKey: qk.note(tgId, vars.userNoteNumber) });
      client.invalidateQueries({ queryKey: qk.tasks(tgId) });
    },
  });
}

export function useUpdateTask(tgId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      taskId: number;
      title?: string;
      description?: string;
      due_date?: string | null;
    }) => {
      const body: Record<string, unknown> = {};
      if (vars.title !== undefined) body.title = vars.title;
      if (vars.description !== undefined) body.description = vars.description;
      if (vars.due_date !== undefined) body.due_date = vars.due_date;
      const { data } = await api.patch<Task>(
        `${tgPath(tgId)}/tasks/${vars.taskId}`,
        body
      );
      return data;
    },
    onSuccess: () => invalidateAll(client, tgId),
  });
}

export function useToggleTask(tgId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: number) => {
      const { data } = await api.patch<Task>(`${tgPath(tgId)}/tasks/${taskId}/toggle`);
      return data;
    },
    onSuccess: () => invalidateAll(client, tgId),
  });
}

export function useDeleteTask(tgId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: number) => {
      await api.delete(`${tgPath(tgId)}/tasks/${taskId}`);
    },
    onSuccess: () => invalidateAll(client, tgId),
  });
}

export function useCreateNote(tgId: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { title: string; content: string }) => {
      const auth = await api.post<{ id: number }>("/auth/telegram", {
        telegram_id: tgId,
      });
      const { data } = await api.post<Note>("/notes", {
        user_id: auth.data.id,
        title: vars.title || vars.content.slice(0, 40),
        content: vars.content,
        source: "web",
        note_type: "plain",
        status: "active",
      });
      return data;
    },
    onSuccess: () => invalidateAll(client, tgId),
  });
}
