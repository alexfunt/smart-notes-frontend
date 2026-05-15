import { useEffect, useState } from "react";

const KEY = "smart_notes.theme";
type Theme = "dark" | "light";

function readInitial(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem(KEY) as Theme | null;
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => readInitial());

  useEffect(() => {
    apply(theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  return { theme, setTheme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) };
}

export function initThemeBeforeRender() {
  if (typeof window === "undefined") return;
  apply(readInitial());
}
