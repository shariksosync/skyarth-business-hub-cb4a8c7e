import { createContext, useCallback, useContext, useState, useEffect } from "react";
import { seed } from "./data";
import { todayISO } from "./utils/format";

const Ctx = createContext(null);
const STORAGE_KEY = "skyarth-crm-storage-v1";

export function CRMProvider({ children }) {
  const [data, setData] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...seed, ...parsed };
        }
      } catch (e) {
        console.error("Failed to load saved CRM data", e);
      }
    }
    return seed;
  });

  const [route, setRoute] = useState({ page: "dashboard", params: {}, n: 0 });
  const [toasts, setToasts] = useState([]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        // storage quota exceeded or disabled
      }
    }
  }, [data]);

  const update = useCallback((key, fn) => {
    setData((d) => ({ ...d, [key]: fn(d[key]) }));
  }, []);

  const go = useCallback((page, params = {}) => {
    setRoute((r) => ({ page, params, n: r.n + 1 }));
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);

  const toast = useCallback((msg, kind = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const resetData = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    setData(seed);
    toast("Demo data reset to factory defaults");
  }, [toast]);

  /* ---------------- Lead CRUD Helpers ---------------- */
  const addLead = useCallback((lead) => {
    const id = `lead-${Date.now()}`;
    const count = (data.leads?.length || 0) + 1001;
    const code = `L-${count}`;
    const newLead = {
      id,
      code,
      createdDate: todayISO(),
      status: "New",
      priority: "Medium",
      remarksList: [],
      siteVisits: [],
      calls: [],
      ...lead,
    };
    setData((d) => ({ ...d, leads: [newLead, ...(d.leads || [])] }));
    return newLead;
  }, [data.leads]);

  const updateLead = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      leads: (d.leads || []).map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  }, []);

  const deleteLead = useCallback((id) => {
    setData((d) => ({
      ...d,
      leads: (d.leads || []).filter((l) => l.id !== id),
    }));
  }, []);

  const addLeadRemark = useCallback((leadId, text, authorName = "Management") => {
    const remark = {
      id: `rem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text,
      authorName,
      createdAt: new Date().toISOString(),
    };
    setData((d) => ({
      ...d,
      leads: (d.leads || []).map((l) => {
        if (l.id !== leadId) return l;
        const list = Array.isArray(l.remarksList) ? [...l.remarksList] : [];
        return { ...l, remarksList: [...list, remark] };
      }),
    }));
    return remark;
  }, []);

  const updateLeadRemark = useCallback((leadId, remarkId, newText) => {
    setData((d) => ({
      ...d,
      leads: (d.leads || []).map((l) => {
        if (l.id !== leadId) return l;
        const list = (l.remarksList || []).map((r) =>
          r.id === remarkId ? { ...r, text: newText, updatedAt: new Date().toISOString() } : r
        );
        return { ...l, remarksList: list };
      }),
    }));
  }, []);

  /* ---------------- Quotation CRUD Helpers ---------------- */
  const addQuotation = useCallback((quote) => {
    const id = `q-${Date.now()}`;
    const count = String((data.quotations?.length || 0) + 1).padStart(4, "0");
    const number = quote.number || `SKY/QT/${new Date().getFullYear()}/${count}`;
    const newQuote = {
      id,
      number,
      date: todayISO(),
      status: "Draft",
      ...quote,
    };
    setData((d) => ({ ...d, quotations: [newQuote, ...(d.quotations || [])] }));
    return newQuote;
  }, [data.quotations]);

  const updateQuotation = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      quotations: (d.quotations || []).map((q) => (q.id === id ? { ...q, ...patch } : q)),
    }));
  }, []);

  const deleteQuotation = useCallback((id) => {
    setData((d) => ({
      ...d,
      quotations: (d.quotations || []).filter((q) => q.id !== id),
    }));
  }, []);

  const duplicateQuotation = useCallback((id) => {
    const found = (data.quotations || []).find((q) => q.id === id);
    if (!found) return null;
    const clonedId = `q-${Date.now()}`;
    const count = String((data.quotations?.length || 0) + 1).padStart(4, "0");
    const clonedNumber = `SKY/QT/${new Date().getFullYear()}/${count}`;
    const cloned = {
      ...found,
      id: clonedId,
      number: clonedNumber,
      date: todayISO(),
      status: "Draft",
      items: (found.items || []).map((item) => ({ ...item, id: `it-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` })),
    };
    setData((d) => ({ ...d, quotations: [cloned, ...(d.quotations || [])] }));
    return cloned;
  }, [data.quotations]);

  /* ---------------- Employee CRUD Helpers ---------------- */
  const addEmployee = useCallback((emp) => {
    const id = `emp-${Date.now()}`;
    const count = String((data.employees?.length || 0) + 101);
    const code = emp.code || `E-${count}`;
    const newEmp = {
      id,
      code,
      status: "Active",
      ...emp,
    };
    setData((d) => ({ ...d, employees: [...(d.employees || []), newEmp] }));
    return newEmp;
  }, [data.employees]);

  const updateEmployee = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      employees: (d.employees || []).map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }, []);

  const deleteEmployee = useCallback((id) => {
    setData((d) => ({
      ...d,
      employees: (d.employees || []).filter((e) => e.id !== id),
    }));
  }, []);

  /* ---------------- KYC Document Helpers ---------------- */
  const addDocument = useCallback((doc) => {
    const id = `doc-${Date.now()}`;
    const newDoc = {
      id,
      uploadedDate: todayISO(),
      status: "Verified",
      size: "200 KB",
      ...doc,
    };
    setData((d) => ({ ...d, documents: [newDoc, ...(d.documents || [])] }));
    return newDoc;
  }, []);

  const updateDocStatus = useCallback((docId, status) => {
    setData((d) => ({
      ...d,
      documents: (d.documents || []).map((doc) => (doc.id === docId ? { ...doc, status } : doc)),
    }));
  }, []);

  return (
    <Ctx.Provider
      value={{
        data,
        update,
        route,
        go,
        toast,
        toasts,
        resetData,
        addLead,
        updateLead,
        deleteLead,
        addLeadRemark,
        updateLeadRemark,
        addQuotation,
        updateQuotation,
        deleteQuotation,
        duplicateQuotation,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addDocument,
        updateDocStatus,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useCRM = () => useContext(Ctx);

export const empName = (data, id) => {
  if (!id) return "Unassigned";
  return (data.employees || []).find((e) => e.id === id || e.code === id)?.name || "Unassigned";
};
