import { useMemo, useState } from "react";
import { useCRM, empName } from "../store";
import { INVOICE_STAGES, PAYMENT_METHODS, PROJECT_STATUSES } from "../data";
import { InvoiceDocument } from "../Documents";
import { LineItemsEditor, TotalsBox, blankItem, validateItems } from "../LineItems";
import {
  ConfirmDialog, DataTable, Field, Icon, Input, KV, Modal, PageHeader, Pill, SearchBox, Section, Select, StatCard, Textarea, Toolbar,
} from "../ui";
import { addDays, docTotals, fmtDate, inr, invoiceSummary, matches, nextCode, nextNumber, num, projectSummary, round2, todayISO, uid } from "../utils";

/* ---------------- Project form (create / edit) ---------------- */
export function ProjectFormModal({ open, onClose, initial, onSaved }) {
  const { data, update, toast } = useCRM();
  const [f, setF] = useState(null);
  const [err, setErr] = useState({});
  if (open && !f) {
    setF(initial || { name: "", customerName: "", companyName: "", phone: "", email: "", billingAddress: "", siteAddress: "", city: "", siteContact: "", startDate: todayISO(), status: "Planning", employeeId: data.settings.defaultEmployeeId, value: "", quotationId: "", leadId: "", notes: "" });
  }
  if (!open) { if (f) setF(null); return null; }
  if (!f) return null;
  const s = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = () => {
    const e = {};
    if (!f.name.trim()) e.name = "Project name is required";
    if (!f.customerName.trim()) e.customerName = "Customer name is required";
    if (!/^\d{10}$/.test(String(f.phone).trim())) e.phone = "Enter a 10-digit phone number";
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email";
    if (!(num(f.value) > 0)) e.value = "Project value must be greater than 0";
    if (!f.id && data.projects.some((p) => p.name.trim().toLowerCase() === f.name.trim().toLowerCase() && p.phone === f.phone)) e.name = "A project with this name and phone already exists";
    setErr(e);
    if (Object.keys(e).length) return;
    const rec = { ...f, value: round2(num(f.value)) };
    if (f.id) {
      update("projects", (ps) => ps.map((p) => (p.id === f.id ? rec : p)));
      toast("Project updated");
      onSaved?.(rec);
    } else {
      rec.id = uid("proj");
      rec.code = nextCode("P-", data.projects.map((p) => p.code), 2001);
      update("projects", (ps) => [...ps, rec]);
      if (rec.quotationId) update("quotations", (qs) => qs.map((q) => (q.id === rec.quotationId ? { ...q, projectId: rec.id } : q)));
      if (rec.leadId) update("leads", (ls) => ls.map((l) => (l.id === rec.leadId ? { ...l, status: "Converted", projectId: rec.id, history: [...l.history, { id: uid("h"), date: todayISO(), text: `Converted to project ${rec.code}`, type: "Note" }] } : l)));
      toast(`Project ${rec.code} created`);
      onSaved?.(rec);
    }
    onClose();
  };
  return (
    <Modal open title={f.id ? `Edit project ${f.code}` : "New project"} onClose={onClose} wide
      footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save}>Save project</button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Project name" required error={err.name}><Input value={f.name} onChange={s("name")} /></Field>
        <Field label="Customer name" required error={err.customerName}><Input value={f.customerName} onChange={s("customerName")} /></Field>
        <Field label="Company name"><Input value={f.companyName} onChange={s("companyName")} /></Field>
        <Field label="Phone" required error={err.phone}><Input value={f.phone} onChange={s("phone")} /></Field>
        <Field label="Email" error={err.email}><Input value={f.email} onChange={s("email")} /></Field>
        <Field label="City / location"><Input value={f.city} onChange={s("city")} /></Field>
        <Field label="Billing address" className="sm:col-span-2"><Textarea value={f.billingAddress} onChange={s("billingAddress")} /></Field>
        <Field label="Project site address" className="sm:col-span-2"><Textarea value={f.siteAddress} onChange={s("siteAddress")} /></Field>
        <Field label="Site contact"><Input value={f.siteContact} onChange={s("siteContact")} /></Field>
        <Field label="Start date"><Input type="date" value={f.startDate} onChange={s("startDate")} /></Field>
        <Field label="Contract value (₹)" required error={err.value}><Input type="number" min="0" value={f.value} onChange={s("value")} /></Field>
        <Field label="Status"><Select value={f.status} onChange={s("status")} options={PROJECT_STATUSES} /></Field>
        <Field label="Project manager"><Select value={f.employeeId} onChange={s("employeeId")} options={data.employees.map((e) => ({ value: e.id, label: e.name }))} /></Field>
        <Field label="Linked quotation">
          <Select value={f.quotationId} onChange={s("quotationId")} placeholder="None"
            options={data.quotations.filter((q) => !q.projectId || q.id === f.quotationId).map((q) => ({ value: q.id, label: `${q.number} · ${q.customerName}` }))} />
        </Field>
      </div>
    </Modal>
  );
}

