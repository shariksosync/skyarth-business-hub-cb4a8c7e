import { useState } from "react";
import { useCRM, empName } from "../store";
import { QUOTATION_STATUSES } from "../data";
import { QuotationDocument } from "../Documents";
import { LineItemsEditor, TotalsBox, blankItem, validateItems } from "../LineItems";
import { ConfirmDialog, DataTable, Field, Icon, Input, PageHeader, Pill, SearchBox, Section, Select, Textarea, Toolbar } from "../ui";
import { addDays, docTotals, fmtDate, inr, matches, nextCode, nextNumber, num, round2, todayISO, uid } from "../utils";

export function Quotations() {
  const { data, go, route } = useCRM();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(route.params.status || "");
  const [emp, setEmp] = useState("");
  const rows = data.quotations.map((x) => ({ ...x, t: docTotals(x.items, x.additionalCharges, x.taxTreatment) }))
    .filter((x) => matches(q, x.number, x.customerName, x.projectName, x.location) && (!emp || x.employeeId === emp)
      && (!status || (status === "Pending" ? ["Draft", "Sent", "Viewed", "Under Negotiation"].includes(x.status) : x.status === status)));
  const cols = [
    { key: "number", label: "Quotation No.", render: (r) => <span className="font-semibold">{r.number}</span> },
    { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
    { key: "validUntil", label: "Valid Until", render: (r) => fmtDate(r.validUntil) },
    { key: "customerName", label: "Customer" },
    { key: "projectName", label: "Project" },
    { key: "location", label: "Location" },
    { key: "employeeId", label: "Assigned", render: (r) => empName(data, r.employeeId) },
    { key: "sub", label: "Subtotal", align: "right", sortValue: (r) => r.t.subtotal, render: (r) => inr(r.t.subtotal) },
    { key: "tax", label: "Tax", align: "right", sortValue: (r) => r.t.tax, render: (r) => inr(r.t.tax) },
    { key: "grand", label: "Grand Total", align: "right", sortValue: (r) => r.t.grand, render: (r) => inr(r.t.grand) },
    { key: "status", label: "Status", render: (r) => <Pill>{r.status}</Pill> },
    { key: "actions", label: "Actions", sortable: false, render: (r) => (
      <div className="flex gap-1"><button className="btn btn-sm" onClick={() => go("quotation", { id: r.id })}>View</button>
        <button className="btn btn-sm" onClick={() => go("quotationForm", { id: r.id })}>Edit</button></div>) },
  ];
  return (
    <div>
      <PageHeader title="Quotations" subtitle="Quotations for uPVC windows, doors and framing projects.">
        <button className="btn btn-primary" onClick={() => go("quotationForm", {})}><Icon name="plus" size={16} /> New Quotation</button>
      </PageHeader>
      <Toolbar>
        <SearchBox value={q} onChange={setQ} placeholder="Search number, customer, project…" />
        <Field label="Status"><Select value={status} onChange={(e) => setStatus(e.target.value)} placeholder="All" options={[...QUOTATION_STATUSES, "Pending"]} /></Field>
        <Field label="Employee"><Select value={emp} onChange={(e) => setEmp(e.target.value)} placeholder="All" options={data.employees.map((e) => ({ value: e.id, label: e.name }))} /></Field>
      </Toolbar>
      <DataTable columns={cols} rows={rows} onRowClick={(r) => go("quotation", { id: r.id })} initialSort={{ key: "date", dir: "desc" }} />
    </div>
  );
}

const CUST = ["customerName", "companyName", "phone", "email", "billingAddress", "siteAddress", "location", "projectName"];

export function QuotationForm() {
  const { data, go, route, update, toast } = useCRM();
  const st = data.settings;
  const ex = route.params.id ? data.quotations.find((x) => x.id === route.params.id) : null;
  const [f, setF] = useState(() => {
    if (ex) return { ...ex, items: ex.items.map((i) => ({ ...i })) };
    const base = { number: nextNumber(st.quotationPrefix, data.quotations.map((x) => x.number)), date: todayISO(), validUntil: addDays(todayISO(), st.quotationValidityDays), status: "Draft", projectId: "", leadId: "", employeeId: st.defaultEmployeeId, preparedBy: st.defaultEmployeeId, items: [blankItem(st.defaultTaxRate)], additionalCharges: 0, taxTreatment: st.taxTreatment, notes: "", terms: st.quotationTerms, history: [] };
    CUST.forEach((k) => (base[k] = ""));
    const l = data.leads.find((x) => x.id === route.params.leadId);
    if (l) Object.assign(base, { leadId: l.id, customerName: l.customerName, companyName: l.companyName, phone: l.phone, email: l.email, billingAddress: l.billingAddress, siteAddress: l.siteAddress, location: l.city, projectName: l.projectName, employeeId: l.employeeId, projectId: l.projectId || "" });
    const p = data.projects.find((x) => x.id === route.params.projectId);
    if (p) Object.assign(base, { projectId: p.id, leadId: p.leadId || "", customerName: p.customerName, companyName: p.companyName, phone: p.phone, email: p.email, billingAddress: p.billingAddress, siteAddress: p.siteAddress, location: p.city, projectName: p.name });
    return base;
  });
  const [err, setErr] = useState({});
  const t = docTotals(f.items, f.additionalCharges, f.taxTreatment);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = () => {
    const e = {};
    if (!f.number.trim()) e.number = "Required";
    else if (data.quotations.some((x) => x.id !== ex?.id && x.number === f.number.trim())) e.number = "Number already used";
    if (!f.customerName.trim()) e.customerName = "Required";
    if (!f.projectName.trim()) e.projectName = "Required";
    if (!/^\d{10}$/.test(String(f.phone))) e.phone = "Enter a 10-digit phone";
    if (f.validUntil < f.date) e.validUntil = "Cannot be before quotation date";
    const li = validateItems(f.items); if (li) e.items = li;
    setErr(e);
    if (Object.keys(e).length) return;
    const p = data.projects.find((x) => x.id === f.projectId);
    const rec = { ...f, number: f.number.trim(), projectCode: p?.code || "", additionalCharges: round2(num(f.additionalCharges)), id: ex?.id || uid("q"),
      history: [...(f.history || []), { id: uid("h"), date: todayISO(), text: ex ? "Quotation edited" : "Quotation created" }] };
    update("quotations", (xs) => (ex ? xs.map((x) => (x.id === rec.id ? rec : x)) : [...xs, rec]));
    toast(`Quotation ${rec.number} saved`);
    go("quotation", { id: rec.id });
  };
  return (
    <div className="space-y-4">
      <PageHeader title={ex ? `Edit ${ex.number}` : "New Quotation"} onBack={() => go("quotations")}>
        <button className="btn" onClick={() => go("quotations")}>Cancel</button>
        <button className="btn btn-primary" onClick={save}>Save</button>
      </PageHeader>
      <Section title="Customer & project">
        <div className="mb-3 grid gap-3 sm:grid-cols-2">
          <Field label="Fill from lead"><Select value={f.leadId} placeholder="—" options={data.leads.map((l) => ({ value: l.id, label: `${l.code} · ${l.customerName}` }))}
            onChange={(e) => { const l = data.leads.find((x) => x.id === e.target.value); setF(l ? { ...f, leadId: l.id, customerName: l.customerName, companyName: l.companyName, phone: l.phone, email: l.email, billingAddress: l.billingAddress, siteAddress: l.siteAddress, location: l.city, projectName: l.projectName } : { ...f, leadId: "" }); }} /></Field>
          <Field label="Link to project"><Select value={f.projectId} placeholder="—" options={data.projects.map((p) => ({ value: p.id, label: `${p.code} · ${p.name}` }))} onChange={set("projectId")} /></Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Customer name" required error={err.customerName}><Input value={f.customerName} onChange={set("customerName")} /></Field>
          <Field label="Company"><Input value={f.companyName} onChange={set("companyName")} /></Field>
          <Field label="Phone" required error={err.phone}><Input value={f.phone} onChange={set("phone")} /></Field>
          <Field label="Email"><Input value={f.email} onChange={set("email")} /></Field>
          <Field label="Project name" required error={err.projectName}><Input value={f.projectName} onChange={set("projectName")} /></Field>
          <Field label="Location"><Input value={f.location} onChange={set("location")} /></Field>
          <Field label="Billing address"><Input value={f.billingAddress} onChange={set("billingAddress")} /></Field>
          <Field label="Site address"><Input value={f.siteAddress} onChange={set("siteAddress")} /></Field>
        </div>
      </Section>
      <Section title="Quotation details">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Quotation number" required error={err.number}><Input value={f.number} onChange={set("number")} /></Field>
          <Field label="Date"><Input type="date" value={f.date} onChange={set("date")} /></Field>
          <Field label="Valid until" error={err.validUntil}><Input type="date" value={f.validUntil} onChange={set("validUntil")} /></Field>
          <Field label="Status"><Select value={f.status} onChange={set("status")} options={QUOTATION_STATUSES} /></Field>
          <Field label="Assigned / prepared by"><Select value={f.employeeId} onChange={(e) => setF({ ...f, employeeId: e.target.value, preparedBy: e.target.value })} options={data.employees.map((e) => ({ value: e.id, label: e.name }))} /></Field>
          <Field label="Tax treatment"><Select value={f.taxTreatment} onChange={set("taxTreatment")} options={[{ value: "CGST_SGST", label: "CGST + SGST" }, { value: "IGST", label: "IGST" }]} /></Field>
          <Field label="Additional charges (₹)"><Input type="number" min="0" value={f.additionalCharges} onChange={set("additionalCharges")} /></Field>
        </div>
      </Section>
      <Section title="Line items">
        <LineItemsEditor items={f.items} onChange={(items) => setF({ ...f, items })} taxRates={st.taxRates} defaultTaxRate={st.defaultTaxRate} error={err.items} />
        <div className="mt-4 flex flex-col gap-4 md:flex-row">
          <div className="flex-1 space-y-3"><Field label="Notes"><Textarea value={f.notes} onChange={set("notes")} /></Field><Field label="Terms"><Textarea value={f.terms} onChange={set("terms")} /></Field></div>
          <TotalsBox t={t} treatment={f.taxTreatment} />
        </div>
      </Section>
    </div>
  );
}

export function QuotationView() {
  const { data, go, route, update, toast } = useCRM();
  const qt = data.quotations.find((x) => x.id === route.params.id);
  const [conf, setConf] = useState(null);
  if (!qt) return <div className="card p-10 text-center">Quotation not found. <button className="btn" onClick={() => go("quotations")}>Back</button></div>;
  const proj = data.projects.find((p) => p.id === qt.projectId);
  const setStatus = (s) => {
    update("quotations", (xs) => xs.map((x) => (x.id === qt.id ? { ...x, status: s, history: [...x.history, { id: uid("h"), date: todayISO(), text: `Marked as ${s}` }] } : x)));
    toast(`${qt.number} marked as ${s}`); setConf(null);
  };
  const dup = () => {
    const rec = { ...qt, id: uid("q"), number: nextNumber(data.settings.quotationPrefix, data.quotations.map((x) => x.number)), status: "Draft", date: todayISO(), validUntil: addDays(todayISO(), data.settings.quotationValidityDays), projectId: "", projectCode: "", items: qt.items.map((i) => ({ ...i, id: uid("li") })), history: [{ id: uid("h"), date: todayISO(), text: `Duplicated from ${qt.number}` }] };
    update("quotations", (xs) => [...xs, rec]); toast(`Duplicated as ${rec.number}`); go("quotationForm", { id: rec.id });
  };
  const toProject = () => {
    const t = docTotals(qt.items, qt.additionalCharges, qt.taxTreatment);
    const id = uid("proj"), code = nextCode("P-", data.projects.map((p) => p.code), 2001);
    const l = data.leads.find((x) => x.id === qt.leadId);
    const p = { id, code, name: qt.projectName, leadId: qt.leadId || "", quotationId: qt.id, customerName: qt.customerName, companyName: qt.companyName, phone: qt.phone, email: qt.email, billingAddress: qt.billingAddress, siteAddress: qt.siteAddress, city: qt.location, siteContact: qt.customerName, startDate: todayISO(), status: "Planning", employeeId: qt.employeeId, value: t.grand, notes: "" };
    update("projects", (ps) => [...ps, p]);
    update("quotations", (xs) => xs.map((x) => (x.id === qt.id ? { ...x, projectId: id, projectCode: code, history: [...x.history, { id: uid("h"), date: todayISO(), text: `Project ${code} created` }] } : x)));
    if (l) update("leads", (ls) => ls.map((x) => (x.id === l.id ? { ...x, status: "Converted", projectId: id } : x)));
    toast(`Project ${code} created`); setConf(null); go("project", { id });
  };
  return (
    <div className="space-y-4">
      <PageHeader title={`Quotation ${qt.number}`} subtitle={`${qt.customerName} · ${qt.projectName} · ${qt.status}`} onBack={() => go("quotations")}>
        <button className="btn" onClick={() => go("quotationForm", { id: qt.id })}>Edit</button>
        <button className="btn" onClick={dup}>Duplicate</button>
        {["Draft", "Viewed"].includes(qt.status) && <button className="btn" onClick={() => setStatus("Sent")}>Mark as Sent</button>}
        {!["Accepted", "Rejected"].includes(qt.status) && <button className="btn" onClick={() => setConf("Accepted")}>Mark Accepted</button>}
        {!["Accepted", "Rejected"].includes(qt.status) && <button className="btn" onClick={() => setConf("Rejected")}>Mark Rejected</button>}
        {qt.status === "Accepted" && !proj && <button className="btn btn-primary" onClick={() => setConf("project")}>Create Project</button>}
        {proj && <button className="btn btn-primary" onClick={() => go("invoiceForm", { projectId: proj.id })}>Generate Tax Invoice</button>}
        <button className="btn" onClick={() => window.print()}><Icon name="print" size={16} /> Print</button>
      </PageHeader>
      <div className="grid gap-4 xl:grid-cols-[1fr_20rem]">
        <div className="overflow-x-auto"><QuotationDocument q={{ ...qt, projectCode: proj?.code }} settings={data.settings} employees={data.employees} /></div>
        <Section title="History" className="no-print"><ul className="space-y-1 text-sm">{qt.history.map((h) => <li key={h.id}><b>{fmtDate(h.date)}</b> — {h.text}</li>)}</ul>
          {proj && <button className="btn btn-sm mt-3" onClick={() => go("project", { id: proj.id })}>Open project {proj.code}</button>}</Section>
      </div>
      <ConfirmDialog open={!!conf} confirmLabel="Confirm" onCancel={() => setConf(null)} onConfirm={() => (conf === "project" ? toProject() : setStatus(conf))}
        message={conf === "project" ? `Create a new project from ${qt.number}? The contract value will be ${inr(docTotals(qt.items, qt.additionalCharges, qt.taxTreatment).grand)}.` : `Mark ${qt.number} as ${conf}?`} />
    </div>
  );
}
