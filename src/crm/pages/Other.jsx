import { useState } from "react";
import { useCRM, empName } from "../store";
import { DEPARTMENTS, EMPLOYMENT_STATUSES, INVENTORY_CATEGORIES, UNITS } from "../data";
import { ConfirmDialog, DataTable, Field, Icon, Input, KV, Logo, Modal, PageHeader, Pill, SearchBox, Section, Select, StatCard, Textarea, Toolbar } from "../ui";
import { docTotals, fmtDate, inr, invoiceSummary, matches, nextCode, num, projectSummary, round2, stockAvailable, stockStatus, todayISO, uid } from "../utils";

/* ---------------- Dashboard ---------------- */
export function Dashboard() {
  const { data, go } = useCRM();
  const L = data.leads, Q = data.quotations;
  const inv = data.invoices.map((i) => ({ ...i, s: invoiceSummary(i), p: data.projects.find((p) => p.id === i.projectId) }));
  const pending = inv.filter((i) => i.s.valid).reduce((a, i) => a + i.s.balance, 0);
  const active = L.filter((l) => !["Converted", "Lost"].includes(l.status)).length;
  const pendQ = Q.filter((q) => ["Draft", "Sent", "Viewed", "Under Negotiation"].includes(q.status)).length;
  const fups = L.filter((l) => l.followUpDate && !["Converted", "Lost"].includes(l.status)).sort((a, b) => a.followUpDate.localeCompare(b.followUpDate));
  const totals = data.projects.map((p) => projectSummary(p, data.invoices)).reduce((a, s) => ({ i: a.i + s.invoiced, p: a.p + s.paid }), { i: 0, p: 0 });
  const pct = totals.i ? Math.round((totals.p / totals.i) * 100) : 0;
  const byStatus = {}; L.forEach((l) => (byStatus[l.status] = (byStatus[l.status] || 0) + 1));
  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard" subtitle={`${data.settings.legalName} · business overview (demo data)`} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Leads" value={L.length} onClick={() => go("leads")} />
        <StatCard label="Active Leads" value={active} onClick={() => go("leads", { status: "active" })} />
        <StatCard label="Total Quotations" value={Q.length} onClick={() => go("quotations")} />
        <StatCard label="Pending Quotations" value={pendQ} onClick={() => go("quotations", { status: "Pending" })} />
        <StatCard label="Total Projects" value={data.projects.length} onClick={() => go("projects")} />
        <StatCard label="Total Tax Invoices" value={data.invoices.length} onClick={() => go("register")} />
        <StatCard label="Pending Payments" value={inr(pending)} onClick={() => go("register", { status: "Pending" })} />
        <StatCard label="Total Employees" value={data.employees.length} onClick={() => go("employees")} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Collections">
          <div className="text-sm">Received {inr(totals.p)} of {inr(totals.i)} invoiced ({pct}%)</div>
          <div className="mt-2 h-3 w-full rounded-full border border-foreground"><div className="h-full rounded-full bg-foreground" style={{ width: `${pct}%` }} /></div>
          <div className="mt-4 space-y-1 text-sm">{Object.entries(byStatus).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2"><span className="w-40">{k}</span><div className="h-2 rounded-sm bg-foreground" style={{ width: `${(v / L.length) * 60}%` }} /><span>{v}</span></div>))}</div>
        </Section>
        <Section title="Upcoming follow-ups">
          <DataTable compact rows={fups.slice(0, 6)} onRowClick={(r) => go("lead", { id: r.id })} empty="No follow-ups scheduled." columns={[
            { key: "customerName", label: "Customer" }, { key: "followUpDate", label: "Date", render: (r) => fmtDate(r.followUpDate) },
            { key: "employeeId", label: "Assigned", render: (r) => empName(data, r.employeeId) }, { key: "notes", label: "Notes", sortable: false }]} />
        </Section>
      </div>
      <Section title="Recent leads" actions={<button className="btn btn-sm" onClick={() => go("leads")}>View all</button>}>
        <DataTable compact rows={[...L].sort((a, b) => b.createdDate.localeCompare(a.createdDate)).slice(0, 5)} onRowClick={(r) => go("lead", { id: r.id })} columns={[
          { key: "code", label: "Lead ID" }, { key: "customerName", label: "Customer" }, { key: "projectName", label: "Project" }, { key: "phone", label: "Phone" },
          { key: "status", label: "Status", render: (r) => <Pill>{r.status}</Pill> }, { key: "employeeId", label: "Assigned", render: (r) => empName(data, r.employeeId) }]} />
      </Section>
      <div className="grid gap-4 xl:grid-cols-2">
        <Section title="Recent quotations" actions={<button className="btn btn-sm" onClick={() => go("quotations")}>View all</button>}>
          <DataTable compact rows={[...Q].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)} onRowClick={(r) => go("quotation", { id: r.id })} columns={[
            { key: "number", label: "Number" }, { key: "customerName", label: "Customer" }, { key: "projectName", label: "Project" }, { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
            { key: "t", label: "Total", align: "right", render: (r) => inr(docTotals(r.items, r.additionalCharges, r.taxTreatment).grand) }, { key: "status", label: "Status", render: (r) => <Pill>{r.status}</Pill> }]} />
        </Section>
        <Section title="Recent tax invoices" actions={<button className="btn btn-sm" onClick={() => go("register")}>View all</button>}>
          <DataTable compact rows={[...inv].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)} onRowClick={(r) => go("invoice", { id: r.id })} columns={[
            { key: "number", label: "Number" }, { key: "p", label: "Project", render: (r) => r.p?.name }, { key: "c", label: "Customer", render: (r) => r.p?.customerName },
            { key: "date", label: "Date", render: (r) => fmtDate(r.date) }, { key: "g", label: "Amount", align: "right", render: (r) => inr(r.s.grand) }, { key: "st", label: "Status", render: (r) => <Pill>{r.s.status}</Pill> }]} />
        </Section>
      </div>
    </div>
  );
}

