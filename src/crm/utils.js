// Pure calculation & formatting helpers (no UI).

export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;
export const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

export const uid = (p = "id") =>
  `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDays(iso, days) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + Number(days || 0));
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

const inrFmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export const inr = (n) => inrFmt.format(round2(num(n)));

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fmtDate(iso) {
  if (!iso) return "—";
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return iso;
  return `${d} ${months[Number(m) - 1]} ${y}`;
}

// ---------- Line items & document totals ----------
export function lineCalc(it) {
  const gross = round2(num(it.qty) * num(it.rate));
  const discount = round2((gross * num(it.discount)) / 100);
  const taxable = round2(gross - discount);
  const tax = round2((taxable * num(it.taxRate)) / 100);
  return { gross, discount, taxable, tax, total: round2(taxable + tax) };
}

export function docTotals(items = [], additional = 0, treatment = "CGST_SGST") {
  let gross = 0, discount = 0, subtotal = 0, tax = 0;
  items.forEach((it) => {
    const c = lineCalc(it);
    gross += c.gross; discount += c.discount; subtotal += c.taxable; tax += c.tax;
  });
  gross = round2(gross); discount = round2(discount); subtotal = round2(subtotal); tax = round2(tax);
  const add = round2(num(additional));
  const igst = treatment === "IGST" ? tax : 0;
  const cgst = treatment === "IGST" ? 0 : round2(tax / 2);
  const sgst = treatment === "IGST" ? 0 : round2(tax - cgst);
  return { gross, discount, subtotal, tax, cgst, sgst, igst, additional: add, grand: round2(subtotal + tax + add) };
}

// ---------- Invoices ----------
export const invoicePaid = (inv) => round2((inv.payments || []).reduce((s, p) => s + num(p.amount), 0));

export function invoiceSummary(inv, today = todayISO()) {
  const t = docTotals(inv.items, inv.additionalCharges, inv.taxTreatment);
  const paid = invoicePaid(inv);
  const balance = round2(Math.max(t.grand - paid, 0));
  let status;
  if (inv.state === "Voided") status = "Voided";
  else if (inv.state === "Draft") status = "Draft";
  else if (balance <= 0) status = "Paid";
  else if (inv.dueDate && inv.dueDate < today) status = "Overdue";
  else if (paid > 0) status = "Partially Paid";
  else status = "Unpaid";
  return { ...t, paid, balance, status, valid: inv.state === "Finalized" };
}

export function projectSummary(project, invoices, today = todayISO()) {
  const linked = invoices.filter((i) => i.projectId === project.id);
  let invoiced = 0, paid = 0, outstanding = 0;
  linked.forEach((inv) => {
    const s = invoiceSummary(inv, today);
    if (!s.valid) return;
    invoiced += s.grand; paid += s.paid; outstanding += s.balance;
  });
  invoiced = round2(invoiced); paid = round2(paid); outstanding = round2(outstanding);
  return {
    count: linked.length,
    invoiced, paid, outstanding,
    uninvoiced: round2(Math.max(num(project.value) - invoiced, 0)),
  };
}

export function nextNumber(prefix, existing, pad = 4) {
  let max = 0;
  existing.forEach((n) => {
    if (typeof n === "string" && n.startsWith(prefix)) {
      const v = parseInt(n.slice(prefix.length).replace(/\D/g, ""), 10);
      if (Number.isFinite(v) && v > max) max = v;
    }
  });
  return prefix + String(max + 1).padStart(pad, "0");
}

export function nextCode(prefix, existing, start) {
  let max = start - 1;
  existing.forEach((c) => {
    const v = parseInt(String(c).replace(prefix, ""), 10);
    if (Number.isFinite(v) && v > max) max = v;
  });
  return `${prefix}${max + 1}`;
}

export const stockAvailable = (it) => round2(num(it.stock) - num(it.reserved));
export function stockStatus(it) {
  const a = stockAvailable(it);
  if (a <= 0) return "Out of Stock";
  if (a <= num(it.reorderLevel)) return "Low Stock";
  return "In Stock";
}

export const matches = (q, ...fields) => {
  if (!q) return true;
  const s = q.toLowerCase();
  return fields.some((f) => String(f ?? "").toLowerCase().includes(s));
};
