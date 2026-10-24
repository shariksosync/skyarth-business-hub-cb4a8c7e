import { useMemo, useState, useEffect } from "react";
import { useCRM, empName } from "../store";
import { INVOICE_STAGES, PAYMENT_METHODS, PROJECT_STATUSES } from "../data";
import { InvoiceDocument, ReceiptDocument } from "../Documents";
import { LineItemsEditor, TotalsBox, blankItem, validateItems } from "../LineItems";
import {
  ConfirmDialog,
  DataTable,
  Field,
  Icon,
  Input,
  KV,
  Modal,
  PageHeader,
  Pill,
  SearchBox,
  Section,
  Select,
  StatCard,
  Textarea,
  Toolbar,
} from "../ui";
import {
  addDays,
  docTotals,
  fmtDate,
  inr,
  inrWords,
  invoiceSummary,
  matches,
  nextCode,
  nextNumber,
  num,
  projectSummary,
  round2,
  todayISO,
  uid,
} from "../utils";

/* ---------------- Project form (create / edit) ---------------- */
export function ProjectFormModal({ open, onClose, initial, onSaved }) {
  const { data, update, toast } = useCRM();
  const [f, setF] = useState(null);
  const [err, setErr] = useState({});
  if (open && !f) {
    setF(
      initial || {
        name: "",
        customerName: "",
        companyName: "",
        phone: "",
        email: "",
        billingAddress: "",
        siteAddress: "",
        city: "",
        siteContact: "",
        startDate: todayISO(),
        status: "Planning",
        employeeId: data.settings.defaultEmployeeId,
        value: "",
        quotationId: "",
        leadId: "",
        workOrderNo: "",
        workOrderDate: todayISO(),
        targetCompletionDate: "",
        notes: "",
      }
    );
  }
  if (!open) {
    if (f) setF(null);
    return null;
  }
  if (!f) return null;
  const s = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = () => {
    const e = {};
    if (!f.name.trim()) e.name = "Project name is required";
    if (!f.customerName.trim()) e.customerName = "Customer name is required";
    if (!/^\d{10}$/.test(String(f.phone).trim())) e.phone = "Enter a 10-digit phone number";
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email";
    if (!(num(f.value) > 0)) e.value = "Project value must be greater than 0";
    if (
      !f.id &&
      data.projects.some(
        (p) => p.name.trim().toLowerCase() === f.name.trim().toLowerCase() && p.phone === f.phone
      )
    ) {
      e.name = "A project with this name and phone already exists";
    }
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
      if (rec.quotationId) {
        update("quotations", (qs) =>
          qs.map((q) => (q.id === rec.quotationId ? { ...q, projectId: rec.id } : q))
        );
      }
      if (rec.leadId) {
        update("leads", (ls) =>
          ls.map((l) =>
            l.id === rec.leadId
              ? {
                  ...l,
                  status: "Converted",
                  projectId: rec.id,
                  history: [
                    ...l.history,
                    {
                      id: uid("h"),
                      date: todayISO(),
                      text: `Converted to project ${rec.code}`,
                      type: "Note",
                    },
                  ],
                }
              : l
          )
        );
      }
      toast(`Project ${rec.code} created`);
      onSaved?.(rec);
    }
    onClose();
  };
  return (
    <Modal
      open
      title={f.id ? `Edit project ${f.code}` : "New project"}
      onClose={onClose}
      wide
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save}>
            Save project
          </button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Project name" required error={err.name}>
          <Input value={f.name} onChange={s("name")} />
        </Field>
        <Field label="Customer name" required error={err.customerName}>
          <Input value={f.customerName} onChange={s("customerName")} />
        </Field>
        <Field label="Company name">
          <Input value={f.companyName} onChange={s("companyName")} />
        </Field>
        <Field label="Phone" required error={err.phone}>
          <Input value={f.phone} onChange={s("phone")} />
        </Field>
        <Field label="Email" error={err.email}>
          <Input value={f.email} onChange={s("email")} />
        </Field>
        <Field label="City / location">
          <Input value={f.city} onChange={s("city")} />
        </Field>
        <Field label="Billing address" className="sm:col-span-2">
          <Textarea value={f.billingAddress} onChange={s("billingAddress")} />
        </Field>
        <Field label="Project site address" className="sm:col-span-2">
          <Textarea value={f.siteAddress} onChange={s("siteAddress")} />
        </Field>
        <Field label="Site contact">
          <Input value={f.siteContact} onChange={s("siteContact")} />
        </Field>
        <Field label="Start date">
          <Input type="date" value={f.startDate} onChange={s("startDate")} />
        </Field>
        <Field label="Client Work Order No.">
          <Input placeholder="e.g. WO/GV/2026/0118" value={f.workOrderNo || ""} onChange={s("workOrderNo")} />
        </Field>
        <Field label="Work Order Date">
          <Input type="date" value={f.workOrderDate || ""} onChange={s("workOrderDate")} />
        </Field>
        <Field label="Target Completion Date">
          <Input type="date" value={f.targetCompletionDate || ""} onChange={s("targetCompletionDate")} />
        </Field>
        <Field label="Contract value (₹)" required error={err.value}>
          <Input type="number" min="0" value={f.value} onChange={s("value")} />
        </Field>
        <Field label="Status">
          <Select value={f.status} onChange={s("status")} options={PROJECT_STATUSES} />
        </Field>
        <Field label="Project manager">
          <Select
            value={f.employeeId}
            onChange={s("employeeId")}
            options={data.employees.map((e) => ({ value: e.id, label: e.name }))}
          />
        </Field>
        <Field label="Linked quotation">
          <Select
            value={f.quotationId}
            onChange={s("quotationId")}
            placeholder="None"
            options={data.quotations
              .filter((q) => !q.projectId || q.id === f.quotationId)
              .map((q) => ({ value: q.id, label: `${q.number} · ${q.customerName}` }))}
          />
        </Field>
      </div>
    </Modal>
  );
}

