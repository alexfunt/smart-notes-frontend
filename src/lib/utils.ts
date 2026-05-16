import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Task } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function relativeTime(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} д назад`;
  return formatDate(iso);
}

export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

export function isArchivedTask(t: Task, now: number = Date.now()): boolean {
  if (t.status !== "done") return false;
  if (!t.due_date) return true;
  const due = new Date(t.due_date).getTime();
  if (Number.isNaN(due)) return true;
  return due < now;
}

export function splitArchivedTasks(tasks: Task[] | undefined | null): {
  active: Task[];
  archived: Task[];
} {
  if (!tasks?.length) return { active: [], archived: [] };
  const now = Date.now();
  const active: Task[] = [];
  const archived: Task[] = [];
  for (const t of tasks) {
    (isArchivedTask(t, now) ? archived : active).push(t);
  }
  return { active, archived };
}

type TelegramWebAppLike = { openLink?: (url: string) => void };

export function openLink(url: string): void {
  const tg = (window as unknown as { Telegram?: { WebApp?: TelegramWebAppLike } })
    .Telegram?.WebApp;
  if (tg?.openLink) {
    tg.openLink(url);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