/* ---------------- 9.1 Project-wise landing ---------------- */
export function TaxInvoices() {
  const { data, go, route } = useCRM();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [bal, setBal] = useState(route.params.filter || "");
  const [newOpen, setNewOpen] = useState(!!route.params.newProject);
  const rows = useMemo(() => data.projects.map((p) => ({
    ...p, ...projectSummary(p, data.invoices), qNumber: data.quotations.find((x) => x.id === p.quotationId)?.number || "—",
  })), [data]);
  const shown = rows.filter((r) => matches(q, r.code, r.name, r.customerName, r.phone, r.city, r.qNumber)
    && (!status || r.status === status)
    && (!bal || (bal === "outstanding" ? r.outstanding > 0 : bal === "none" ? r.count === 0 : r.outstanding === 0 && r.count > 0)));
  const tot = rows.reduce((a, r) => ({ inv: a.inv + r.invoiced, paid: a.paid + r.paid, out: a.out + r.outstanding }), { inv: 0, paid: 0, out: 0 });
  const cols = [
    { key: "code", label: "Project ID" },
    { key: "name", label: "Project Name", render: (r) => <span className="font-semibold">{r.name}</span> },
    { key: "customerName", label: "Customer" },
    { key: "phone", label: "Phone" },
    { key: "city", label: "Location" },
    { key: "startDate", label: "Start Date", render: (r) => fmtDate(r.startDate) },
    { key: "qNumber", label: "Quotation" },
    { key: "value", label: "Project Value", align: "right", render: (r) => inr(r.value) },
    { key: "invoiced", label: "Invoiced", align: "right", render: (r) => inr(r.invoiced) },
    { key: "paid", label: "Paid", align: "right", render: (r) => inr(r.paid) },
    { key: "outstanding", label: "Outstanding", align: "right", render: (r) => inr(r.outstanding) },
    { key: "count", label: "Invoices", align: "right" },
    { key: "status", label: "Status", render: (r) => <Pill>{r.status}</Pill> },
    { key: "actions", label: "Actions", sortable: false, render: (r) => <button className="btn btn-sm" onClick={() => go("project", { id: r.id })}>View Invoices</button> },
  ];
  return (
    <div>
      <PageHeader title="Tax Invoices — Projects" subtitle="Open a project to view or create its invoices.">
        <button className="btn" onClick={() => go("register")}>Invoice Register</button>
        <button className="btn btn-primary" onClick={() => setNewOpen(true)}><Icon name="plus" size={16} /> New Project</button>
      </PageHeader>
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Projects" value={rows.length} onClick={() => { setBal(""); setStatus(""); }} />
        <StatCard label="Total Invoiced" value={inr(tot.inv)} onClick={() => go("register")} />
        <StatCard label="Total Received" value={inr(tot.paid)} onClick={() => go("register", { status: "Paid" })} />
        <StatCard label="Total Outstanding" value={inr(tot.out)} onClick={() => setBal("outstanding")} />
      </div>
      <Toolbar>
        <SearchBox value={q} onChange={setQ} placeholder="Search project, customer, phone, quotation…" />
        <Field label="Project status"><Select value={status} onChange={(e) => setStatus(e.target.value)} placeholder="All" options={PROJECT_STATUSES} /></Field>
        <Field label="Balance"><Select value={bal} onChange={(e) => setBal(e.target.value)} placeholder="All" options={[{ value: "outstanding", label: "Has outstanding" }, { value: "settled", label: "Fully settled" }, { value: "none", label: "No invoices yet" }]} /></Field>
      </Toolbar>
      <DataTable columns={cols} rows={shown} onRowClick={(r) => go("project", { id: r.id })} empty="No projects match your filters." />
      <ProjectFormModal open={newOpen} onClose={() => setNewOpen(false)} onSaved={(p) => go("project", { id: p.id })} />
    </div>
  );
}

