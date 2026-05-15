import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

const STORAGE_KEY = "smart_notes.telegram_id";

function readFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("tg_id") || params.get("telegram_id");
  return id && /^\d+$/.test(id) ? id : null;
}

function readFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v && /^\d+$/.test(v) ? v : null;
}

export function getTelegramId(): number | null {
  const fromUrl = readFromUrl();
  if (fromUrl) {
    window.localStorage.setItem(STORAGE_KEY, fromUrl);
    return Number(fromUrl);
  }
  const stored = readFromStorage();
  return stored ? Number(stored) : null;
}

export function setTelegramId(id: number | string) {
  window.localStorage.setItem(STORAGE_KEY, String(id));
}

export function clearTelegramId() {
  window.localStorage.removeItem(STORAGE_KEY);
}

interface TelegramWebApp {
  initData?: string;
  initDataUnsafe?: { user?: { id?: number } };
  ready?: () => void;
  expand?: () => void;
  colorScheme?: "dark" | "light";
}
declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

function getWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  return window.Telegram?.WebApp ?? null;
}

export function isInsideTelegram(): boolean {
  const wa = getWebApp();
  return !!wa?.initData;
}

async function trySignInWithInitData(): Promise<number | null> {
  const wa = getWebApp();
  const initData = wa?.initData;
  if (!initData) return null;
  try {
    const { data } = await api.post<{ telegram_id: number | null }>(
      "/auth/telegram/webapp",
      { init_data: initData }
    );
    const id = data.telegram_id ?? wa?.initDataUnsafe?.user?.id ?? null;
    if (id) {
      setTelegramId(id);
      return Number(id);
    }
  } catch {
    return null;
  }
  return null;
}

export function useTelegramId() {
  const [tgId, setTgId] = useState<number | null>(() => getTelegramId());
  const [checking, setChecking] = useState<boolean>(() => {
    return getTelegramId() === null && isInsideTelegram();
  });

  useEffect(() => {
    const wa = getWebApp();
    wa?.ready?.();
    wa?.expand?.();
  }, []);

  useEffect(() => {
    if (tgId) {
      setChecking(false);
      return;
    }
    if (!isInsideTelegram()) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    setChecking(true);
    trySignInWithInitData().then((id) => {
      if (!cancelled) {
        if (id) setTgId(id);
        setChecking(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [tgId]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        setTgId(e.newValue ? Number(e.newValue) : null);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback((id: number | string) => {
    setTelegramId(id);
    setTgId(Number(id));
  }, []);

  const logout = useCallback(() => {
    clearTelegramId();
    setTgId(null);
  }, []);

  return { tgId, login, logout, checking };
}
