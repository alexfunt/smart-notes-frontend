import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Brain, ListTodo, NotebookPen, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "@/lib/utils";
import { useTelegramId } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

const navItems = [
  { to: "/notes", label: "Заметки", icon: NotebookPen },
  { to: "/tasks", label: "Задачи", icon: ListTodo },
];

export function AppShell() {
  const { tgId, logout } = useTelegramId();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm shadow-primary/30">
              <Brain className="h-4 w-4" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold leading-none">Smart Notes</div>
              <div className="text-[11px] text-muted-foreground">приоритет по фокусу</div>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span className="hidden xs:inline sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggle}
              aria-label="Сменить тему"
              className="h-9 w-9"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {tgId ? (
              <div className="hidden items-center gap-2 sm:flex">
                <div className="text-right">
                  <div className="text-[11px] leading-none text-muted-foreground">tg_id</div>
                  <div className="text-xs font-medium tabular-nums">{tgId}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  aria-label="Выйти"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="container py-6 sm:py-10">
        <Outlet />
      </main>

      <footer className="container py-8 text-center text-xs text-muted-foreground">
        ВКР · Smart Notes — приоритизация по фокусу и вовлечённости
      </footer>
    </div>
  );
}