/* ---------------- 9.1 Main Billing & Invoices Landing with Tabs ---------------- */
export function TaxInvoices() {
  const { data, go, route } = useCRM();
  const [activeTab, setActiveTab] = useState(route.params.tab || "projects");

  // Project Tab State
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [bal, setBal] = useState(route.params.filter || "");
  const [newOpen, setNewOpen] = useState(!!route.params.newProject);

  // Quick Issue Receipt modal
  const [issueReceiptOpen, setIssueReceiptOpen] = useState(false);

  const rows = useMemo(
    () =>
      data.projects.map((p) => ({
        ...p,
        ...projectSummary(p, data.invoices),
        qNumber: data.quotations.find((x) => x.id === p.quotationId)?.number || "—",
      })),
    [data]
  );

  const shown = rows.filter(
    (r) =>
      matches(q, r.code, r.name, r.customerName, r.phone, r.city, r.qNumber) &&
      (!status || r.status === status) &&
      (!bal ||
        (bal === "outstanding"
          ? r.outstanding > 0
          : bal === "none"
            ? r.count === 0
            : r.outstanding === 0 && r.count > 0))
  );

  const tot = rows.reduce(
    (a, r) => ({ inv: a.inv + r.invoiced, paid: a.paid + r.paid, out: a.out + r.outstanding }),
    { inv: 0, paid: 0, out: 0 }
  );

  const cols = [
    { key: "code", label: "Project ID" },
    {
      key: "name",
      label: "Project Name",
      render: (r) => <span className="font-semibold">{r.name}</span>,
    },
    { key: "customerName", label: "Customer" },
    { key: "phone", label: "Phone" },
    { key: "city", label: "Location" },
    { key: "startDate", label: "Start Date", render: (r) => fmtDate(r.startDate) },
    { key: "qNumber", label: "Quotation" },
    { key: "value", label: "Contract Value", align: "right", render: (r) => inr(r.value) },
    { key: "invoiced", label: "Invoiced", align: "right", render: (r) => inr(r.invoiced) },
    { key: "paid", label: "Total Paid", align: "right", render: (r) => inr(r.paid) },
    { key: "outstanding", label: "Outstanding", align: "right", render: (r) => inr(r.outstanding) },
    { key: "count", label: "Invoices", align: "right" },
    { key: "status", label: "Status", render: (r) => <Pill>{r.status}</Pill> },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (r) => (
        <button className="btn btn-sm" onClick={() => go("project", { id: r.id })}>
          View Invoices
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tax Invoices, Receipts & Ledger"
        subtitle="Manage client billing, issue payment receipts against invoices, and inspect party statement of accounts."
      >
        <button className="btn" onClick={() => setIssueReceiptOpen(true)}>
          <Icon name="plus" size={16} /> Issue Payment Receipt
        </button>
        <button className="btn" onClick={() => go("register")}>
          Invoice Register
        </button>
        <button className="btn btn-primary" onClick={() => setNewOpen(true)}>
          <Icon name="plus" size={16} /> New Project
        </button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 pb-px no-print">
        <button
          type="button"
          onClick={() => setActiveTab("projects")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "projects"
              ? "border-neutral-900 text-neutral-900 font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300"
          }`}
        >
          Projects & Invoices
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("receipts")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer inline-flex items-center gap-2 ${
            activeTab === "receipts"
              ? "border-neutral-900 text-neutral-900 font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300"
          }`}
        >
          <span>Payment Receipts</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-mono font-semibold ${
              activeTab === "receipts"
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 border border-neutral-200"
            }`}
          >
            {(data.receipts || []).length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ledger")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "ledger"
              ? "border-neutral-900 text-neutral-900 font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300"
          }`}
        >
          Party Ledger (Statement of Accounts)
        </button>
      </div>

      {/* Tab 1: Projects & Invoices */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Total Projects"
              value={rows.length}
              onClick={() => {
                setBal("");
                setStatus("");
              }}
            />
            <StatCard label="Total Invoiced" value={inr(tot.inv)} onClick={() => go("register")} />
            <StatCard
              label="Total Received"
              value={inr(tot.paid)}
              onClick={() => setActiveTab("receipts")}
            />
            <StatCard
              label="Total Outstanding"
              value={inr(tot.out)}
              onClick={() => setBal("outstanding")}
            />
          </div>
          <Toolbar>
            <SearchBox
              value={q}
              onChange={setQ}
              placeholder="Search project, customer, phone, quotation…"
            />
            <Field label="Project status">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="All"
                options={PROJECT_STATUSES}
              />
            </Field>
            <Field label="Balance">
              <Select
                value={bal}
                onChange={(e) => setBal(e.target.value)}
                placeholder="All"
                options={[
                  { value: "outstanding", label: "Has outstanding" },
                  { value: "settled", label: "Fully settled" },
                  { value: "none", label: "No invoices yet" },
                ]}
              />
            </Field>
          </Toolbar>
          <DataTable
            columns={cols}
            rows={shown}
            onRowClick={(r) => go("project", { id: r.id })}
            empty="No projects match your filters."
          />
        </div>
      )}

      {/* Tab 2: Payment Receipts Register */}
      {activeTab === "receipts" && (
        <PaymentReceiptsRegister onIssueNew={() => setIssueReceiptOpen(true)} />
      )}

      {/* Tab 3: Party Ledger */}
      {activeTab === "ledger" && <PartyLedger />}

      <ProjectFormModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onSaved={(p) => go("project", { id: p.id })}
      />
      <PaymentReceiptModal
        open={issueReceiptOpen}
        onClose={() => setIssueReceiptOpen(false)}
        onCreated={(rec) => go("receipt", { id: rec.id })}
      />
    </div>
  );
}

/* ---------------- 9.2 Payment Receipts Register Component ---------------- */
export function PaymentReceiptsRegister({ onIssueNew }) {
  const { data, go, deletePaymentReceipt, toast } = useCRM();
  const [q, setQ] = useState("");
  const [method, setMethod] = useState("");
  const [proj, setProj] = useState("");
  const [delRec, setDelRec] = useState(null);

  const receipts = data.receipts || [];
  const projects = data.projects || [];

  const metrics = useMemo(() => {
    const totalAmount = receipts.reduce((s, r) => s + num(r.amount), 0);
    const bankTransfer = receipts
      .filter((r) => r.method === "Bank Transfer")
      .reduce((s, r) => s + num(r.amount), 0);
    const cheque = receipts
      .filter((r) => r.method === "Cheque")
      .reduce((s, r) => s + num(r.amount), 0);
    const upi = receipts
      .filter((r) => r.method === "UPI")
      .reduce((s, r) => s + num(r.amount), 0);
    return { totalAmount: round2(totalAmount), count: receipts.length, bankTransfer, cheque, upi };
  }, [receipts]);

  const filtered = useMemo(() => {
    return receipts.filter((r) => {
      if (method && r.method !== method) return false;
      if (proj && r.projectId !== proj) return false;
      if (q.trim()) {
        const query = q.toLowerCase();
        const p = projects.find((x) => x.id === r.projectId);
        const matchNum = r.number?.toLowerCase().includes(query);
        const matchInv = r.invoiceNumber?.toLowerCase().includes(query);
        const matchCust = (r.customerName || p?.customerName)?.toLowerCase().includes(query);
        const matchProj = p?.name?.toLowerCase().includes(query);
        const matchRef = r.reference?.toLowerCase().includes(query);
        const matchNotes = r.notes?.toLowerCase().includes(query);
        if (!matchNum && !matchInv && !matchCust && !matchProj && !matchRef && !matchNotes) {
          return false;
        }
      }
      return true;
    });
  }, [receipts, method, proj, q, projects]);

  const cols = [
    {
      key: "number",
      label: "Receipt No.",
      render: (r) => <span className="font-mono font-bold text-neutral-900">{r.number}</span>,
    },
    { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
    {
      key: "customerName",
      label: "Customer / Project",
      render: (r) => {
        const p = projects.find((x) => x.id === r.projectId);
        return (
          <div>
            <div className="font-semibold text-neutral-900">{r.companyName || r.customerName || p?.customerName}</div>
            <div className="text-xs text-neutral-500 font-mono">{p ? `${p.code} · ${p.name}` : "—"}</div>
          </div>
        );
      },
    },
    {
      key: "invoiceNumber",
      label: "Ref Tax Invoice",
      render: (r) => {
        const inv = data.invoices.find((i) => i.id === r.invoiceId || i.number === r.invoiceNumber);
        return (
          <button
            className="font-mono text-xs font-bold underline text-neutral-900 hover:text-neutral-600 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (inv) go("invoice", { id: inv.id });
            }}
          >
            {r.invoiceNumber || inv?.number || "—"}
          </button>
        );
      },
    },
    {
      key: "method",
      label: "Payment Mode",
      render: (r) => <Pill>{r.method}</Pill>,
    },
    {
      key: "reference",
      label: "UTR / Cheque Ref",
      render: (r) => <span className="font-mono text-xs text-neutral-600">{r.reference || "—"}</span>,
    },
    {
      key: "amount",
      label: "Amount Received",
      align: "right",
      render: (r) => <span className="font-bold text-emerald-700">{inr(r.amount)}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (r) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-sm" onClick={() => go("receipt", { id: r.id })}>
            View
          </button>
          <button className="btn btn-sm" onClick={() => go("receipt", { id: r.id, print: true })}>
            Print
          </button>
          <button
            className="btn btn-sm text-rose-600"
            title="Reverse receipt"
            onClick={() => setDelRec(r)}
          >
            Reverse
          </button>
        </div>
      ),
    },
  ];

  const handleConfirmDelete = () => {
    if (!delRec) return;
    deletePaymentReceipt(delRec.id);
    toast(`Payment Receipt ${delRec.number} reversed`);
    setDelRec(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Receipts Amount" value={inr(metrics.totalAmount)} />
        <StatCard label="Total Receipts Issued" value={`${metrics.count} Receipts`} />
        <StatCard label="Bank / NEFT / RTGS" value={inr(metrics.bankTransfer)} />
        <StatCard label="Cheque & UPI" value={inr(metrics.cheque + metrics.upi)} />
      </div>

      <Toolbar>
        <SearchBox
          value={q}
          onChange={setQ}
          placeholder="Search receipt no., invoice, customer, UTR ref…"
        />
        <Field label="Payment mode">
          <Select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            placeholder="All Modes"
            options={PAYMENT_METHODS}
          />
        </Field>
        <Field label="Project">
          <Select
            value={proj}
            onChange={(e) => setProj(e.target.value)}
            placeholder="All Projects"
            options={projects.map((p) => ({ value: p.id, label: `${p.code} · ${p.name}` }))}
          />
        </Field>
      </Toolbar>

      <DataTable
        columns={cols}
        rows={filtered}
        onRowClick={(r) => go("receipt", { id: r.id })}
        initialSort={{ key: "date", dir: "desc" }}
        empty="No payment receipts found matching your search."
      />

      <ConfirmDialog
        open={!!delRec}
        title="Reverse Payment Receipt?"
        confirmLabel="Reverse Receipt"
        onCancel={() => setDelRec(null)}
        onConfirm={handleConfirmDelete}
        message={
          delRec
            ? `Reverse payment receipt ${delRec.number} for ${inr(delRec.amount)}? The balance on invoice ${delRec.invoiceNumber} will increase accordingly.`
            : ""
        }
      />
    </div>
  );
}