/* ---------------- 9.2 Project workspace ---------------- */
export function ProjectWorkspace() {
  const { data, go, route, update, toast } = useCRM();
  const p = data.projects.find((x) => x.id === route.params.id);
  const [edit, setEdit] = useState(false);
  const [payFor, setPayFor] = useState(null);
  const [voidFor, setVoidFor] = useState(null);
  if (!p) return <Missing what="Project" back={() => go("invoices")} />;
  const s = projectSummary(p, data.invoices);
  const qt = data.quotations.find((x) => x.id === p.quotationId);
  const invs = data.invoices.filter((i) => i.projectId === p.id).map((i) => ({ ...i, s: invoiceSummary(i) }));
  const duplicate = (inv) => {
    const id = uid("inv");
    const copy = { ...inv, id, s: undefined, number: "", state: "Draft", payments: [], voidReason: "", date: todayISO(), dueDate: addDays(todayISO(), data.settings.dueDays), items: inv.items.map((it) => ({ ...it, id: uid("li") })), history: [{ id: uid("h"), date: todayISO(), text: `Draft duplicated from ${inv.number}` }] };
    delete copy.s;
    copy.number = nextNumber(data.settings.invoicePrefix, data.invoices.map((i) => i.number));
    update("invoices", (xs) => [...xs, copy]);
    toast(`Draft ${copy.number} created`);
    go("invoiceForm", { id });
  };
  const cols = [
    { key: "number", label: "Invoice No.", render: (r) => <span className="font-semibold">{r.number}</span> },
    { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
    { key: "stage", label: "Stage" },
    { key: "dueDate", label: "Due Date", render: (r) => fmtDate(r.dueDate) },
    { key: "sub", label: "Subtotal", align: "right", sortValue: (r) => r.s.subtotal, render: (r) => inr(r.s.subtotal) },
    { key: "tax", label: "Tax", align: "right", sortValue: (r) => r.s.tax, render: (r) => inr(r.s.tax) },
    { key: "grand", label: "Grand Total", align: "right", sortValue: (r) => r.s.grand, render: (r) => inr(r.s.grand) },
    { key: "paid", label: "Paid", align: "right", sortValue: (r) => r.s.paid, render: (r) => inr(r.s.paid) },
    { key: "bal", label: "Balance", align: "right", sortValue: (r) => r.s.balance, render: (r) => inr(r.s.balance) },
    { key: "st", label: "Status", sortValue: (r) => r.s.status, render: (r) => <Pill>{r.s.status}</Pill> },
    { key: "actions", label: "Actions", sortable: false, render: (r) => (
      <div className="flex flex-wrap gap-1">
        <button className="btn btn-sm" onClick={() => go("invoice", { id: r.id })}>View</button>
        {r.state === "Draft" && <button className="btn btn-sm" onClick={() => go("invoiceForm", { id: r.id })}>Edit Draft</button>}
        {r.state === "Finalized" && r.s.balance > 0 && <button className="btn btn-sm" onClick={() => setPayFor(r)}>Record Payment</button>}
        <button className="btn btn-sm" onClick={() => go("invoice", { id: r.id, print: true })}>Print</button>
        <button className="btn btn-sm" onClick={() => duplicate(r)}>Duplicate as Draft</button>
        {r.state !== "Voided" && <button className="btn btn-sm" onClick={() => setVoidFor(r)}>{r.state === "Draft" ? "Cancel" : "Void"}</button>}
      </div>
    ) },
  ];
  return (
    <div className="space-y-4">
      <PageHeader title={`${p.code} · ${p.name}`} subtitle={`${p.customerName}${p.companyName ? ` · ${p.companyName}` : ""}`} onBack={() => go("invoices")}>
        <button className="btn" onClick={() => setEdit(true)}>Edit Project</button>
        {qt && <button className="btn" onClick={() => go("quotation", { id: qt.id })}>View Quotation</button>}
      </PageHeader>
      <Section title="Project details">
        <KV items={[
          ["Project ID", p.code], ["Project Name", p.name], ["Customer", p.customerName],
          ["Phone", p.phone], ["Email", p.email], ["Status", <Pill key="s">{p.status}</Pill>],
          ["Project Site Address", p.siteAddress], ["Billing Address", p.billingAddress],
          ["Linked Quotation", qt?.number], ["Project Value", inr(p.value)], ["Project Manager", empName(data, p.employeeId)], ["Start Date", fmtDate(p.startDate)],
        ]} />
      </Section>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Contract Value" value={inr(p.value)} />
        <StatCard label="Total Invoiced" value={inr(s.invoiced)} />
        <StatCard label="Total Paid" value={inr(s.paid)} />
        <StatCard label="Outstanding" value={inr(s.outstanding)} />
        <StatCard label="Remaining Uninvoiced" value={inr(s.uninvoiced)} />
      </div>
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold">Invoices for {p.name}</h2>
          <button className="btn btn-primary" onClick={() => go("invoiceForm", { projectId: p.id })}><Icon name="plus" size={16} /> Create New Invoice</button>
        </div>
        <DataTable columns={cols} rows={invs} onRowClick={(r) => go("invoice", { id: r.id })} initialSort={{ key: "date", dir: "asc" }}
          empty="No invoices yet for this project. Use “+ Create New Invoice” to raise the first one." />
        <p className="mt-2 text-xs">Totals include finalized invoices only. Drafts and voided invoices are excluded.</p>
      </div>
      <ProjectFormModal open={edit} initial={p} onClose={() => setEdit(false)} />
      <PaymentModal inv={payFor} onClose={() => setPayFor(null)} />
      <VoidDialog inv={voidFor} onClose={() => setVoidFor(null)} />
    </div>
  );
}

function Missing({ what, back }) {
  return <div className="card p-10 text-center"><p className="mb-3 font-semibold">{what} not found. It may have been deleted.</p><button className="btn" onClick={back}>Go back</button></div>;
}

/* ---------------- Payment ---------------- */
export function PaymentModal({ inv, onClose }) {
  const { update, toast } = useCRM();
  const [f, setF] = useState(null);
  const [err, setErr] = useState({});
  const [confirm, setConfirm] = useState(false);
  if (!inv) { if (f) setF(null); return null; }
  const s = invoiceSummary(inv);
  if (!f) { setF({ date: todayISO(), amount: s.balance, method: "Bank Transfer", ref: "", notes: "" }); return null; }
  const check = () => {
    const e = {};
    const a = round2(num(f.amount));
    if (!(a > 0)) e.amount = "Amount must be greater than 0";
    else if (a > s.balance) e.amount = `Amount cannot exceed balance due (${inr(s.balance)})`;
    if (!f.date) e.date = "Payment date is required";
    else if (f.date < inv.date) e.date = "Payment date cannot be before the invoice date";
    if (f.method !== "Cash" && !f.ref.trim()) e.ref = "Transaction reference is required for non-cash payments";
    setErr(e);
    if (!Object.keys(e).length) setConfirm(true);
  };
  const save = () => {
    const a = round2(num(f.amount));
    const payment = { id: uid("pay"), ...f, amount: a };
    update("invoices", (xs) => xs.map((x) => (x.id === inv.id ? { ...x, payments: [...x.payments, payment], history: [...x.history, { id: uid("h"), date: todayISO(), text: `Payment of ${inr(a)} recorded (${f.method})` }] } : x)));
    toast(`Payment of ${inr(a)} recorded against ${inv.number}`);
    setConfirm(false); setF(null); onClose();
  };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <>
      <Modal open={!confirm} title={`Record payment · ${inv.number}`} onClose={() => { setF(null); onClose(); }}
        footer={<><button className="btn" onClick={() => { setF(null); onClose(); }}>Cancel</button><button className="btn btn-primary" onClick={check}>Record payment</button></>}>
        <div className="mb-3 grid grid-cols-3 gap-2 text-sm">
          <div><div className="font-semibold">Grand total</div>{inr(s.grand)}</div>
          <div><div className="font-semibold">Paid so far</div>{inr(s.paid)}</div>
          <div><div className="font-semibold">Balance due</div>{inr(s.balance)}</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Payment date" required error={err.date}><Input type="date" value={f.date} onChange={set("date")} /></Field>
          <Field label="Amount (₹)" required error={err.amount}><Input type="number" min="0" step="0.01" value={f.amount} onChange={set("amount")} /></Field>
          <Field label="Payment method"><Select value={f.method} onChange={set("method")} options={PAYMENT_METHODS} /></Field>
          <Field label="Transaction reference" error={err.ref}><Input value={f.ref} onChange={set("ref")} placeholder="UTR / cheque no." /></Field>
          <Field label="Notes" className="sm:col-span-2"><Textarea value={f.notes} onChange={set("notes")} /></Field>
        </div>
      </Modal>
      <ConfirmDialog open={confirm} title="Confirm payment" confirmLabel="Yes, record payment" onCancel={() => setConfirm(false)} onConfirm={save}
        message={`Record ${inr(f.amount)} via ${f.method} against ${inv.number}? Remaining balance will be ${inr(round2(s.balance - num(f.amount)))}.`} />
    </>
  );
}

