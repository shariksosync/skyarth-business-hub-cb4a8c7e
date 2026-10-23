import { createContext, useCallback, useContext, useState } from "react";
import { seed } from "./data";

const Ctx = createContext(null);

export function CRMProvider({ children }) {
  const [data, setData] = useState(seed);
  const [route, setRoute] = useState({ page: "dashboard", params: {}, n: 0 });
  const [toasts, setToasts] = useState([]);

  const update = useCallback((key, fn) => setData((d) => ({ ...d, [key]: fn(d[key]) })), []);
  const go = useCallback((page, params = {}) => {
    setRoute((r) => ({ page, params, n: r.n + 1 }));
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);
  const toast = useCallback((msg) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  const resetData = useCallback(() => setData(seed), []);

  return (
    <Ctx.Provider value={{ data, update, route, go, toast, toasts, resetData }}>{children}</Ctx.Provider>
  );
}

export const useCRM = () => useContext(Ctx);

export const empName = (data, id) => data.employees.find((e) => e.id === id)?.name || "Unassigned";
