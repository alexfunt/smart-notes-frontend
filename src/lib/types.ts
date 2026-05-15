export type Note = {
  id: number;
  user_id: number;
  user_note_number: number;
  title: string;
  content: string;
  source: string;
  note_type: string;
  status: string;
  metadata_json: Record<string, unknown> | null;
  focus_score: number;
  last_focus_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type Task = {
  id: number;
  user_id: number;
  user_task_number: number;
  note_id: number | null;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high" | string;
  status: "pending" | "done" | string;
  due_date: string | null;
  ai_generated: boolean;
  next_check_at: string | null;
  engagement_score: number;
  last_reminder_reply_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type NoteWithTasks = Note & { tasks: Task[] };
