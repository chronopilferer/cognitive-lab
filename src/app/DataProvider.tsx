import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { emptyData, type Data } from "../infrastructure/storage/schema";
import { repository } from "../infrastructure/storage/repository";
const Context = createContext<{
  data: Data;
  error: string;
  notice: string;
  act: (fn: () => Promise<unknown>) => Promise<boolean>;
  setNotice: (s: string) => void;
}>({
  data: emptyData(),
  error: "",
  notice: "",
  act: async () => false,
  setNotice: () => {},
});
export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(emptyData);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  async function refresh() {
    try {
      setData(await repository.read());
      setError("");
    } catch (e) {
      setError(String(e instanceof Error ? e.message : e));
    } finally {
      setReady(true);
    }
  }
  useEffect(() => {
    void refresh();
    const fn = () => void refresh();
    window.addEventListener("storage", fn);
    window.addEventListener("lab-data", fn);
    return () => {
      window.removeEventListener("storage", fn);
      window.removeEventListener("lab-data", fn);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = data.settings.theme;
  }, [data.settings.theme]);
  async function act(fn: () => Promise<unknown>) {
    try {
      await fn();
      await refresh();
      return true;
    } catch (e) {
      setNotice(e instanceof Error ? e.message : String(e));
      return false;
    }
  }
  return (
    <Context.Provider value={{ data, error, notice, act, setNotice }}>
      {ready ? (
        children
      ) : (
        <div className="empty-state">기록을 불러오고 있어요…</div>
      )}
    </Context.Provider>
  );
}
export const useData = () => useContext(Context);