/* ---------------- 9.3 Party Ledger (Statement of Account) ---------------- */
export function PartyLedger() {
  const { data, go } = useCRM();
  const projects = data.projects || [];
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || "");
  const [dateRange, setDateRange] = useState("all");
  const [q, setQ] = useState("");
  const [printModal, setPrintModal] = useState(false);

  const p = projects.find((x) => x.id === selectedProjectId) || projects[0];

  const { ledgerRows, totalInvoiced, totalReceived, closingBalance } = useMemo(() => {
    if (!p) return { ledgerRows: [], totalInvoiced: 0, totalReceived: 0, closingBalance: 0 };

    const projectInvs = (data.invoices || []).filter(
      (i) => i.projectId === p.id && i.state === "Finalized"
    );
    const projectRecs = (data.receipts || []).filter(
      (r) => r.projectId === p.id && r.status !== "Cancelled"
    );

    const entries = [
      ...projectInvs.map((inv) => {
        const s = invoiceSummary(inv);
        return {
          id: inv.id,
          date: inv.date,
          type: "Invoice",
          voucherType: "Tax Invoice",
          voucherNo: inv.number,
          particulars: `Tax Invoice for ${inv.stage}${inv.reference ? ` (Ref: ${inv.reference})` : ""}`,
          debit: s.grand,
          credit: 0,
          rawId: inv.id,
        };
      }),
      ...projectRecs.map((rec) => {
        return {
          id: rec.id,
          date: rec.date,
          type: "Receipt",
          voucherType: "Payment Receipt",
          voucherNo: rec.number,
          particulars: `Payment received via ${rec.method} (Ref: ${rec.reference || "—"})${
            rec.notes ? ` · ${rec.notes}` : ""
          } against ${rec.invoiceNumber || "Invoice"}`,
          debit: 0,
          credit: rec.amount,
          rawId: rec.id,
        };
      }),
    ];

    // Sort ascending by date
    entries.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.type === "Invoice" ? -1 : 1;
    });

    let runningBal = 0;
    let sumDebit = 0;
    let sumCredit = 0;

    const rowsWithBal = entries.map((e) => {
      runningBal = round2(runningBal + e.debit - e.credit);
      sumDebit += e.debit;
      sumCredit += e.credit;
      return {
        ...e,
        balance: runningBal,
      };
    });

    return {
      ledgerRows: rowsWithBal,
      totalInvoiced: round2(sumDebit),
      totalReceived: round2(sumCredit),
      closingBalance: round2(runningBal),
    };
  }, [p, data.invoices, data.receipts]);

  const filteredRows = useMemo(() => {
    return ledgerRows.filter((r) => {
      if (q.trim()) {
        const query = q.toLowerCase();
        const m1 = r.voucherNo?.toLowerCase().includes(query);
        const m2 = r.particulars?.toLowerCase().includes(query);
        if (!m1 && !m2) return false;
      }
      return true;
    });
  }, [ledgerRows, q]);

  if (!p) {
    return <div className="card p-8 text-center">No projects available for party ledger.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Selector & Top Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between no-print">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-semibold text-neutral-600">Select Party / Project:</label>
          <select
            className="input w-auto font-semibold"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.code} · {proj.name} ({proj.customerName})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button className="btn" onClick={() => go("project", { id: p.id })}>
            Project Workspace
          </button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <Icon name="print" size={16} /> Print Statement of Account
          </button>
        </div>
      </div>

      {/* Party Summary Card */}
      <div className="rounded-xl border border-border bg-white p-4 no-print">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-neutral-400">Statement of Account For</div>
            <h2 className="text-xl font-bold text-neutral-900 mt-0.5">
              {p.companyName || p.customerName}
            </h2>
            {p.companyName && <div className="text-xs text-neutral-600">Attn: {p.customerName}</div>}
            <div className="text-xs text-neutral-500 mt-1">
              Project: <span className="font-mono font-semibold text-neutral-700">{p.code} · {p.name}</span>
            </div>
            <div className="text-xs text-neutral-500">Phone: {p.phone} · Email: {p.email || "—"}</div>
            {p.billingAddress && <div className="text-xs text-neutral-500 mt-0.5">{p.billingAddress}</div>}
          </div>

          <div className="grid grid-cols-3 gap-3 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-4">
            <div>
              <div className="text-xs text-neutral-400 font-semibold uppercase">Total Invoiced (Dr)</div>
              <div className="text-lg font-bold text-neutral-900">{inr(totalInvoiced)}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400 font-semibold uppercase">Total Received (Cr)</div>
              <div className="text-lg font-bold text-emerald-700">{inr(totalReceived)}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-400 font-semibold uppercase">Closing Balance</div>
              <div className={`text-lg font-extrabold ${closingBalance > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                {inr(closingBalance)} {closingBalance > 0 ? "Dr" : "Settled"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table Section */}
      <div className="space-y-2">
        <Toolbar>
          <SearchBox value={q} onChange={setQ} placeholder="Search particulars, voucher no…" />
          <div className="text-xs text-neutral-500 ml-auto">
            Showing all historical debits (invoices) and credits (receipts)
          </div>
        </Toolbar>

        <div className="overflow-x-auto rounded-lg border border-border bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-border text-neutral-600 uppercase font-semibold">
              <tr>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Voucher Type</th>
                <th className="px-3 py-2.5">Voucher / Ref #</th>
                <th className="px-3 py-2.5">Particulars / Narration</th>
                <th className="px-3 py-2.5 text-right">Debit (₹ Dr)</th>
                <th className="px-3 py-2.5 text-right">Credit (₹ Cr)</th>
                <th className="px-3 py-2.5 text-right font-bold">Balance (₹ Dr)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-neutral-400">
                    No transactions recorded for this party.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r) => (
                  <tr key={`${r.type}-${r.id}`} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="px-3 py-2.5 font-medium text-neutral-900 whitespace-nowrap">
                      {fmtDate(r.date)}
                    </td>
                    <td className="px-3 py-2.5">
                      {r.type === "Invoice" ? (
                        <span className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
                          Tax Invoice
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                          Payment Receipt
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-mono font-bold">
                      <button
                        className="underline text-neutral-900 hover:text-neutral-600 cursor-pointer"
                        onClick={() => {
                          if (r.type === "Invoice") go("invoice", { id: r.rawId });
                          else go("receipt", { id: r.rawId });
                        }}
                      >
                        {r.voucherNo}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-neutral-700 max-w-md truncate" title={r.particulars}>
                      {r.particulars}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-neutral-900">
                      {r.debit > 0 ? inr(r.debit) : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-emerald-700">
                      {r.credit > 0 ? inr(r.credit) : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-neutral-900">
                      {inr(r.balance)} <span className="text-[10px] text-neutral-500 font-normal">Dr</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredRows.length > 0 && (
              <tfoot className="bg-neutral-50 border-t-2 border-border font-bold text-neutral-900">
                <tr>
                  <td colSpan={4} className="px-3 py-2.5 text-right uppercase text-xs">
                    Total
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs">{inr(totalInvoiced)}</td>
                  <td className="px-3 py-2.5 text-right text-xs text-emerald-700">{inr(totalReceived)}</td>
                  <td className="px-3 py-2.5 text-right text-xs">
                    {inr(closingBalance)} Dr
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Printable Statement of Account (Rendered on Print) */}
      <div className="hidden print:block print-doc doc mt-4">
        <div className="doc-head">
          <div>
            <div className="font-bold text-lg">{data.settings.legalName}</div>
            <div>{data.settings.address}</div>
            <div>Phone: {data.settings.phone} · Email: {data.settings.email}</div>
            {data.settings.gstin && <div>GSTIN: {data.settings.gstin}</div>}
          </div>
          <div className="text-right">
            <div className="doc-title">STATEMENT OF ACCOUNT</div>
            <div className="text-xs text-neutral-500 mt-1">Generated: {fmtDate(todayISO())}</div>
          </div>
        </div>

        <div className="doc-grid mb-3">
          <div className="doc-box">
            <div className="doc-label">Account Of</div>
            <div className="font-bold text-base">{p.companyName || p.customerName}</div>
            <div>{p.billingAddress}</div>
            <div>Phone: {p.phone}</div>
          </div>
          <div className="doc-box">
            <table className="doc-kv">
              <tbody>
                <tr><td>Project ID</td><td>{p.code}</td></tr>
                <tr><td>Project Name</td><td>{p.name}</td></tr>
                <tr><td>Closing Balance</td><td className="font-bold">{inr(closingBalance)} Dr</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <table className="doc-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Voucher No</th>
              <th>Particulars</th>
              <th className="r">Debit (Dr)</th>
              <th className="r">Credit (Cr)</th>
              <th className="r">Balance</th>
            </tr>
          </thead>
          <tbody>
            {ledgerRows.map((r) => (
              <tr key={r.id}>
                <td>{fmtDate(r.date)}</td>
                <td>{r.voucherType}</td>
                <td>{r.voucherNo}</td>
                <td>{r.particulars}</td>
                <td className="r">{r.debit > 0 ? inr(r.debit) : "—"}</td>
                <td className="r">{r.credit > 0 ? inr(r.credit) : "—"}</td>
                <td className="r">{inr(r.balance)} Dr</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="doc-bottom mt-4">
          <div className="text-xs">
            * This is a computer-generated statement of accounts showing all invoiced billings and payment receipts.
          </div>
          <table className="doc-totals">
            <tbody>
              <tr><td>Total Invoiced</td><td className="r">{inr(totalInvoiced)}</td></tr>
              <tr><td>Total Payments</td><td className="r">{inr(totalReceived)}</td></tr>
              <tr className="font-bold"><td>Closing Balance Due</td><td className="r">{inr(closingBalance)} Dr</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 9.4 Payment Receipt Details Page (View / Print) ---------------- */
export function ReceiptDetails() {
  const { data, go, route } = useCRM();
  const receipt = (data.receipts || []).find(
    (r) => r.id === route.params.id || r.number === route.params.id
  );
  const [printed, setPrinted] = useState(false);

  if (!receipt) {
    return <Missing what="Payment Receipt" back={() => go("invoices", { tab: "receipts" })} />;
  }

  const p = data.projects.find((x) => x.id === receipt.projectId);
  const inv = data.invoices.find(
    (x) => x.id === receipt.invoiceId || x.number === receipt.invoiceNumber
  );

  if (route.params.print && !printed) {
    setPrinted(true);
    setTimeout(() => window.print(), 300);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Payment Receipt ${receipt.number}`}
        subtitle={`${receipt.customerName || p?.customerName} · ${p?.name || "Project"} · ${inr(
          receipt.amount
        )}`}
        onBack={() => go("invoices", { tab: "receipts" })}
      >
        <button className="btn" onClick={() => go("invoices", { tab: "receipts" })}>
          Receipts Register
        </button>
        {inv && (
          <button className="btn" onClick={() => go("invoice", { id: inv.id })}>
            View Linked Invoice
          </button>
        )}
        {p && (
          <button className="btn" onClick={() => go("project", { id: p.id })}>
            Project Workspace
          </button>
        )}
        <button className="btn btn-primary" onClick={() => window.print()}>
          <Icon name="print" size={16} /> Print Receipt Voucher
        </button>
      </PageHeader>
      <div className="overflow-x-auto">
        <ReceiptDocument receipt={receipt} project={p} invoice={inv} settings={data.settings} />
      </div>
    </div>
  );
}

