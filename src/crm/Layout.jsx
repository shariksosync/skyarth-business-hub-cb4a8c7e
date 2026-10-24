import { useMemo, useRef, useState, useEffect } from "react";
import { useCRM } from "./store";
import { Icon, Logo } from "./ui";
import { fmtDate, matches, todayISO } from "./utils";

export const NAV = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "leads", label: "Leads", icon: "leads" },
  { key: "quotations", label: "Quotations", icon: "quote" },
  { key: "projects", label: "Running Projects", icon: "projects" },
  { key: "employees", label: "Employees", icon: "employees" },
  { key: "inventory", label: "Inventory", icon: "inventory" },
  { key: "invoices", label: "Tax Invoices", icon: "invoice" },
  { key: "settings", label: "Settings", icon: "settings" },
];

export const SECTION_OF = {
  dashboard: "dashboard", leads: "leads", lead: "leads", quotations: "quotations", quotationForm: "quotations",
  quotation: "quotations", projects: "projects", projectDetails: "projects",
  employees: "employees", employee: "employees", employeeDocuments: "employees",
  inventory: "inventory", invoices: "invoices", project: "invoices",
  invoiceForm: "invoices", invoice: "invoices", register: "invoices",
  receipts: "invoices", receipt: "invoices", ledger: "invoices",
  settings: "settings",
};

const CRUMB = {
  lead: "Lead Details", quotationForm: "Quotation Editor", quotation: "Quotation Details",
  projects: "Running Projects", projectDetails: "Project Execution & Work Order",
  employee: "Employee Profile", employeeDocuments: "KYC Documents",
  project: "Project Workspace", invoiceForm: "Invoice Editor", invoice: "Invoice Details",
  register: "Invoice Register", receipts: "Payment Receipts", receipt: "Payment Receipt Voucher",
  ledger: "Party Ledger",
};