function VoidDialog({ inv, onClose }) {
  const { update, toast } = useCRM();
  const [reason, setReason] = useState("");
  if (!inv) return null;
  const hasPay = inv.payments.length > 0;
  const isDraft = inv.state === "Draft";
  const doIt = () => {
    update("invoices", (xs) => xs.map((x) => (x.id === inv.id ? { ...x, state: "Voided", voidReason: reason, history: [...x.history, { id: uid("h"), date: todayISO(), text: `${isDraft ? "Draft cancelled" : "Invoice voided"}: ${reason}` }] } : x)));
    toast(`${inv.number} ${isDraft ? "cancelled" : "voided"}`);
    setReason(""); onClose();
  };
  return (
    <ConfirmDialog open title={isDraft ? `Cancel draft ${inv.number}` : `Void invoice ${inv.number}`} confirmLabel={isDraft ? "Cancel draft" : "Void invoice"}
      onCancel={() => { setReason(""); onClose(); }} onConfirm={doIt} disabled={hasPay || reason.trim().length < 5}
      message={hasPay
        ? "This invoice has payments recorded against it and cannot be voided. Issue a credit or adjustment instead."
        : "The invoice number stays reserved and the record is kept for audit. It will no longer count towards project totals. This cannot be undone."}>
      {!hasPay && <Field label="Reason (min. 5 characters)" required><Textarea value={reason} onChange={(e) => setReason(e.target.value)} /></Field>}
    </ConfirmDialog>
  );
}

