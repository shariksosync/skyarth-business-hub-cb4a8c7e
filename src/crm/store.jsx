import { createContext, useCallback, useContext, useState, useEffect } from "react";
import { seed, PROJECT_EXECUTION_STAGES } from "./data";
import { todayISO } from "./utils/format";
import { round2, num, inr } from "./utils";

const Ctx = createContext(null);
const STORAGE_KEY = "skyarth-crm-storage-v1";

export function CRMProvider({ children }) {
  const [data, setData] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const savedQuotes = parsed.quotations || [];
          const missingSeedQuotes = (seed.quotations || []).filter(
            (sq) => !savedQuotes.some((q) => q.id === sq.id)
          );
          const cleanedInventory = (parsed.inventory || seed.inventory).map((it) => {
            const { sellingRate, ...rest } = it;
            return rest;
          });
          const savedMovements = parsed.movements || [];
          const missingMovements = (seed.movements || []).filter(
            (sm) => !savedMovements.some((m) => m.id === sm.id)
          );
          const savedReceipts = parsed.receipts || [];
          const missingReceipts = (seed.receipts || []).filter(
            (sr) => !savedReceipts.some((r) => r.id === sr.id)
          );

          // Hydrate projects with rich Work Order, Stages, and Phases
          const savedProjects = parsed.projects || [];
          const hydratedProjects = (savedProjects.length ? savedProjects : seed.projects).map((p) => {
            const seedP = (seed.projects || []).find((sp) => sp.id === p.id);
            return {
              ...seedP,
              ...p,
              workOrderNo: p.workOrderNo || seedP?.workOrderNo || `WO/${p.code}/2026`,
              workOrderDate: p.workOrderDate || seedP?.workOrderDate || p.startDate,
              targetCompletionDate: p.targetCompletionDate || seedP?.targetCompletionDate || "",
              currentStage: p.currentStage || seedP?.currentStage || "Advance Received",
              stages: Array.isArray(p.stages) && p.stages.length ? p.stages : (seedP?.stages || []),
              phases: Array.isArray(p.phases) && p.phases.length ? p.phases : (seedP?.phases || []),
              communications: Array.isArray(p.communications) ? p.communications : (seedP?.communications || []),
            };
          });

          // Hydrate invoices with Work Order references
          const savedInvoices = (parsed.invoices || seed.invoices).map((inv) => {
            const p = hydratedProjects.find((x) => x.id === inv.projectId);
            return {
              ...inv,
              workOrderNo: inv.workOrderNo || p?.workOrderNo || "",
              workOrderDate: inv.workOrderDate || p?.workOrderDate || "",
            };
          });

          return {
            ...seed,
            ...parsed,
            inventory: cleanedInventory,
            projects: hydratedProjects,
            invoices: savedInvoices,
            movements: [...savedMovements, ...missingMovements],
            quotations: [...savedQuotes, ...missingSeedQuotes],
            receipts: [...savedReceipts, ...missingReceipts],
          };
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
      expectedCompletionDate: "",
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

  /* ---------------- Inventory & Movement Helpers ---------------- */
  const addInventoryItem = useCallback((item) => {
    const id = `item-${Date.now()}`;
    const newItem = {
      id,
      stock: 0,
      reserved: 0,
      purchaseRate: 0,
      reorderLevel: 0,
      ...item,
    };
    delete newItem.sellingRate;
    setData((d) => {
      const inv = [...(d.inventory || []), newItem];
      let movs = d.movements || [];
      if (Number(newItem.stock) > 0) {
        movs = [
          {
            id: `mv-${Date.now()}`,
            itemId: id,
            date: todayISO(),
            type: "Received",
            qty: Number(newItem.stock),
            projectId: "",
            reference: "Opening",
            notes: "Opening stock balance",
            balanceAfter: Number(newItem.stock),
          },
          ...movs,
        ];
      }
      return { ...d, inventory: inv, movements: movs };
    });
    return newItem;
  }, []);

  const updateInventoryItem = useCallback((id, patch) => {
    const cleanPatch = { ...patch };
    delete cleanPatch.sellingRate;
    setData((d) => ({
      ...d,
      inventory: (d.inventory || []).map((i) => (i.id === id ? { ...i, ...cleanPatch } : i)),
    }));
  }, []);

  const deleteInventoryItem = useCallback((id) => {
    setData((d) => ({
      ...d,
      inventory: (d.inventory || []).filter((i) => i.id !== id),
      movements: (d.movements || []).filter((m) => m.itemId !== id),
    }));
  }, []);

  const addStockMovement = useCallback((movement) => {
    const id = `mv-${Date.now()}`;
    const newMovement = {
      id,
      date: todayISO(),
      ...movement,
    };

    setData((d) => {
      const item = (d.inventory || []).find((x) => x.id === movement.itemId);
      if (!item) return d;

      let stock = Number(item.stock) || 0;
      let reserved = Number(item.reserved) || 0;
      const q = Number(movement.qty) || 0;

      if (movement.type === "Received") {
        stock += q;
      } else if (movement.type === "Issued") {
        stock = Math.max(0, stock - q);
        if (movement.projectId && reserved > 0) {
          reserved = Math.max(0, reserved - Math.min(q, reserved));
        }
      } else if (movement.type === "Reserved") {
        reserved += q;
      } else if (movement.type === "Adjustment") {
        stock += q;
      }
      if (reserved > stock) reserved = stock;

      newMovement.balanceAfter = stock;

      const updatedInventory = (d.inventory || []).map((x) =>
        x.id === item.id ? { ...x, stock, reserved } : x
      );

      return {
        ...d,
        inventory: updatedInventory,
        movements: [newMovement, ...(d.movements || [])],
      };
    });

    return newMovement;
  }, []);

  /* ---------------- Payment Receipt Helpers ---------------- */
  const addPaymentReceipt = useCallback((receiptData) => {
    const id = `rec-${Date.now()}`;
    const yr = new Date().getFullYear();
    const count = String((data.receipts?.length || 0) + 1).padStart(4, "0");
    const number = receiptData.number || `SKY/REC/${yr}/${count}`;
    const newReceipt = {
      id,
      number,
      date: todayISO(),
      status: "Cleared",
      ...receiptData,
      amount: round2(num(receiptData.amount)),
    };

    setData((d) => {
      const updatedReceipts = [newReceipt, ...(d.receipts || [])];
      // Keep invoice payments array in sync for consistent tracking
      const updatedInvoices = (d.invoices || []).map((inv) => {
        if (inv.id !== newReceipt.invoiceId) return inv;
        const payObj = {
          id: `pay-${newReceipt.id}`,
          receiptId: newReceipt.id,
          receiptNumber: newReceipt.number,
          date: newReceipt.date,
          amount: newReceipt.amount,
          method: newReceipt.method,
          ref: newReceipt.reference || "",
          notes: newReceipt.notes || "",
        };
        return {
          ...inv,
          payments: [...(inv.payments || []), payObj],
          history: [
            ...(inv.history || []),
            {
              id: `h-${Date.now()}`,
              date: todayISO(),
              text: `Payment Receipt ${newReceipt.number} issued for ${inr(newReceipt.amount)} (${newReceipt.method})`,
            },
          ],
        };
      });
      return { ...d, receipts: updatedReceipts, invoices: updatedInvoices };
    });
    return newReceipt;
  }, [data.receipts]);

  const deletePaymentReceipt = useCallback((receiptId) => {
    setData((d) => {
      const rec = (d.receipts || []).find((r) => r.id === receiptId);
      const updatedReceipts = (d.receipts || []).filter((r) => r.id !== receiptId);
      const updatedInvoices = (d.invoices || []).map((inv) => {
        if (rec && inv.id === rec.invoiceId) {
          return {
            ...inv,
            payments: (inv.payments || []).filter(
              (p) => p.receiptId !== receiptId && p.id !== `pay-${receiptId}`
            ),
            history: [
              ...(inv.history || []),
              {
                id: `h-${Date.now()}`,
                date: todayISO(),
                text: `Payment Receipt ${rec.number} reversed`,
              },
            ],
          };
        }
        return inv;
      });
      return { ...d, receipts: updatedReceipts, invoices: updatedInvoices };
    });
  }, []);

  /* ---------------- Running Project & Execution Helpers ---------------- */
  const addProject = useCallback((projectData) => {
    const id = `proj-${Date.now()}`;
    const count = (data.projects?.length || 0) + 2001;
    const code = projectData.code || `P-${count}`;
    const newProject = {
      id,
      code,
      name: projectData.name || "New Project",
      customerName: projectData.customerName || "",
      companyName: projectData.companyName || "",
      phone: projectData.phone || "",
      email: projectData.email || "",
      billingAddress: projectData.billingAddress || "",
      siteAddress: projectData.siteAddress || "",
      city: projectData.city || "",
      siteContact: projectData.siteContact || "",
      startDate: projectData.startDate || todayISO(),
      status: projectData.status || "In Progress",
      employeeId: projectData.employeeId || "emp-3",
      workOrderNo: projectData.workOrderNo || `WO/${code}/${new Date().getFullYear()}`,
      workOrderDate: projectData.workOrderDate || todayISO(),
      targetCompletionDate: projectData.targetCompletionDate || "",
      currentStage: projectData.currentStage || "Advance Received",
      value: round2(num(projectData.value)),
      notes: projectData.notes || "",
      stages:
        Array.isArray(projectData.stages) && projectData.stages.length
          ? projectData.stages
          : PROJECT_EXECUTION_STAGES.map((stg, i) => ({
              stageName: stg,
              targetDate: projectData.targetCompletionDate || todayISO(),
              completedDate: i === 0 ? todayISO() : "",
              status: i === 0 ? "Completed" : "Pending",
              supervisorId: projectData.employeeId || "emp-3",
              notes: "",
            })),
      phases: projectData.phases || [],
      communications: [],
      quotationId: projectData.quotationId || "",
      leadId: projectData.leadId || "",
    };

    setData((d) => ({
      ...d,
      projects: [newProject, ...(d.projects || [])],
    }));
    return newProject;
  }, [data.projects]);

  const updateProject = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      projects: (d.projects || []).map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  }, []);

  const updateProjectStage = useCallback((projectId, stageName, patch) => {
    setData((d) => ({
      ...d,
      projects: (d.projects || []).map((p) => {
        if (p.id !== projectId) return p;
        const stages = (p.stages || []).map((s) =>
          s.stageName === stageName ? { ...s, ...patch } : s
        );
        const currentStage =
          patch.status === "Completed" || patch.status === "In Progress"
            ? stageName
            : p.currentStage;
        return { ...p, stages, currentStage };
      }),
    }));
  }, []);

  const addProjectPhase = useCallback((projectId, phase) => {
    const phaseId = `ph-${Date.now()}`;
    const newPhase = {
      id: phaseId,
      name: phase.name || "New Phase",
      scope: phase.scope || "",
      targetDate: phase.targetDate || todayISO(),
      activeStage: phase.activeStage || "Advance Received",
      civilReadiness: phase.civilReadiness || "Pending Readiness",
      measurementStatus: phase.measurementStatus || "Pending",
      productionStatus: phase.productionStatus || "Pending",
      dispatchStatus: phase.dispatchStatus || "Pending",
      installationStatus: phase.installationStatus || "Pending",
      unitsCount: Number(phase.unitsCount) || 0,
      notes: phase.notes || "",
      ...phase,
    };
    setData((d) => ({
      ...d,
      projects: (d.projects || []).map((p) =>
        p.id === projectId ? { ...p, phases: [...(p.phases || []), newPhase] } : p
      ),
    }));
    return newPhase;
  }, []);

  const updateProjectPhase = useCallback((projectId, phaseId, patch) => {
    setData((d) => ({
      ...d,
      projects: (d.projects || []).map((p) => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          phases: (p.phases || []).map((ph) => (ph.id === phaseId ? { ...ph, ...patch } : ph)),
        };
      }),
    }));
  }, []);

  const deleteProjectPhase = useCallback((projectId, phaseId) => {
    setData((d) => ({
      ...d,
      projects: (d.projects || []).map((p) =>
        p.id === projectId
          ? { ...p, phases: (p.phases || []).filter((ph) => ph.id !== phaseId) }
          : p
      ),
    }));
  }, []);

  const logProjectCommunication = useCallback((projectId, comm) => {
    const commRecord = {
      id: `comm-${Date.now()}`,
      date: new Date().toISOString(),
      ...comm,
    };
    setData((d) => ({
      ...d,
      projects: (d.projects || []).map((p) =>
        p.id === projectId
          ? { ...p, communications: [commRecord, ...(p.communications || [])] }
          : p
      ),
    }));
    return commRecord;
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
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        addStockMovement,
        addPaymentReceipt,
        deletePaymentReceipt,
        addProject,
        updateProject,
        updateProjectStage,
        addProjectPhase,
        updateProjectPhase,
        deleteProjectPhase,
        logProjectCommunication,
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