export function Sidebar({ open, onClose }) {
  const { route, go, data, resetData } = useCRM();
  const active = SECTION_OF[route.page];
  return (
    <>
      {open && <div className="overlay lg:hidden no-print" onClick={onClose} />}
      <aside className={`sidebar no-print ${open ? "sidebar-open" : ""}`}>
        <div className="border-b border-border px-4 py-4">
          <Logo src={data.settings.logo} className="sidebar-logo" />
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV.map((n) => (
            <button key={n.key} onClick={() => { go(n.key); onClose(); }} className={`nav-item ${active === n.key ? "nav-active" : ""}`}>
              <Icon name={n.icon} /> {n.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-border p-3 space-y-2">
          <button
            onClick={() => {
              if (window.confirm("Reset all CRM mock data back to factory defaults?")) {
                resetData();
                onClose();
              }
            }}
            className="w-full text-xs font-semibold py-1.5 px-2.5 rounded border border-neutral-200 text-neutral-600 hover:bg-neutral-100 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            ↻ Reset Demo Data
          </button>
          <div className="text-[11px] text-neutral-400 text-center">Skyarth uPVC Windows CRM</div>
        </div>
      </aside>
    </>
  );
}

function useOutside(ref, fn) {
  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && fn();
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, fn]);
}

export function Topbar({ onMenu }) {
  const { route, go, data } = useCRM();
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState("");
  const boxRef = useRef(null);
  useOutside(boxRef, () => { setQ(""); setMenu(""); });
  const section = NAV.find((n) => n.key === SECTION_OF[route.page]);
  const results = useMemo(() => {
    if (q.trim().length < 2) return [];
    const r = [];
    data.leads.forEach((l) => matches(q, l.code, l.customerName, l.phone, l.projectName, l.companyName) && r.push({ k: l.id, type: "Lead", label: `${l.code} · ${l.customerName} · ${l.projectName}`, go: () => go("lead", { id: l.id }) }));
    data.quotations.forEach((x) => matches(q, x.number, x.customerName, x.projectName) && r.push({ k: x.id, type: "Quotation", label: `${x.number} · ${x.customerName}`, go: () => go("quotation", { id: x.id }) }));
    data.projects.forEach((p) => matches(q, p.code, p.name, p.customerName, p.phone) && r.push({ k: p.id, type: "Project", label: `${p.code} · ${p.name}`, go: () => go("project", { id: p.id }) }));
    data.invoices.forEach((i) => {
      const p = data.projects.find((x) => x.id === i.projectId);
      matches(q, i.number, p?.name, p?.customerName) && r.push({ k: i.id, type: "Invoice", label: `${i.number} · ${p?.name}`, go: () => go("invoice", { id: i.id }) });
    });
    (data.receipts || []).forEach((rec) => {
      matches(q, rec.number, rec.customerName, rec.invoiceNumber, rec.reference) && r.push({ k: rec.id, type: "Receipt", label: `${rec.number} · ${rec.customerName} · ${rec.invoiceNumber}`, go: () => go("receipt", { id: rec.id }) });
    });
    data.employees.forEach((e) => matches(q, e.code, e.name, e.phone, e.email) && r.push({ k: e.id, type: "Employee", label: `${e.code} · ${e.name}`, go: () => go("employee", { id: e.id }) }));
    return r.slice(0, 12);
  }, [q, data, go]);

  const quick = [
    ["New Lead", () => go("leads", { new: true })],
    ["New Quotation", () => go("quotationForm", {})],
    ["New Project", () => go("invoices", { newProject: true })],
    ["Invoice Register", () => go("register")],
    ["Payment Receipts", () => go("invoices", { tab: "receipts" })],
    ["Party Ledger", () => go("invoices", { tab: "ledger" })],
    ["New Inventory Item", () => go("inventory", { new: true })],
  ];

  return (
    <header className="topbar no-print" ref={boxRef}>
      <button className="btn btn-ghost btn-sm lg:hidden" onClick={onMenu} aria-label="Open menu"><Icon name="menu" /></button>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">
          {section?.label}{CRUMB[route.page] ? ` / ${CRUMB[route.page]}` : ""}
        </div>
      </div>
      <div className="relative ml-auto w-full max-w-md flex-1">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2"><Icon name="search" size={16} /></span>
        <input className="input pl-8" placeholder="Search leads, quotations, projects, invoices, employees" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Global search" />
        {q.trim().length >= 2 && (
          <div className="card absolute left-0 right-0 top-full z-40 mt-1 max-h-96 overflow-y-auto p-1 shadow-panel">
            {results.length === 0 && <div className="p-3 text-sm">No matches for "{q}".</div>}
            {results.map((r) => (
              <button key={r.type + r.k} className="menu-item" onClick={() => { r.go(); setQ(""); }}>
                <span className="pill mr-2">{r.type}</span>{r.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="relative hidden sm:block">
        <button className="btn btn-primary" onClick={() => setMenu(menu === "quick" ? "" : "quick")}><Icon name="plus" size={16} /> Quick action</button>
        {menu === "quick" && (
          <div className="card absolute right-0 top-full z-40 mt-1 w-52 p-1 shadow-panel">
            {quick.map(([l, f]) => <button key={l} className="menu-item" onClick={() => { f(); setMenu(""); }}>{l}</button>)}
          </div>
        )}
      </div>
      <div className="hidden whitespace-nowrap text-sm xl:block">{fmtDate(todayISO())}</div>
      <div className="relative">
        <button className="btn btn-ghost btn-sm" onClick={() => setMenu(menu === "user" ? "" : "user")} aria-label="Profile menu">
          <span className="avatar">OA</span>
        </button>
        {menu === "user" && (
          <div className="card absolute right-0 top-full z-40 mt-1 w-60 p-3 text-sm shadow-panel">
            <div className="font-semibold">Office Admin</div>
            <div>admin@skyarthupvc.com (demo)</div>
            <div className="mb-2">Role: Administrator</div>
            <button className="menu-item" onClick={() => { go("settings"); setMenu(""); }}>Settings</button>
            <button className="menu-item sm:hidden" onClick={() => { go("leads", { new: true }); setMenu(""); }}>New Lead</button>
          </div>
        )}
      </div>
    </header>
  );
}

export function Toasts() {
  const { toasts } = useCRM();
  return (
    <div className="fixed bottom-4 right-4 z-[60] space-y-2 no-print" aria-live="polite">
      {toasts.map((t) => <div key={t.id} className="card px-4 py-3 text-sm font-medium shadow-panel">✓ {t.msg}</div>)}
    </div>
  );
}
