import { forwardRef, useEffect, useMemo, useState, type ReactNode } from "react";
import { X, ChevronLeft, ChevronRight, Search, Inbox, Loader2 } from "lucide-react";

export const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");

/* ---------------- Buttons ---------------- */
export type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md";
};

export function Button({ variant = "primary", size = "md", className, ...props }: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap cursor-pointer";
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-9 px-4 text-sm" };
  const variants = {
    primary: "bg-black text-white hover:bg-neutral-800 shadow-sm border border-black",
    secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-200",
    outline: "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100",
    ghost: "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
  };
  return <button className={cx(base, sizes[size], variants[variant], className)} {...props} />;
}

/* ---------------- Cards ---------------- */
export const Card = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cx("rounded-xl border border-neutral-200 bg-white text-neutral-900 shadow-sm", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export function SectionCard({
  title,
  subtitle,
  action,
  actions,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const headerAction = action ?? actions;
  return (
    <Card className={className}>
      {(title || headerAction) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            {title && <h3 className="truncate text-sm font-bold text-neutral-900">{title}</h3>}
            {subtitle && <p className="truncate text-xs text-neutral-500">{subtitle}</p>}
          </div>
          {headerAction}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </Card>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
  valueClassName,
  className,
  onClick,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "primary" | "accent" | "success" | "warning" | "danger" | "muted";
  valueClassName?: string;
  className?: string;
  onClick?: () => void;
}) {
  const tones: Record<string, string> = {
    default: "bg-neutral-100 text-neutral-700 border border-neutral-200",
    muted: "bg-neutral-100 text-neutral-600 border border-neutral-200",
    primary: "bg-black/5 text-black border border-black/10",
    accent: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border border-amber-200",
    danger: "bg-rose-50 text-rose-700 border border-rose-200",
  };
  return (
    <Card
      className={cx(
        "p-4 transition-all duration-150",
        onClick && "cursor-pointer hover:border-black/30 hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-neutral-500">{label}</p>
          <p className={cx("mt-1.5 text-2xl font-extrabold tracking-tight text-neutral-900", valueClassName)}>{value}</p>
          {hint && <p className="mt-1 truncate text-xs text-neutral-400">{hint}</p>}
        </div>
        {icon && (
          <div className={cx("grid size-10 shrink-0 place-items-center rounded-xl", tones[tone] || tones.default)}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

/* ---------------- Badges ---------------- */
const toneMap: Record<string, string> = {
  Active: "success",
  Present: "success",
  Completed: "success",
  Approved: "success",
  Converted: "success",
  Paid: "success",
  Verified: "success",
  Accepted: "success",
  Pending: "warning",
  "In Progress": "warning",
  "Follow-up": "warning",
  "On Leave": "warning",
  "Site Visit Scheduled": "warning",
  "Measurement Done": "warning",
  "Quotation Required": "warning",
  "Quotation Sent": "info",
  "Under Negotiation": "warning",
  Scheduled: "warning",
  Sent: "info",
  Draft: "muted",
  Negotiation: "warning",
  "Follow-up Required": "warning",
  Inactive: "muted",
  Cancelled: "muted",
  Planning: "info",
  New: "info",
  Contacted: "info",
  Qualified: "info",
  "Proposal Sent": "info",
  Overdue: "danger",
  Absent: "danger",
  Rejected: "danger",
  Lost: "danger",
  Low: "muted",
  Medium: "info",
  High: "warning",
  Urgent: "danger",
};

const badgeTones: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/25",
  danger: "bg-rose-50 text-rose-700 ring-rose-600/20",
  info: "bg-blue-50 text-blue-700 ring-blue-600/20",
  muted: "bg-neutral-100 text-neutral-600 ring-neutral-300",
  primary: "bg-black/5 text-black ring-black/20",
};

export function Badge({ value, tone }: { value: string; tone?: string }) {
  const t = tone ?? toneMap[value] ?? "muted";
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        badgeTones[t] || badgeTones.muted
      )}
    >
      {value}
    </span>
  );
}

/* ---------------- Form fields ---------------- */
export function Field({
  label,
  children,
  required,
  hint,
  error,
  className,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
}) {
  return (
    <label className={cx("block", className)}>
      <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-neutral-400">{hint}</span>
      ) : null}
    </label>
  );
}

const inputCls =
  "h-9 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 disabled:bg-neutral-100 disabled:text-neutral-400 transition-colors";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(inputCls, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cx(inputCls, "h-auto min-h-20 py-2", props.className)} />;
}

export function Select({
  options,
  placeholder,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: (string | { value: string; label: string })[];
  placeholder?: string;
}) {
  return (
    <select {...props} className={cx(inputCls, "cursor-pointer", props.className)}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) =>
        typeof o === "string" ? (
          <option key={o} value={o}>
            {o}
          </option>
        ) : (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        )
      )}
    </select>
  );
}