/* ---------------- 9.5 Payment Receipt Modal (Issue Receipt) ---------------- */
export function PaymentReceiptModal({ open, inv, projectId, onClose, onCreated }) {
  const { data, addPaymentReceipt, toast } = useCRM();
  const [f, setF] = useState(null);
  const [err, setErr] = useState({});
  const [confirm, setConfirm] = useState(false);

  const projects = data.projects || [];
  const selectedProjId = f?.projectId || inv?.projectId || projectId || projects[0]?.id || "";
  const selectedProj = projects.find((p) => p.id === selectedProjId);

  // Eligible finalized invoices with pending balance
  const eligibleInvoices = useMemo(() => {
    return (data.invoices || []).filter((i) => {
      if (i.state !== "Finalized") return false;
      if (selectedProjId && i.projectId !== selectedProjId) return false;
      const s = invoiceSummary(i);
      return s.balance > 0 || (inv && i.id === inv.id);
    });
  }, [data.invoices, selectedProjId, inv]);

  useEffect(() => {
    if (open && !f) {
      const activeInv = inv || eligibleInvoices[0];
      const s = activeInv ? invoiceSummary(activeInv) : null;
      setF({
        projectId: selectedProjId,
        invoiceId: activeInv?.id || "",
        date: todayISO(),
        amount: s?.balance || "",
        method: "Bank Transfer",
        reference: "",
        notes: "",
      });
    }
  }, [open, f, inv, eligibleInvoices, selectedProjId]);

  if (!open) {
    if (f) setF(null);
    return null;
  }
  if (!f) return null;

  const currentInvoice = (data.invoices || []).find((i) => i.id === f.invoiceId);
  const curSummary = currentInvoice ? invoiceSummary(currentInvoice) : null;

  const onProjectChange = (e) => {
    const pId = e.target.value;
    const projectInvs = (data.invoices || []).filter(
      (i) => i.projectId === pId && i.state === "Finalized"
    );
    const firstInv = projectInvs.find((i) => invoiceSummary(i).balance > 0) || projectInvs[0];
    const s = firstInv ? invoiceSummary(firstInv) : null;
    setF({
      ...f,
      projectId: pId,
      invoiceId: firstInv?.id || "",
      amount: s?.balance || "",
    });
  };

  const onInvoiceChange = (e) => {
    const invId = e.target.value;
    const selected = (data.invoices || []).find((i) => i.id === invId);
    const s = selected ? invoiceSummary(selected) : null;
    setF({
      ...f,
      invoiceId: invId,
      amount: s?.balance || "",
    });
  };

  const check = () => {
    const e = {};
    if (!f.invoiceId) e.invoiceId = "Please select an invoice";
    const a = round2(num(f.amount));
    if (!(a > 0)) e.amount = "Amount must be greater than 0";
    else if (curSummary && a > curSummary.balance) {
      e.amount = `Amount cannot exceed balance due (${inr(curSummary.balance)})`;
    }
    if (!f.date) e.date = "Receipt date is required";
    else if (currentInvoice && f.date < currentInvoice.date) {
      e.date = "Receipt date cannot be before invoice date";
    }
    if (f.method !== "Cash" && !f.reference?.trim()) {
      e.reference = "Transaction reference / UTR is required";
    }
    setErr(e);
    if (!Object.keys(e).length) setConfirm(true);
  };

  const save = () => {
    const a = round2(num(f.amount));
    const rec = addPaymentReceipt({
      projectId: f.projectId,
      invoiceId: f.invoiceId,
      invoiceNumber: currentInvoice?.number || "",
      customerName: selectedProj?.customerName || "",
      companyName: selectedProj?.companyName || "",
      date: f.date,
      amount: a,
      method: f.method,
      reference: f.reference?.trim() || "",
      notes: f.notes?.trim() || "",
    });
    toast(`Payment Receipt ${rec.number} created for ${inr(a)}`);
    setConfirm(false);
    setF(null);
    onClose();
    onCreated?.(rec);
  };

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <>
      <Modal
        open={!confirm}
        title={`Issue Payment Receipt${currentInvoice ? ` · ${currentInvoice.number}` : ""}`}
        onClose={onClose}
        footer={
          <>
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={check}>
              Generate Receipt
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {!inv && (
              <Field label="Project / Customer" required>
                <Select
                  value={f.projectId}
                  onChange={onProjectChange}
                  options={projects.map((p) => ({
                    value: p.id,
                    label: `${p.code} · ${p.name} (${p.customerName})`,
                  }))}
                />
              </Field>
            )}
            <Field
              label="Tax Invoice Reference"
              required
              error={err.invoiceId}
              className={inv ? "sm:col-span-2" : ""}
            >
              {inv ? (
                <div className="font-mono text-sm font-bold text-neutral-800 p-2 border rounded bg-neutral-50">
                  {inv.number} · {inv.stage}
                </div>
              ) : (
                <Select
                  value={f.invoiceId}
                  onChange={onInvoiceChange}
                  options={eligibleInvoices.map((i) => {
                    const s = invoiceSummary(i);
                    return {
                      value: i.id,
                      label: `${i.number} (${i.stage}) — Unpaid: ${inr(s.balance)} / ${inr(s.grand)}`,
                    };
                  })}
                />
              )}
            </Field>

            {curSummary && (
              <div className="sm:col-span-2 rounded-lg bg-neutral-50 border p-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-neutral-500 block">Invoice Value</span>
                  <span className="font-bold">{inr(curSummary.grand)}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Already Received</span>
                  <span className="font-semibold text-emerald-700">{inr(curSummary.paid)}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Balance Due</span>
                  <span className="font-bold text-rose-600">{inr(curSummary.balance)}</span>
                </div>
              </div>
            )}

            <Field label="Receipt Date" required error={err.date}>
              <Input type="date" value={f.date} onChange={set("date")} />
            </Field>
            <Field label="Amount Received (₹)" required error={err.amount}>
              <Input type="number" min="0" step="any" value={f.amount} onChange={set("amount")} />
            </Field>
            <Field label="Payment Method">
              <Select value={f.method} onChange={set("method")} options={PAYMENT_METHODS} />
            </Field>
            <Field
              label="Instrument / UTR / Cheque Ref"
              required={f.method !== "Cash"}
              error={err.reference}
            >
              <Input
                value={f.reference}
                onChange={set("reference")}
                placeholder="e.g. UTR / NEFT / Cheque No."
              />
            </Field>
            <Field label="Remarks / Narration" className="sm:col-span-2">
              <Textarea
                value={f.notes}
                onChange={set("notes")}
                placeholder="e.g. Advance payment received towards window fabrication"
              />
            </Field>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm}
        title="Confirm Payment Receipt"
        confirmLabel="Yes, Issue Receipt"
        onCancel={() => setConfirm(false)}
        onConfirm={save}
        message={`Issue official payment receipt for ${inr(f.amount)} received via ${
          f.method
        } against invoice ${currentInvoice?.number}? Remaining invoice balance will be ${inr(
          round2((curSummary?.balance || 0) - num(f.amount))
        )}.`}
      />
    </>
  );
}
export const PaymentModal = ({ inv, onClose }) => (
  <PaymentReceiptModal open={!!inv} inv={inv} onClose={onClose} />
);

