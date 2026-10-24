import { useEffect, useMemo, useState } from "react";

const P = {
  dashboard: "M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z",
  leads: "M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zM4 21c0-4 4-6 8-6s8 2 8 6",
  quote: "M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h8M9 9h3",
  employees: "M3 5h18v14H3zM8 10a2 2 0 1 0 0 .01M5.5 16c.5-1.5 1.5-2 2.5-2s2 .5 2.5 2M13 9h5M13 13h5",
  inventory: "M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10",
  invoice: "M5 2h14v20l-3-2-2 2-2-2-2 2-2-2-3 2zM9 7h6M9 11h6M9 15h4",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5",
  plus: "M12 5v14M5 12h14",
  menu: "M3 6h18M3 12h18M3 18h18",
  x: "M6 6l12 12M18 6L6 18",
  back: "M15 18l-6-6 6-6",
  sort: "M8 9l4-4 4 4M8 15l4 4 4-4",
  up: "M8 14l4-4 4 4",
  down: "M8 10l4 4 4-4",
  projects: "M3 21h18M5 21V7l8-4v18M13 11l6 3v7M9 9h1M9 13h1M9 17h1M16 17h1",
  whatsapp: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  check: "M20 6L9 17l-5-5",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  print: "M6 9V2h12v7M6 18H4v-7h16v7h-2M6 14h12v8H6z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 4-6 8-6s8 2 8 6",
};

export function Icon({ name, size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[name] || ""} />
    </svg>
  );
}

export function Pill({ children }) {
  return <span className="pill">{children}</span>;
}

export function PageHeader({ title, subtitle, children, onBack }) {
  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between no-print">
      <div className="flex items-start gap-2">
        {onBack && (
          <button className="btn btn-sm mt-1" onClick={onBack} aria-label="Back"><Icon name="back" size={16} /> Back</button>
        )}
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function Modal({ open, title, onClose, children, footer, wide }) {
  useEffect(() => {
    if (!open) return undefined;
    const h = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="overlay no-print" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div role="dialog" aria-modal="true" className={`card modal-panel ${wide ? "max-w-4xl" : "max-w-xl"}`}>
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close"><Icon name="x" size={16} /></button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title = "Please confirm", message, confirmLabel = "Confirm", onConfirm, onCancel, children, disabled }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}
      footer={<><button className="btn" onClick={onCancel}>Cancel</button><button className="btn btn-primary" disabled={disabled} onClick={onConfirm}>{confirmLabel}</button></>}>
      <div className="space-y-3 text-sm">{typeof message === "string" ? <p>{message}</p> : message}{children}</div>
    </Modal>
  );
}

export function Field({ label, error, children, required, className = "" }) {
  return (
    <label className={`block text-sm ${className}`}>
      <span className="mb-1 block font-medium">{label}{required && " *"}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-semibold">⚠ {error}</span>}
    </label>
  );
}

export function Input(props) { return <input {...props} className={`input ${props.className || ""}`} />; }
export function Textarea(props) { return <textarea rows={3} {...props} className={`input ${props.className || ""}`} />; }
export function Select({ options, placeholder, ...props }) {
  return (
    <select {...props} className={`input ${props.className || ""}`}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => typeof o === "object"
        ? <option key={o.value} value={o.value}>{o.label}</option>
        : <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function StatCard({ label, value, hint, onClick }) {
  return (
    <button onClick={onClick} className="card stat-card text-left">
      <div className="text-sm font-medium">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {hint && <div className="mt-1 text-xs">{hint}</div>}
    </button>
  );
}

export function Toolbar({ children }) {
  return <div className="card mb-4 flex flex-col gap-3 p-3 md:flex-row md:flex-wrap md:items-end no-print">{children}</div>;
}

export function SearchBox({ value, onChange, placeholder = "Search…" }) {
  return (
    <div className="relative min-w-0 flex-1 md:min-w-64">
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2"><Icon name="search" size={16} /></span>
      <input className="input pl-8" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label="Search" />
    </div>
  );
}

export function DataTable({ columns, rows, rowKey = "id", onRowClick, empty = "No records found.", initialSort, compact }) {
  const [sort, setSort] = useState(initialSort || null);
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const get = col.sortValue || ((r) => r[col.key]);
    return [...rows].sort((a, b) => {
      const x = get(a), y = get(b);
      const r = typeof x === "number" && typeof y === "number" ? x - y : String(x ?? "").localeCompare(String(y ?? ""), undefined, { numeric: true });
      return sort.dir === "asc" ? r : -r;
    });
  }, [rows, sort, columns]);
  const pages = Math.max(1, Math.ceil(sorted.length / size));
  const p = Math.min(page, pages);
  const view = compact ? sorted : sorted.slice((p - 1) * size, p * size);
  const toggle = (c) => {
    if (c.sortable === false) return;
    setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === "asc" ? "desc" : "asc" } : { key: c.key, dir: "asc" }));
  };
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={c.align === "right" ? "text-right" : ""}>
                  {c.sortable === false ? c.label : (
                    <button className="inline-flex items-center gap-1 font-semibold" onClick={() => toggle(c)}>
                      {c.label}
                      <Icon name={sort?.key === c.key ? (sort.dir === "asc" ? "up" : "down") : "sort"} size={13} />
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.length === 0 && (
              <tr><td colSpan={columns.length} className="py-10 text-center">{empty}</td></tr>
            )}
            {view.map((r) => (
              <tr key={r[rowKey]} onClick={onRowClick ? () => onRowClick(r) : undefined} className={onRowClick ? "cursor-pointer" : ""}>
                {columns.map((c) => (
                  <td key={c.key} className={c.align === "right" ? "text-right whitespace-nowrap" : ""}
                    onClick={c.key === "actions" ? (e) => e.stopPropagation() : undefined}>
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2 text-sm no-print">
          <span>{sorted.length} record{sorted.length === 1 ? "" : "s"}</span>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1">Rows
              <select className="input w-auto py-1" value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}>
                {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <button className="btn btn-sm" disabled={p <= 1} onClick={() => setPage(p - 1)}>Prev</button>
            <span>{p} / {pages}</span>
            <button className="btn btn-sm" disabled={p >= pages} onClick={() => setPage(p + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Section({ title, children, actions, className = "" }) {
  return (
    <section className={`card p-4 ${className}`}>
      {(title || actions) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">{title}</h2>
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function KV({ items }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
      {items.filter(Boolean).map(([k, v]) => (
        <div key={k}>
          <dt className="font-semibold">{k}</dt>
          <dd className="break-words">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Logo({ src, className = "" }) {
  if (src) return <img src={src} alt="SKYARTH uPVC Windows & Doors" className={`logo-img ${className}`} />;
  return <div className={`logo-placeholder ${className}`}>Company logo — upload in Settings</div>;
}