/* ---------------- 9.3–9.6 Invoice editor ---------------- */
export function InvoiceForm() {
  const { data, go, route, update, toast } = useCRM();
  const existing = route.params.id ? data.invoices.find((i) => i.id === route.params.id) : null;
  const projectId = existing?.projectId || route.params.projectId;
  const p = data.projects.find((x) => x.id === projectId);
  const st = data.settings;
  const [f, setF] = useState(() => existing ? { ...existing, items: existing.items.map((x) => ({ ...x })) } : {
    number: nextNumber(st.invoicePrefix, data.invoices.map((i) => i.number)),
    date: todayISO(), dueDate: addDays(todayISO(), st.dueDays), stage: INVOICE_STAGES[0], customStage: "",
    reference: "", preparedBy: st.defaultEmployeeId, taxTreatment: st.taxTreatment, buyerGstin: "", siteContact: p?.siteContact || "",
    items: [blankItem(st.defaultTaxRate)], additionalCharges: 0, notes: "",
  });
  const [stageMode, setStageMode] = useState(existing && !INVOICE_STAGES.includes(existing.stage) ? "custom" : "list");
  const [err, setErr] = useState({});
  const [confirmFin, setConfirmFin] = useState(false);
  if (!p) return <Missing what="Project" back={() => go("invoices")} />;
  if (existing && existing.state !== "Draft") {
    return <div className="card p-10 text-center"><p className="mb-3 font-semibold">{existing.number} is {existing.state.toLowerCase()} and can no longer be edited.</p><button className="btn" onClick={() => go("invoice", { id: existing.id })}>View invoice</button></div>;
  }
  const t = docTotals(f.items, f.additionalCharges, f.taxTreatment);
  const s = projectSummary(p, data.invoices);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const stage = stageMode === "custom" ? f.customStage : f.stage;
  const validate = () => {
    const e = {};
    const n = f.number.trim();
    if (!n) e.number = "Invoice number is required";
    else if (data.invoices.some((i) => i.id !== existing?.id && i.number.trim().toLowerCase() === n.toLowerCase())) e.number = "This invoice number is already used";
    if (!f.date) e.date = "Invoice date is required";
    if (!f.dueDate) e.dueDate = "Due date is required";
    else if (f.date && f.dueDate < f.date) e.dueDate = "Due date cannot be before the invoice date";
    if (!stage.trim()) e.stage = "Invoice stage is required";
    if (num(f.additionalCharges) < 0) e.additionalCharges = "Cannot be negative";
    const li = validateItems(f.items);
    if (li) e.items = li;
    else if (!(t.grand > 0)) e.items = "Invoice total must be greater than ₹0";
    setErr(e);
    return !Object.keys(e).length;
  };
  const persist = (state) => {
    const today = todayISO();
    const rec = {
      ...f, stage, number: f.number.trim(), additionalCharges: round2(num(f.additionalCharges)), projectId: p.id, quotationId: p.quotationId,
      state, id: existing?.id || uid("inv"), payments: existing?.payments || [], voidReason: "",
      history: [...(existing?.history || []), { id: uid("h"), date: today, text: state === "Draft" ? (existing ? "Draft updated" : "Draft created") : "Invoice finalized" }],
    };
    delete rec.customStage;
    update("invoices", (xs) => (existing ? xs.map((x) => (x.id === rec.id ? rec : x)) : [...xs, rec]));
    toast(state === "Draft" ? `Draft ${rec.number} saved` : `Invoice ${rec.number} finalized`);
    go("invoice", { id: rec.id });
  };
  const overContract = round2(s.uninvoiced - (existing?.state === "Finalized" ? 0 : t.grand)) < 0;
  return (
    <div className="space-y-4">
      <PageHeader title={existing ? `Edit draft ${existing.number}` : "Create New Invoice"} subtitle={`${p.code} · ${p.name}`} onBack={() => go("project", { id: p.id })}>
        <button className="btn" onClick={() => go("project", { id: p.id })}>Cancel</button>
        <button className="btn" onClick={() => validate() && persist("Draft")}>Save as Draft</button>
        <button className="btn btn-primary" onClick={() => validate() && setConfirmFin(true)}>Finalize Invoice</button>
      </PageHeader>
      {Object.keys(err).length > 0 && <div className="card p-3 text-sm font-semibold">⚠ Please fix the highlighted fields before saving.</div>}
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Bill To (from project)">
          <KV items={[["Customer / Company", p.companyName || p.customerName], ["Phone", p.phone], ["Email", p.email], ["Billing Address", p.billingAddress]]} />
          <Field label="Buyer GSTIN (if supplied)" className="mt-3"><Input value={f.buyerGstin} onChange={set("buyerGstin")} /></Field>
        </Section>
        <Section title="Ship To / Project Site">
          <KV items={[["Project ID", p.code], ["Project", p.name], ["Site Address", p.siteAddress], ["Linked Quotation", data.quotations.find((q) => q.id === p.quotationId)?.number]]} />
          <Field label="Site contact" className="mt-3"><Input value={f.siteContact} onChange={set("siteContact")} /></Field>
        </Section>
      </div>
      <Section title="Invoice details">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Invoice number" required error={err.number}><Input value={f.number} onChange={set("number")} /></Field>
          <Field label="Invoice date" required error={err.date}><Input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value, dueDate: existing ? f.dueDate : addDays(e.target.value, st.dueDays) })} /></Field>
          <Field label="Due date" required error={err.dueDate}><Input type="date" value={f.dueDate} onChange={set("dueDate")} /></Field>
          <Field label="Invoice stage" required error={err.stage}>
            <Select value={stageMode === "custom" ? "__custom" : f.stage} onChange={(e) => (e.target.value === "__custom" ? setStageMode("custom") : (setStageMode("list"), setF({ ...f, stage: e.target.value })))}
              options={[...INVOICE_STAGES, { value: "__custom", label: "Custom…" }]} />
            {stageMode === "custom" && <Input className="mt-2" placeholder="Custom stage name" value={f.customStage || ""} onChange={set("customStage")} />}
          </Field>
          <Field label="Reference number"><Input value={f.reference} onChange={set("reference")} /></Field>
          <Field label="Prepared by"><Select value={f.preparedBy} onChange={set("preparedBy")} options={data.employees.map((e) => ({ value: e.id, label: e.name }))} /></Field>
          <Field label="Tax treatment"><Select value={f.taxTreatment} onChange={set("taxTreatment")} options={[{ value: "CGST_SGST", label: "CGST + SGST (intra-state)" }, { value: "IGST", label: "IGST (inter-state)" }]} /></Field>
          <Field label="Additional charges (₹)" error={err.additionalCharges}><Input type="number" min="0" value={f.additionalCharges} onChange={set("additionalCharges")} /></Field>
        </div>
      </Section>
      <Section title="Line items">
        <LineItemsEditor items={f.items} onChange={(items) => setF({ ...f, items })} taxRates={st.taxRates} defaultTaxRate={st.defaultTaxRate} showType={false} error={err.items} />
        <div className="mt-4 flex flex-col gap-4 md:flex-row">
          <Field label="Notes" className="flex-1"><Textarea value={f.notes} onChange={set("notes")} /></Field>
          <TotalsBox t={t} treatment={f.taxTreatment} />
        </div>
        <div className="mt-3 text-sm">Contract value {inr(p.value)} · Already invoiced {inr(s.invoiced)} · Remaining {inr(s.uninvoiced)}
          {overContract && <span className="ml-2 font-semibold">⚠ This invoice takes the total above the contract value.</span>}</div>
      </Section>
      <ConfirmDialog open={confirmFin} title="Finalize invoice?" confirmLabel="Finalize" onCancel={() => setConfirmFin(false)} onConfirm={() => persist("Finalized")}
        message={`Once finalized, ${f.number} for ${inr(t.grand)} cannot be edited. Only payments can be recorded or the invoice voided.${overContract ? " Note: this exceeds the remaining contract value." : ""}`} />
    </div>
  );
}