/* ---------------- 9.6 Project workspace ---------------- */
export function ProjectWorkspace() {
  const { data, go, route, update, toast } = useCRM();
  const p = data.projects.find((x) => x.id === route.params.id);
  const [edit, setEdit] = useState(false);
  const [payFor, setPayFor] = useState(null);
  const [voidFor, setVoidFor] = useState(null);
  const [wsTab, setWsTab] = useState("invoices");

  if (!p) return <Missing what="Project" back={() => go("invoices")} />;
  const s = projectSummary(p, data.invoices);
  const qt = data.quotations.find((x) => x.id === p.quotationId);
  const invs = data.invoices
    .filter((i) => i.projectId === p.id)
    .map((i) => ({ ...i, s: invoiceSummary(i) }));
  const projectReceipts = (data.receipts || []).filter((r) => r.projectId === p.id);

  const duplicate = (inv) => {
    const id = uid("inv");
    const copy = {
      ...inv,
      id,
      s: undefined,
      number: "",
      state: "Draft",
      payments: [],
      voidReason: "",
      date: todayISO(),
      dueDate: addDays(todayISO(), data.settings.dueDays),
      items: inv.items.map((it) => ({ ...it, id: uid("li") })),
      history: [{ id: uid("h"), date: todayISO(), text: `Draft duplicated from ${inv.number}` }],
    };
    delete copy.s;
    copy.number = nextNumber(data.settings.invoicePrefix, data.invoices.map((i) => i.number));
    update("invoices", (xs) => [...xs, copy]);
    toast(`Draft ${copy.number} created`);
    go("invoiceForm", { id });
  };

  const cols = [
    {
      key: "number",
      label: "Invoice No.",
      render: (r) => <span className="font-semibold">{r.number}</span>,
    },
    { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
    { key: "stage", label: "Stage" },
    { key: "dueDate", label: "Due Date", render: (r) => fmtDate(r.dueDate) },
    {
      key: "sub",
      label: "Subtotal",
      align: "right",
      sortValue: (r) => r.s.subtotal,
      render: (r) => inr(r.s.subtotal),
    },
    {
      key: "tax",
      label: "Tax",
      align: "right",
      sortValue: (r) => r.s.tax,
      render: (r) => inr(r.s.tax),
    },
    {
      key: "grand",
      label: "Grand Total",
      align: "right",
      sortValue: (r) => r.s.grand,
      render: (r) => inr(r.s.grand),
    },
    {
      key: "paid",
      label: "Paid",
      align: "right",
      sortValue: (r) => r.s.paid,
      render: (r) => inr(r.s.paid),
    },
    {
      key: "bal",
      label: "Balance",
      align: "right",
      sortValue: (r) => r.s.balance,
      render: (r) => inr(r.s.balance),
    },
    {
      key: "st",
      label: "Status",
      sortValue: (r) => r.s.status,
      render: (r) => <Pill>{r.s.status}</Pill>,
    },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          <button className="btn btn-sm" onClick={() => go("invoice", { id: r.id })}>
            View
          </button>
          {r.state === "Draft" && (
            <button className="btn btn-sm" onClick={() => go("invoiceForm", { id: r.id })}>
              Edit Draft
            </button>
          )}
          {r.state === "Finalized" && r.s.balance > 0 && (
            <button className="btn btn-sm" onClick={() => setPayFor(r)}>
              Issue Receipt
            </button>
          )}
          <button
            className="btn btn-sm"
            onClick={() => go("invoice", { id: r.id, print: true })}
          >
            Print
          </button>
          <button className="btn btn-sm" onClick={() => duplicate(r)}>
            Duplicate as Draft
          </button>
          {r.state !== "Voided" && (
            <button className="btn btn-sm" onClick={() => setVoidFor(r)}>
              {r.state === "Draft" ? "Cancel" : "Void"}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${p.code} · ${p.name}`}
        subtitle={`${p.customerName}${p.companyName ? ` · ${p.companyName}` : ""}`}
        onBack={() => go("invoices")}
      >
        <button className="btn" onClick={() => setEdit(true)}>
          Edit Project
        </button>
        {qt && (
          <button className="btn" onClick={() => go("quotation", { id: qt.id })}>
            View Quotation
          </button>
        )}
        <button
          className="btn"
          onClick={() => go("invoices", { tab: "ledger", projectId: p.id })}
        >
          View Party Ledger
        </button>
      </PageHeader>

      <Section title="Project details">
        <KV
          items={[
            ["Project ID", p.code],
            ["Project Name", p.name],
            ["Customer", p.customerName],
            ["Phone", p.phone],
            ["Email", p.email],
            ["Status", <Pill key="s">{p.status}</Pill>],
            ["Project Site Address", p.siteAddress],
            ["Billing Address", p.billingAddress],
            ["Linked Quotation", qt?.number],
            ["Contract Value", inr(p.value)],
            ["Project Manager", empName(data, p.employeeId)],
            ["Start Date", fmtDate(p.startDate)],
          ]}
        />
      </Section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Contract Value" value={inr(p.value)} />
        <StatCard label="Total Invoiced" value={inr(s.invoiced)} />
        <StatCard label="Total Paid" value={inr(s.paid)} />
        <StatCard label="Outstanding" value={inr(s.outstanding)} />
        <StatCard label="Remaining Uninvoiced" value={inr(s.uninvoiced)} />
      </div>

      {/* Project Sub Tabs */}
      <div className="flex gap-1 border-b border-neutral-200 pb-px">
        <button
          type="button"
          onClick={() => setWsTab("invoices")}
          className={`px-3 py-1.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            wsTab === "invoices"
              ? "border-neutral-900 text-neutral-900 font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300"
          }`}
        >
          Invoices ({invs.length})
        </button>
        <button
          type="button"
          onClick={() => setWsTab("receipts")}
          className={`px-3 py-1.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            wsTab === "receipts"
              ? "border-neutral-900 text-neutral-900 font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300"
          }`}
        >
          Payment Receipts ({projectReceipts.length})
        </button>
      </div>

      {wsTab === "invoices" && (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">Invoices for {p.name}</h2>
            <button
              className="btn btn-primary"
              onClick={() => go("invoiceForm", { projectId: p.id })}
            >
              <Icon name="plus" size={16} /> Create New Invoice
            </button>
          </div>
          <DataTable
            columns={cols}
            rows={invs}
            onRowClick={(r) => go("invoice", { id: r.id })}
            initialSort={{ key: "date", dir: "asc" }}
            empty="No invoices yet for this project. Use “+ Create New Invoice” to raise the first one."
          />
          <p className="mt-2 text-xs">
            Totals include finalized invoices only. Drafts and voided invoices are excluded.
          </p>
        </div>
      )}

      {wsTab === "receipts" && (
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">Payment Receipts for {p.name}</h2>
            <button className="btn btn-primary" onClick={() => setPayFor(invs.find((i) => i.s.balance > 0) || {})}>
              <Icon name="plus" size={16} /> Issue Payment Receipt
            </button>
          </div>
          {projectReceipts.length === 0 ? (
            <div className="card p-6 text-center text-sm text-neutral-500">
              No payment receipts issued for this project yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-border text-neutral-600 font-semibold uppercase">
                  <tr>
                    <th className="px-3 py-2">Receipt No</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Ref Invoice</th>
                    <th className="px-3 py-2">Mode</th>
                    <th className="px-3 py-2">UTR / Ref</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {projectReceipts.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-50">
                      <td className="px-3 py-2 font-mono font-bold text-neutral-900">{r.number}</td>
                      <td className="px-3 py-2">{fmtDate(r.date)}</td>
                      <td className="px-3 py-2 font-mono font-semibold">{r.invoiceNumber || "—"}</td>
                      <td className="px-3 py-2">{r.method}</td>
                      <td className="px-3 py-2 font-mono text-neutral-500">{r.reference || "—"}</td>
                      <td className="px-3 py-2 text-right font-bold text-emerald-700">{inr(r.amount)}</td>
                      <td className="px-3 py-2 text-right">
                        <button className="btn btn-sm" onClick={() => go("receipt", { id: r.id })}>
                          View Voucher
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <ProjectFormModal open={edit} initial={p} onClose={() => setEdit(false)} />
      <PaymentReceiptModal
        open={!!payFor}
        inv={payFor?.id ? payFor : null}
        projectId={p.id}
        onClose={() => setPayFor(null)}
        onCreated={(rec) => go("receipt", { id: rec.id })}
      />
      <VoidDialog inv={voidFor} onClose={() => setVoidFor(null)} />
    </div>
  );
}

function Missing({ what, back }) {
  return (
    <div className="card p-10 text-center">
      <p className="mb-3 font-semibold">{what} not found. It may have been deleted.</p>
      <button className="btn" onClick={back}>
        Go back
      </button>
    </div>
  );
}

function VoidDialog({ inv, onClose }) {
  const { update, toast } = useCRM();
  const [reason, setReason] = useState("");
  if (!inv) return null;
  const hasPay = (inv.payments || []).length > 0;
  const isDraft = inv.state === "Draft";
  const doIt = () => {
    update("invoices", (xs) =>
      xs.map((x) =>
        x.id === inv.id
          ? {
              ...x,
              state: "Voided",
              voidReason: reason,
              history: [
                ...x.history,
                {
                  id: uid("h"),
                  date: todayISO(),
                  text: `${isDraft ? "Draft cancelled" : "Invoice voided"}: ${reason}`,
                },
              ],
            }
          : x
      )
    );
    toast(`${inv.number} ${isDraft ? "cancelled" : "voided"}`);
    setReason("");
    onClose();
  };
  return (
    <ConfirmDialog
      open
      title={isDraft ? `Cancel draft ${inv.number}` : `Void invoice ${inv.number}`}
      confirmLabel={isDraft ? "Cancel draft" : "Void invoice"}
      onCancel={() => {
        setReason("");
        onClose();
      }}
      onConfirm={doIt}
      disabled={hasPay || reason.trim().length < 5}
      message={
        hasPay
          ? "This invoice has payments recorded against it and cannot be voided. Reverse the receipts first."
          : "The invoice number stays reserved and the record is kept for audit. It will no longer count towards project totals. This cannot be undone."
      }
    >
      {!hasPay && (
        <Field label="Reason (min. 5 characters)" required>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
        </Field>
      )}
    </ConfirmDialog>
  );
}

/* ---------------- 9.7 Invoice Editor ---------------- */
export function InvoiceForm() {
  const { data, go, route, update, toast } = useCRM();
  const existing = route.params.id ? data.invoices.find((i) => i.id === route.params.id) : null;
  const projectId = existing?.projectId || route.params.projectId;
  const p = data.projects.find((x) => x.id === projectId);
  const st = data.settings;
  const [f, setF] = useState(() =>
    existing
      ? { ...existing, items: existing.items.map((x) => ({ ...x })) }
      : {
          number: nextNumber(st.invoicePrefix, data.invoices.map((i) => i.number)),
          date: todayISO(),
          dueDate: addDays(todayISO(), st.dueDays),
          stage: INVOICE_STAGES[0],
          customStage: "",
          reference: "",
          workOrderNo: p?.workOrderNo || "",
          workOrderDate: p?.workOrderDate || todayISO(),
          preparedBy: st.defaultEmployeeId,
          taxTreatment: st.taxTreatment,
          buyerGstin: "",
          siteContact: p?.siteContact || "",
          items: [blankItem(st.defaultTaxRate)],
          additionalCharges: 0,
          notes: "",
        }
  );
  const [stageMode, setStageMode] = useState(
    existing && !INVOICE_STAGES.includes(existing.stage) ? "custom" : "list"
  );
  const [err, setErr] = useState({});
  const [confirmFin, setConfirmFin] = useState(false);
  if (!p) return <Missing what="Project" back={() => go("invoices")} />;
  if (existing && existing.state !== "Draft") {
    return (
      <div className="card p-10 text-center">
        <p className="mb-3 font-semibold">
          {existing.number} is {existing.state.toLowerCase()} and can no longer be edited.
        </p>
        <button className="btn" onClick={() => go("invoice", { id: existing.id })}>
          View invoice
        </button>
      </div>
    );
  }
  const t = docTotals(f.items, f.additionalCharges, f.taxTreatment);
  const s = projectSummary(p, data.invoices);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const stage = stageMode === "custom" ? f.customStage : f.stage;
  const validate = () => {
    const e = {};
    const n = f.number.trim();
    if (!n) e.number = "Invoice number is required";
    else if (
      data.invoices.some(
        (i) => i.id !== existing?.id && i.number.trim().toLowerCase() === n.toLowerCase()
      )
    ) {
      e.number = "This invoice number is already used";
    }
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
      ...f,
      workOrderNo: (f.workOrderNo || p?.workOrderNo || "").trim(),
      workOrderDate: f.workOrderDate || p?.workOrderDate || "",
      stage,
      number: f.number.trim(),
      additionalCharges: round2(num(f.additionalCharges)),
      projectId: p.id,
      quotationId: p.quotationId,
      state,
      id: existing?.id || uid("inv"),
      payments: existing?.payments || [],
      voidReason: "",
      history: [
        ...(existing?.history || []),
        {
          id: uid("h"),
          date: today,
          text: state === "Draft" ? (existing ? "Draft updated" : "Draft created") : "Invoice finalized",
        },
      ],
    };
    delete rec.customStage;
    update("invoices", (xs) =>
      existing ? xs.map((x) => (x.id === rec.id ? rec : x)) : [...xs, rec]
    );
    toast(state === "Draft" ? `Draft ${rec.number} saved` : `Invoice ${rec.number} finalized`);
    go("invoice", { id: rec.id });
  };
  const overContract = round2(s.uninvoiced - (existing?.state === "Finalized" ? 0 : t.grand)) < 0;
  return (
    <div className="space-y-4">
      <PageHeader
        title={existing ? `Edit draft ${existing.number}` : "Create New Invoice"}
        subtitle={`${p.code} · ${p.name}`}
        onBack={() => go("project", { id: p.id })}
      >
        <button className="btn" onClick={() => go("project", { id: p.id })}>
          Cancel
        </button>
        <button className="btn" onClick={() => validate() && persist("Draft")}>
          Save as Draft
        </button>
        <button className="btn btn-primary" onClick={() => validate() && setConfirmFin(true)}>
          Finalize Invoice
        </button>
      </PageHeader>
      {Object.keys(err).length > 0 && (
        <div className="card p-3 text-sm font-semibold">
          ⚠ Please fix the highlighted fields before saving.
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Bill To (from project)">
          <KV
            items={[
              ["Customer / Company", p.companyName || p.customerName],
              ["Phone", p.phone],
              ["Email", p.email],
              ["Billing Address", p.billingAddress],
            ]}
          />
          <Field label="Buyer GSTIN (if supplied)" className="mt-3">
            <Input value={f.buyerGstin} onChange={set("buyerGstin")} />
          </Field>
        </Section>
        <Section title="Ship To / Project Site">
          <KV
            items={[
              ["Project ID", p.code],
              ["Project", p.name],
              ["Site Address", p.siteAddress],
              ["Linked Quotation", data.quotations.find((q) => q.id === p.quotationId)?.number],
            ]}
          />
          <Field label="Site contact" className="mt-3">
            <Input value={f.siteContact} onChange={set("siteContact")} />
          </Field>
        </Section>
      </div>
      <Section title="Invoice details">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Invoice number" required error={err.number}>
            <Input value={f.number} onChange={set("number")} />
          </Field>
          <Field label="Invoice date" required error={err.date}>
            <Input
              type="date"
              value={f.date}
              onChange={(e) =>
                setF({
                  ...f,
                  date: e.target.value,
                  dueDate: existing ? f.dueDate : addDays(e.target.value, st.dueDays),
                })
              }
            />
          </Field>
          <Field label="Due date" required error={err.dueDate}>
            <Input type="date" value={f.dueDate} onChange={set("dueDate")} />
          </Field>
          <Field label="Invoice stage" required error={err.stage}>
            <Select
              value={stageMode === "custom" ? "__custom" : f.stage}
              onChange={(e) =>
                e.target.value === "__custom"
                  ? setStageMode("custom")
                  : (setStageMode("list"), setF({ ...f, stage: e.target.value }))
              }
              options={[...INVOICE_STAGES, { value: "__custom", label: "Custom…" }]}
            />
            {stageMode === "custom" && (
              <Input
                className="mt-2"
                placeholder="Custom stage name"
                value={f.customStage || ""}
                onChange={set("customStage")}
              />
            )}
          </Field>
          <Field label="Ref Work Order No.">
            <Input
              placeholder="e.g. WO/2026/089"
              value={f.workOrderNo || ""}
              onChange={set("workOrderNo")}
            />
          </Field>
          <Field label="Work Order Date">
            <Input
              type="date"
              value={f.workOrderDate || ""}
              onChange={set("workOrderDate")}
            />
          </Field>
          <Field label="Reference / PO notes">
            <Input value={f.reference} onChange={set("reference")} />
          </Field>
          <Field label="Prepared by">
            <Select
              value={f.preparedBy}
              onChange={set("preparedBy")}
              options={data.employees.map((e) => ({ value: e.id, label: e.name }))}
            />
          </Field>
          <Field label="Tax treatment">
            <Select
              value={f.taxTreatment}
              onChange={set("taxTreatment")}
              options={[
                { value: "CGST_SGST", label: "CGST + SGST (intra-state)" },
                { value: "IGST", label: "IGST (inter-state)" },
              ]}
            />
          </Field>
          <Field label="Additional charges (₹)" error={err.additionalCharges}>
            <Input
              type="number"
              min="0"
              value={f.additionalCharges}
              onChange={set("additionalCharges")}
            />
          </Field>
        </div>
      </Section>
      <Section title="Line items">
        <LineItemsEditor
          items={f.items}
          onChange={(items) => setF({ ...f, items })}
          taxRates={st.taxRates}
          defaultTaxRate={st.defaultTaxRate}
          showType={false}
          error={err.items}
        />
        <div className="mt-4 flex flex-col gap-4 md:flex-row">
          <Field label="Notes" className="flex-1">
            <Textarea value={f.notes} onChange={set("notes")} />
          </Field>
          <TotalsBox t={t} treatment={f.taxTreatment} />
        </div>
        <div className="mt-3 text-sm">
          Contract value {inr(p.value)} · Already invoiced {inr(s.invoiced)} · Remaining{" "}
          {inr(s.uninvoiced)}
          {overContract && (
            <span className="ml-2 font-semibold">
              ⚠ This invoice takes the total above the contract value.
            </span>
          )}
        </div>
      </Section>
      <ConfirmDialog
        open={confirmFin}
        title="Finalize invoice?"
        confirmLabel="Finalize"
        onCancel={() => setConfirmFin(false)}
        onConfirm={() => persist("Finalized")}
        message={`Once finalized, ${f.number} for ${inr(t.grand)} cannot be edited. Only payments can be recorded or the invoice voided.${
          overContract ? " Note: this exceeds the remaining contract value." : ""
        }`}
      />
    </div>
  );
}

/* ---------------- 9.8 Invoice Details ---------------- */
export function InvoiceDetails() {
  const { data, go, route, update, toast } = useCRM();
  const inv = data.invoices.find((i) => i.id === route.params.id);
  const [payOpen, setPayOpen] = useState(false);
  const [voidOpen, setVoidOpen] = useState(false);
  const [fin, setFin] = useState(false);
  const [printed, setPrinted] = useState(false);

  if (!inv) return <Missing what="Invoice" back={() => go("register")} />;
  const p = data.projects.find((x) => x.id === inv.projectId);
  if (!p) return <Missing what="Linked project" back={() => go("register")} />;
  const s = invoiceSummary(inv);
  const qt = data.quotations.find((x) => x.id === inv.quotationId);

  // Linked payment receipts
  const linkedReceipts = (data.receipts || []).filter(
    (r) => r.invoiceId === inv.id || r.invoiceNumber === inv.number
  );

  if (route.params.print && !printed) {
    setPrinted(true);
    setTimeout(() => window.print(), 300);
  }

  const finalize = () => {
    const err =
      validateItems(inv.items) ||
      (data.invoices.some((i) => i.id !== inv.id && i.number === inv.number)
        ? "Duplicate invoice number"
        : "");
    if (err) {
      toast(`Cannot finalize: ${err}`);
      setFin(false);
      return;
    }
    update("invoices", (xs) =>
      xs.map((x) =>
        x.id === inv.id
          ? {
              ...x,
              state: "Finalized",
              history: [
                ...x.history,
                { id: uid("h"), date: todayISO(), text: "Invoice finalized" },
              ],
            }
          : x
      )
    );
    toast(`${inv.number} finalized`);
    setFin(false);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Invoice ${inv.number}`}
        subtitle={`${p.code} · ${p.name} · ${inv.stage}`}
        onBack={() => go("project", { id: p.id })}
      >
        <button className="btn" onClick={() => go("project", { id: p.id })}>
          Project workspace
        </button>
        {inv.state === "Draft" && (
          <button className="btn" onClick={() => go("invoiceForm", { id: inv.id })}>
            Edit Draft
          </button>
        )}
        {inv.state === "Draft" && (
          <button className="btn btn-primary" onClick={() => setFin(true)}>
            Finalize
          </button>
        )}
        {inv.state === "Finalized" && s.balance > 0 && (
          <button className="btn btn-primary" onClick={() => setPayOpen(true)}>
            <Icon name="plus" size={16} /> Issue Payment Receipt
          </button>
        )}
        <button className="btn" onClick={() => window.print()}>
          <Icon name="print" size={16} /> Print Tax Invoice
        </button>
        {inv.state !== "Voided" && (
          <button className="btn" onClick={() => setVoidOpen(true)}>
            {inv.state === "Draft" ? "Cancel Draft" : "Void"}
          </button>
        )}
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3 text-xs bg-neutral-100 p-2.5 rounded-lg border border-neutral-200 text-neutral-700 no-print">
        <span><b>Ref Work Order:</b> <span className="font-mono font-bold text-neutral-900">{inv.workOrderNo || p?.workOrderNo || "—"}</span></span>
        <span>·</span>
        <span><b>Work Order Date:</b> {fmtDate(inv.workOrderDate || p?.workOrderDate) || "—"}</span>
        <span>·</span>
        <span><b>Project:</b> {p?.code} · {p?.name}</span>
        <span>·</span>
        <span><b>Stage:</b> {inv.stage}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 no-print lg:grid-cols-5">
        <StatCard label="Status" value={s.status} />
        <StatCard label="Invoice Grand Total" value={inr(s.grand)} />
        <StatCard label="Total Collected" value={inr(s.paid)} />
        <StatCard label="Balance Outstanding" value={inr(s.balance)} />
        <StatCard label="Due Date" value={fmtDate(inv.dueDate)} />
      </div>

      {inv.state === "Voided" && (
        <div className="card p-3 text-sm no-print">
          <b>Voided.</b> Reason: {inv.voidReason || "—"}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <div className="overflow-x-auto">
          <InvoiceDocument
            inv={inv}
            project={p}
            quotation={qt}
            settings={data.settings}
            employees={data.employees}
          />
        </div>

        <div className="space-y-4 no-print">
          {/* Linked Payment Receipts Box */}
          <Section title={`Payment Receipts (${linkedReceipts.length})`}>
            {linkedReceipts.length === 0 ? (
              <div className="text-sm text-neutral-500">
                No payment receipts issued against this invoice yet.
                {inv.state === "Finalized" && s.balance > 0 && (
                  <button
                    className="btn btn-sm btn-primary w-full mt-2"
                    onClick={() => setPayOpen(true)}
                  >
                    Issue First Payment Receipt
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {linkedReceipts.map((r) => (
                  <div key={r.id} className="rounded-lg border border-border p-3 bg-neutral-50/50">
                    <div className="flex justify-between items-start font-bold">
                      <span className="font-mono text-sm text-neutral-900">{r.number}</span>
                      <span className="text-emerald-700">{inr(r.amount)}</span>
                    </div>
                    <div className="text-xs text-neutral-600 mt-1">
                      {fmtDate(r.date)} · {r.method}
                    </div>
                    {r.reference && (
                      <div className="text-xs font-mono text-neutral-500">Ref: {r.reference}</div>
                    )}
                    <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2 text-xs">
                      <button
                        className="underline font-semibold"
                        onClick={() => go("receipt", { id: r.id })}
                      >
                        View Receipt Voucher
                      </button>
                      <button
                        className="underline"
                        onClick={() => go("receipt", { id: r.id, print: true })}
                      >
                        Print
                      </button>
                    </div>
                  </div>
                ))}

                {inv.state === "Finalized" && s.balance > 0 && (
                  <button
                    className="btn btn-sm w-full mt-2"
                    onClick={() => setPayOpen(true)}
                  >
                    + Issue Additional Receipt
                  </button>
                )}
              </div>
            )}
          </Section>

          <Section title="Invoice History">
            <ul className="space-y-1 text-sm">
              {inv.history.map((h) => (
                <li key={h.id}>
                  <b>{fmtDate(h.date)}</b> — {h.text}
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>

      <PaymentReceiptModal
        open={payOpen}
        inv={inv}
        onClose={() => setPayOpen(false)}
        onCreated={(rec) => go("receipt", { id: rec.id })}
      />
      <VoidDialog inv={voidOpen ? inv : null} onClose={() => setVoidOpen(false)} />
      <ConfirmDialog
        open={fin}
        title="Finalize invoice?"
        confirmLabel="Finalize"
        onCancel={() => setFin(false)}
        onConfirm={finalize}
        message={`After finalizing, ${inv.number} (${inr(s.grand)}) can no longer be edited.`}
      />
    </div>
  );
}

/* ---------------- 9.9 Invoice Register ---------------- */
export function InvoiceRegister() {
  const { data, go, route } = useCRM();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(route.params.status || "");
  const [proj, setProj] = useState("");
  const rows = data.invoices
    .map((i) => {
      const p = data.projects.find((x) => x.id === i.projectId);
      return {
        ...i,
        s: invoiceSummary(i),
        pName: p?.name || "—",
        pCode: p?.code || "",
        customer: p?.customerName || "—",
      };
    })
    .filter(
      (r) =>
        matches(q, r.number, r.pName, r.pCode, r.customer, r.stage) &&
        (!status ||
          (status === "Pending"
            ? ["Unpaid", "Partially Paid", "Overdue"].includes(r.s.status)
            : r.s.status === status)) &&
        (!proj || r.projectId === proj)
    );
  const cols = [
    {
      key: "number",
      label: "Invoice No.",
      render: (r) => <span className="font-semibold">{r.number}</span>,
    },
    {
      key: "pName",
      label: "Project",
      render: (r) => (
        <button
          className="underline"
          onClick={(e) => {
            e.stopPropagation();
            go("project", { id: r.projectId });
          }}
        >
          {r.pCode} · {r.pName}
        </button>
      ),
    },
    { key: "customer", label: "Customer" },
    { key: "stage", label: "Stage" },
    { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
    {
      key: "grand",
      label: "Grand Total",
      align: "right",
      sortValue: (r) => r.s.grand,
      render: (r) => inr(r.s.grand),
    },
    {
      key: "paid",
      label: "Paid",
      align: "right",
      sortValue: (r) => r.s.paid,
      render: (r) => inr(r.s.paid),
    },
    {
      key: "bal",
      label: "Balance Due",
      align: "right",
      sortValue: (r) => r.s.balance,
      render: (r) => inr(r.s.balance),
    },
    {
      key: "st",
      label: "Status",
      sortValue: (r) => r.s.status,
      render: (r) => <Pill>{r.s.status}</Pill>,
    },
  ];
  return (
    <div>
      <PageHeader
        title="Invoice Register"
        subtitle="All invoices across projects. New invoices are created from a project."
        onBack={() => go("invoices")}
      />
      <Toolbar>
        <SearchBox value={q} onChange={setQ} placeholder="Search invoice no., project, customer…" />
        <Field label="Payment status">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="All"
            options={["Draft", "Unpaid", "Partially Paid", "Paid", "Overdue", "Voided", "Pending"]}
          />
        </Field>
        <Field label="Project">
          <Select
            value={proj}
            onChange={(e) => setProj(e.target.value)}
            placeholder="All"
            options={data.projects.map((p) => ({ value: p.id, label: `${p.code} · ${p.name}` }))}
          />
        </Field>
      </Toolbar>
      <DataTable
        columns={cols}
        rows={rows}
        onRowClick={(r) => go("invoice", { id: r.id })}
        initialSort={{ key: "date", dir: "desc" }}
      />
    </div>
  );
}
