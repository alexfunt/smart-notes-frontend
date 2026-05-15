import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, MessageSquareText, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { isInsideTelegram, useTelegramId } from "@/lib/auth";

export function LoginPage() {
  const { tgId, login, checking } = useTelegramId();
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  useEffect(() => {
    if (tgId) navigate("/notes", { replace: true });
  }, [tgId, navigate]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = value.trim();
    if (!/^\d+$/.test(v)) return;
    login(v);
    navigate("/notes");
  }

  const showTelegramHint = isInsideTelegram() && checking;

  return (
    <div className="relative grid min-h-svh place-items-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-[300px] w-[300px] rounded-full bg-[hsl(var(--focus-mid))]/15 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/40">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Smart Notes</h1>
            <p className="text-xs text-muted-foreground">
              приоритизация по фокусу и вовлечённости
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-xl">
          {showTelegramHint ? (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-border bg-accent/40 p-3 text-xs text-accent-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Авторизация через Telegram…
            </div>
          ) : null}
          <h2 className="text-lg font-semibold">Войти</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Введите свой Telegram ID. Позже бот будет открывать сайт сам — по ссылке.
          </p>

          <form onSubmit={submit} className="mt-5 space-y-3">
            <label className="grid gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Telegram ID</span>
              <Input
                type="text"
                inputMode="numeric"
                pattern="\d+"
                placeholder="например, 123456789"
                value={value}
                onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
                required
                autoFocus
              />
            </label>
            <Button type="submit" className="w-full" size="lg" disabled={!value}>
              Войти
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-5 rounded-md border border-border/70 bg-secondary/40 p-3 text-xs text-muted-foreground">
            <div className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
              <MessageSquareText className="h-3.5 w-3.5" />
              Подсказка
            </div>
            Узнать свой Telegram ID можно у бота{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">@userinfobot</code>.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