/* ---------------- Modal ---------------- */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  const sizes = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl", xl: "max-w-5xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4 animate-in fade-in duration-150">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div
        className={cx(
          "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-xl border border-neutral-200",
          sizes[size]
        )}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3.5">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-neutral-900">{title}</h3>
            {subtitle && <p className="truncate text-xs text-neutral-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-neutral-100 bg-neutral-50/70 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title = "Delete confirmation",
  message,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Delete
          </Button>
        </>
      }
    >
      <p className="text-sm text-neutral-600">{message}</p>
    </Modal>
  );
}

/* ---------------- Empty / loading ---------------- */
export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-neutral-100 text-neutral-400">
        <Inbox className="size-6" />
      </div>
      <p className="text-sm font-bold text-neutral-800">{title}</p>
      {message && <p className="max-w-sm text-xs text-neutral-500">{message}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading data…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-14 text-sm font-medium text-neutral-500">
      <Loader2 className="size-4 animate-spin text-neutral-700" /> {label}
    </div>
  );
}

/* ---------------- Toolbar ---------------- */
export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-b border-neutral-100 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3 sm:p-4 bg-neutral-50/50">
      {children}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cx("relative min-w-0 flex-1 sm:max-w-xs", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cx(inputCls, "pl-9")}
      />
    </div>
  );
}

/* ---------------- Data table ---------------- */
export type Column<T> = {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  mobileHidden?: boolean;
};

export function DataTable<T extends { id: string }>({
  rows,
  columns,
  empty,
  pageSize = 8,
  mobileCard,
  onRowClick,
}: {
  rows: T[];
  columns: Column<T>[];
  empty?: ReactNode;
  pageSize?: number;
  mobileCard?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [rows.length]);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a),
        bv = col.sortValue!(b);
      return (av > bv ? 1 : av < bv ? -1 : 0) * sort.dir;
    });
  }, [rows, sort, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages);
  const slice = sorted.slice((current - 1) * pageSize, current * pageSize);

  if (!rows.length)
    return (
      <>
        {empty ?? (
          <EmptyState title="No records found" message="Try adjusting your search query or filters." />
        )}
      </>
    );

  return (
    <div>
      {/* Mobile cards view */}
      {mobileCard && (
        <div className="divide-y divide-neutral-100 md:hidden">
          {slice.map((r) => (
            <div key={r.id} className="p-4" onClick={() => onRowClick?.(r)}>
              {mobileCard(r)}
            </div>
          ))}
        </div>
      )}
      <div className={cx("overflow-x-auto", mobileCard && "hidden md:block")}>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50/90">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cx(
                    "px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-neutral-500",
                    c.className
                  )}
                >
                  {c.sortValue ? (
                    <button
                      className="inline-flex items-center gap-1 font-bold hover:text-black"
                      onClick={() =>
                        setSort((s) =>
                          s?.key === c.key
                            ? { key: c.key, dir: s.dir === 1 ? -1 : 1 }
                            : { key: c.key, dir: 1 }
                        )
                      }
                    >
                      {c.header}
                      <span className="text-[10px]">
                        {sort?.key === c.key ? (sort.dir === 1 ? "▲" : "▼") : "⇅"}
                      </span>
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {slice.map((row) => (
              <tr
                key={row.id}
                className={cx(
                  "transition-colors hover:bg-neutral-50/70",
                  onRowClick && "cursor-pointer"
                )}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cx("px-4 py-3 align-middle", c.className)}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-2 border-t border-neutral-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between bg-neutral-50/30">
        <p className="text-xs text-neutral-500">
          Showing {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, sorted.length)} of{" "}
          {sorted.length}
        </p>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          {Array.from({ length: pages })
            .slice(0, 5)
            .map((_, i) => (
              <Button
                key={i}
                size="sm"
                variant={current === i + 1 ? "primary" : "outline"}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          {pages > 5 && <span className="px-1 text-xs text-neutral-400">… {pages}</span>}
          <Button
            size="sm"
            variant="outline"
            disabled={current === pages}
            onClick={() => setPage(current + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Misc ---------------- */
export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = (name || "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full bg-neutral-900 text-xs font-bold text-white shadow-xs select-none"
      style={{ width: size, height: size }}
    >
      {initials}
    </span>
  );
}

export function ProgressBar({
  value,
  tone = "primary",
}: {
  value: number;
  tone?: "primary" | "accent" | "success";
}) {
  const tones = { primary: "bg-black", accent: "bg-indigo-600", success: "bg-emerald-600" };
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
      <div
        className={cx("h-full rounded-full transition-all", tones[tone])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,120px)_minmax(0,1fr)] gap-3 py-2 text-sm border-b border-neutral-100 last:border-0">
      <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{label}</span>
      <span className="min-w-0 break-words font-medium text-neutral-900">{value || "—"}</span>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
      <div className="min-w-0">
        <h1 className="text-xl font-extrabold tracking-tight text-neutral-900 sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-xs text-neutral-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: string[];
  active: string;
  onChange: (t: string) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-neutral-200">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cx(
            "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors cursor-pointer",
            active === t
              ? "border-black text-black"
              : "border-transparent text-neutral-500 hover:text-neutral-900"
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