/* ---------------- Inventory (Re-exported from dedicated module) ---------------- */
export { Inventory } from "./Inventory";

/* ---------------- Settings ---------------- */
export function Settings() {
  const { data, update, toast, resetData } = useCRM();
  const [f, setF] = useState({ ...data.settings, taxRatesText: data.settings.taxRates.join(", ") });
  const [err, setErr] = useState({});
  const [reset, setReset] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const onLogo = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith("image/")) { setErr({ ...err, logo: "Please choose an image file" }); return; }
    const r = new FileReader(); r.onload = () => setF((x) => ({ ...x, logo: r.result })); r.readAsDataURL(file);
  };
  const save = () => {
    const e = {};
    const rates = f.taxRatesText.split(",").map((s) => s.trim()).filter(Boolean).map(Number);
    if (!rates.length || rates.some((r) => !Number.isFinite(r) || r < 0 || r > 100)) e.taxRates = "Enter comma-separated rates between 0 and 100";
    if (!rates.includes(Number(f.defaultTaxRate))) e.defaultTaxRate = "Default must be one of the rates above";
    if (!f.invoicePrefix.trim()) e.invoicePrefix = "Required";
    if (!f.quotationPrefix.trim()) e.quotationPrefix = "Required";
    if (!(num(f.dueDays) >= 0)) e.dueDays = "Must be 0 or more";
    if (!f.legalName.trim()) e.legalName = "Required";
    setErr(e); if (Object.keys(e).length) return;
    const { taxRatesText, ...rest } = f;
    update("settings", () => ({ ...rest, taxRates: rates, defaultTaxRate: Number(f.defaultTaxRate), dueDays: num(f.dueDays), quotationValidityDays: num(f.quotationValidityDays) }));
    toast("Settings saved");
  };
  return (
    <div className="space-y-4">
      <PageHeader title="Settings" subtitle="Changes apply for this session. Refreshing the browser resets all demo data.">
        <button className="btn" onClick={() => { setF({ ...data.settings, taxRatesText: data.settings.taxRates.join(", ") }); setErr({}); }}>Cancel</button>
        <button className="btn btn-primary" onClick={save}>Save settings</button>
      </PageHeader>
      <Section title="Company information & logo">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Legal business name" required error={err.legalName}><Input value={f.legalName} onChange={set("legalName")} /></Field>
          <Field label="Client / brand name"><Input value={f.companyName} onChange={set("companyName")} /></Field>
          <Field label="Address" className="sm:col-span-2"><Input value={f.address} onChange={set("address")} /></Field>
          <Field label="Phone"><Input value={f.phone} onChange={set("phone")} /></Field>
          <Field label="Email"><Input value={f.email} onChange={set("email")} /></Field>
          <Field label="Website (optional)"><Input value={f.website} onChange={set("website")} /></Field>
          <Field label="GSTIN (leave blank until supplied)"><Input value={f.gstin} onChange={set("gstin")} /></Field>
          <Field label="PAN (optional)"><Input value={f.pan} onChange={set("pan")} /></Field>
          <Field label="Description" className="sm:col-span-2"><Textarea value={f.description} onChange={set("description")} /></Field>
          <div className="sm:col-span-2">
            <div className="mb-1 text-sm font-medium">Company logo</div>
            <div className="flex flex-wrap items-center gap-3"><div className="w-56"><Logo src={f.logo} /></div>
              <input type="file" accept="image/*" onChange={onLogo} aria-label="Upload logo" />
              {f.logo && <button className="btn btn-sm" onClick={() => setF({ ...f, logo: null })}>Remove</button>}</div>
            {err.logo && <div className="mt-1 text-xs font-semibold">⚠ {err.logo}</div>}
            <p className="mt-1 text-xs">The logo is displayed exactly as uploaded, without cropping or recolouring.</p>
          </div>
        </div>
      </Section>
      <Section title="Tax & numbering">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Valid GST rates (%)" error={err.taxRates}><Input value={f.taxRatesText} onChange={set("taxRatesText")} /></Field>
          <Field label="Default tax rate (%)" error={err.defaultTaxRate}><Input type="number" value={f.defaultTaxRate} onChange={set("defaultTaxRate")} /></Field>
          <Field label="Default tax treatment"><Select value={f.taxTreatment} onChange={set("taxTreatment")} options={[{ value: "CGST_SGST", label: "CGST + SGST" }, { value: "IGST", label: "IGST" }]} /></Field>
          <Field label="Invoice number prefix" error={err.invoicePrefix}><Input value={f.invoicePrefix} onChange={set("invoicePrefix")} /></Field>
          <Field label="Quotation number prefix" error={err.quotationPrefix}><Input value={f.quotationPrefix} onChange={set("quotationPrefix")} /></Field>
          <Field label="Currency"><Input value="INR (₹)" disabled /></Field>
          <Field label="Default invoice due period (days)" error={err.dueDays}><Input type="number" min="0" value={f.dueDays} onChange={set("dueDays")} /></Field>
          <Field label="Quotation validity (days)"><Input type="number" min="0" value={f.quotationValidityDays} onChange={set("quotationValidityDays")} /></Field>
          <Field label="Default assigned employee"><Select value={f.defaultEmployeeId} onChange={set("defaultEmployeeId")} options={data.employees.map((e) => ({ value: e.id, label: e.name }))} /></Field>
          <Field label="Default payment terms" className="sm:col-span-2 lg:col-span-3"><Textarea value={f.paymentTerms} onChange={set("paymentTerms")} /></Field>
          <Field label="Default quotation terms" className="sm:col-span-2 lg:col-span-3"><Textarea value={f.quotationTerms} onChange={set("quotationTerms")} /></Field>
        </div>
      </Section>
      <Section title="WhatsApp Cloud API & Communications Gateway">
        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-neutral-900">Current Mode: Browser Direct 1-Click WhatsApp (wa.me)</div>
              <div className="text-xs text-emerald-700 font-semibold mt-0.5">● Active & Operational (Zero API fees, instant delivery)</div>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-300">Live</span>
          </div>
          <p className="text-xs text-neutral-600">
            Direct 1-Click WhatsApp enables launching WhatsApp Web on desktop or the mobile app with pre-formatted milestone updates with no external backend server required.
          </p>
          <div className="border-t border-neutral-200 pt-3">
            <div className="text-xs font-bold text-neutral-800 mb-2">Enterprise Meta Cloud API Gateway (Optional for Full Headless Backend):</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Meta WABA ID (WhatsApp Business Account ID)">
                <Input placeholder="e.g. 1098234872348" value={f.metaWabaId || ""} onChange={set("metaWabaId")} />
              </Field>
              <Field label="Phone Number ID">
                <Input placeholder="e.g. 1029384756102" value={f.metaPhoneId || ""} onChange={set("metaPhoneId")} />
              </Field>
              <Field label="Permanent System User Token" className="sm:col-span-2">
                <Input type="password" placeholder="EAABw..." value={f.metaToken || ""} onChange={set("metaToken")} />
              </Field>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">When Meta API credentials are provided and a backend is connected, automated background server webhooks can trigger directly to WhatsApp Graph API.</p>
          </div>
        </div>
      </Section>

      <Section title="Demo data"><button className="btn" onClick={() => setReset(true)}>Reset all demo data</button></Section>
      <ConfirmDialog open={reset} title="Reset demo data?" confirmLabel="Reset" onCancel={() => setReset(false)} onConfirm={() => { resetData(); setReset(false); toast("Demo data reset"); }}
        message="All changes made in this session will be lost." />
    </div>
  );
}
