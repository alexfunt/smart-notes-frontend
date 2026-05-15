import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { LoginPage } from "@/pages/Login";
import { NotesPage } from "@/pages/Notes";
import { NoteDetailPage } from "@/pages/NoteDetail";
import { TasksPage } from "@/pages/Tasks";
import { useTelegramId } from "@/lib/auth";
import { Brain } from "lucide-react";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { tgId, checking } = useTelegramId();
  const location = useLocation();

  if (checking) {
    return (
      <div className="grid min-h-svh place-items-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="relative grid h-12 w-12 place-items-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Brain className="h-5 w-5 animate-pulse" />
          </div>
          <p className="text-sm">Авторизация через Telegram…</p>
        </div>
      </div>
    );
  }

  if (!tgId) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <AuthGate>
            <AppShell />
          </AuthGate>
        }
      >
        <Route index element={<Navigate to="/notes" replace />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/notes/:number" element={<NoteDetailPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="*" element={<Navigate to="/notes" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