/* ---------------- Invoice details ---------------- */
export function InvoiceDetails() {
  const { data, go, route, update, toast } = useCRM();
  const inv = data.invoices.find((i) => i.id === route.params.id);
  const [payOpen, setPayOpen] = useState(false);
  const [voidOpen, setVoidOpen] = useState(false);
  const [fin, setFin] = useState(false);
  const [delPay, setDelPay] = useState(null);
  const [printed, setPrinted] = useState(false);
  if (!inv) return <Missing what="Invoice" back={() => go("register")} />;
  const p = data.projects.find((x) => x.id === inv.projectId);
  if (!p) return <Missing what="Linked project" back={() => go("register")} />;
  const s = invoiceSummary(inv);
  const qt = data.quotations.find((x) => x.id === inv.quotationId);
  if (route.params.print && !printed) { setPrinted(true); setTimeout(() => window.print(), 300); }
  const finalize = () => {
    const err = validateItems(inv.items) || (data.invoices.some((i) => i.id !== inv.id && i.number === inv.number) ? "Duplicate invoice number" : "");
    if (err) { toast(`Cannot finalize: ${err}`); setFin(false); return; }
    update("invoices", (xs) => xs.map((x) => (x.id === inv.id ? { ...x, state: "Finalized", history: [...x.history, { id: uid("h"), date: todayISO(), text: "Invoice finalized" }] } : x)));
    toast(`${inv.number} finalized`); setFin(false);
  };
  const removePay = () => {
    update("invoices", (xs) => xs.map((x) => (x.id === inv.id ? { ...x, payments: x.payments.filter((y) => y.id !== delPay.id), history: [...x.history, { id: uid("h"), date: todayISO(), text: `Payment ${inr(delPay.amount)} reversed` }] } : x)));
    toast("Payment reversed"); setDelPay(null);
  };
  return (
    <div className="space-y-4">
      <PageHeader title={`Invoice ${inv.number}`} subtitle={`${p.code} · ${p.name} · ${inv.stage}`} onBack={() => go("project", { id: p.id })}>
        <button className="btn" onClick={() => go("project", { id: p.id })}>Project workspace</button>
        {inv.state === "Draft" && <button className="btn" onClick={() => go("invoiceForm", { id: inv.id })}>Edit Draft</button>}
        {inv.state === "Draft" && <button className="btn btn-primary" onClick={() => setFin(true)}>Finalize</button>}
        {inv.state === "Finalized" && s.balance > 0 && <button className="btn btn-primary" onClick={() => setPayOpen(true)}>Record Payment</button>}
        <button className="btn" onClick={() => window.print()}><Icon name="print" size={16} /> Print Invoice</button>
        {inv.state !== "Voided" && <button className="btn" onClick={() => setVoidOpen(true)}>{inv.state === "Draft" ? "Cancel Draft" : "Void"}</button>}
      </PageHeader>
      <div className="grid grid-cols-2 gap-3 no-print lg:grid-cols-5">
        <StatCard label="Status" value={s.status} />
        <StatCard label="Grand Total" value={inr(s.grand)} />
        <StatCard label="Amount Paid" value={inr(s.paid)} />
        <StatCard label="Balance Due" value={inr(s.balance)} />
        <StatCard label="Due Date" value={fmtDate(inv.dueDate)} />
      </div>
      {inv.state === "Voided" && <div className="card p-3 text-sm no-print"><b>Voided.</b> Reason: {inv.voidReason || "—"}</div>}
      <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <div className="overflow-x-auto"><InvoiceDocument inv={inv} project={p} quotation={qt} settings={data.settings} employees={data.employees} /></div>
        <div className="space-y-4 no-print">
          <Section title="Payment history">
            {inv.payments.length === 0 ? <p className="text-sm">No payments recorded yet.</p> : (
              <ul className="space-y-2 text-sm">
                {inv.payments.map((y) => (
                  <li key={y.id} className="rounded-md border border-border p-2">
                    <div className="flex justify-between font-semibold"><span>{inr(y.amount)}</span><span>{fmtDate(y.date)}</span></div>
                    <div>{y.method} · Ref: {y.ref || "—"}</div>
                    {y.notes && <div>{y.notes}</div>}
                    <div className="mt-1 flex justify-between text-xs"><span>ID: {y.id}</span>{inv.state === "Finalized" && <button className="underline" onClick={() => setDelPay(y)}>Reverse</button>}</div>
                  </li>
                ))}
              </ul>
            )}
          </Section>
          <Section title="Invoice history">
            <ul className="space-y-1 text-sm">{inv.history.map((h) => <li key={h.id}><b>{fmtDate(h.date)}</b> — {h.text}</li>)}</ul>
          </Section>
        </div>
      </div>
      <PaymentModal inv={payOpen ? inv : null} onClose={() => setPayOpen(false)} />
      <VoidDialog inv={voidOpen ? inv : null} onClose={() => setVoidOpen(false)} />
      <ConfirmDialog open={fin} title="Finalize invoice?" confirmLabel="Finalize" onCancel={() => setFin(false)} onConfirm={finalize}
        message={`After finalizing, ${inv.number} (${inr(s.grand)}) can no longer be edited.`} />
      <ConfirmDialog open={!!delPay} title="Reverse payment?" confirmLabel="Reverse payment" onCancel={() => setDelPay(null)} onConfirm={removePay}
        message={delPay ? `Remove the ${inr(delPay.amount)} payment dated ${fmtDate(delPay.date)}? The balance will increase accordingly.` : ""} />
    </div>
  );
}

