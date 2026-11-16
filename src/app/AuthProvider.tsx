import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../infrastructure/cloud/client";
import { repository } from "../infrastructure/storage/repository";
import { DataProvider } from "./DataProvider";
const Context = createContext<{ user: User | null; recovery: boolean }>({
  user: null,
  recovery: false,
});
export const useAuth = () => useContext(Context);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    user: User | null;
    ready: boolean;
    recovery: boolean;
  }>({ user: null, ready: false, recovery: false });
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      repository.userId = session?.user.id ?? null;
      setState((old) => ({
        user: session?.user ?? null,
        ready: true,
        recovery:
          event === "PASSWORD_RECOVERY" ||
          (event === "TOKEN_REFRESHED" && old.recovery),
      }));
      if (event === "PASSWORD_RECOVERY") window.location.hash = "/settings";
    });
    return () => subscription.unsubscribe();
  }, []);
  if (!state.ready)
    return <div className="empty-state">계정을 확인하고 있어요…</div>;
  return (
    <Context.Provider value={state}>
      <DataProvider key={state.user?.id ?? "guest"}>{children}</DataProvider>
    </Context.Provider>
  );
}