/* ---------------- 9.9 Register ---------------- */
export function InvoiceRegister() {
  const { data, go, route } = useCRM();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(route.params.status || "");
  const [proj, setProj] = useState("");
  const rows = data.invoices.map((i) => {
    const p = data.projects.find((x) => x.id === i.projectId);
    return { ...i, s: invoiceSummary(i), pName: p?.name || "—", pCode: p?.code || "", customer: p?.customerName || "—" };
  }).filter((r) => matches(q, r.number, r.pName, r.pCode, r.customer, r.stage) && (!status || (status === "Pending" ? ["Unpaid", "Partially Paid", "Overdue"].includes(r.s.status) : r.s.status === status)) && (!proj || r.projectId === proj));
  const cols = [
    { key: "number", label: "Invoice No.", render: (r) => <span className="font-semibold">{r.number}</span> },
    { key: "pName", label: "Project", render: (r) => <button className="underline" onClick={(e) => { e.stopPropagation(); go("project", { id: r.projectId }); }}>{r.pCode} · {r.pName}</button> },
    { key: "customer", label: "Customer" },
    { key: "stage", label: "Stage" },
    { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
    { key: "grand", label: "Grand Total", align: "right", sortValue: (r) => r.s.grand, render: (r) => inr(r.s.grand) },
    { key: "paid", label: "Paid", align: "right", sortValue: (r) => r.s.paid, render: (r) => inr(r.s.paid) },
    { key: "bal", label: "Balance Due", align: "right", sortValue: (r) => r.s.balance, render: (r) => inr(r.s.balance) },
    { key: "st", label: "Status", sortValue: (r) => r.s.status, render: (r) => <Pill>{r.s.status}</Pill> },
  ];
  return (
    <div>
      <PageHeader title="Invoice Register" subtitle="All invoices across projects. New invoices are created from a project." onBack={() => go("invoices")} />
      <Toolbar>
        <SearchBox value={q} onChange={setQ} placeholder="Search invoice no., project, customer…" />
        <Field label="Payment status"><Select value={status} onChange={(e) => setStatus(e.target.value)} placeholder="All" options={["Draft", "Unpaid", "Partially Paid", "Paid", "Overdue", "Voided", "Pending"]} /></Field>
        <Field label="Project"><Select value={proj} onChange={(e) => setProj(e.target.value)} placeholder="All" options={data.projects.map((p) => ({ value: p.id, label: `${p.code} · ${p.name}` }))} /></Field>
      </Toolbar>
      <DataTable columns={cols} rows={rows} onRowClick={(r) => go("invoice", { id: r.id })} initialSort={{ key: "date", dir: "desc" }} />
    </div>
  );
}
