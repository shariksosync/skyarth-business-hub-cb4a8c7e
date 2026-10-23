import { useState } from "react";
import { useCRM, empName } from "../store";
import { LEAD_SOURCES, LEAD_STATUSES } from "../data";
import { ConfirmDialog, DataTable, Field, Icon, Input, KV, Modal, PageHeader, Pill, SearchBox, Section, Select, Textarea, Toolbar } from "../ui";
import { fmtDate, inr, matches, nextCode, num, todayISO, uid } from "../utils";
import { ProjectFormModal } from "./Invoices";

const blank = (emp) => ({ customerName: "", companyName: "", phone: "", email: "", billingAddress: "", projectName: "", siteAddress: "", city: "", source: "Website", employeeId: emp, value: "", followUpDate: "", requirements: "", notes: "", status: "New" });

function LeadForm({ initial, onClose }) {
  const { data, update, toast } = useCRM();
  const [f, setF] = useState(initial || blank(data.settings.defaultEmployeeId));
  const [err, setErr] = useState({});
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = () => {
    const e = {};
    if (!f.customerName.trim()) e.customerName = "Required";
    if (!/^\d{10}$/.test(String(f.phone).trim())) e.phone = "Enter a 10-digit phone";
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Invalid email";
    if (!f.projectName.trim()) e.projectName = "Required";
    const dup = data.leads.find((l) => l.id !== f.id && l.phone === f.phone.trim() && l.projectName.trim().toLowerCase() === f.projectName.trim().toLowerCase());
    if (dup) e.phone = `Duplicate of ${dup.code} (same phone and project)`;
    setErr(e);
    if (Object.keys(e).length) return;
    const rec = { ...f, phone: f.phone.trim(), value: num(f.value) };
    if (f.id) update("leads", (ls) => ls.map((l) => (l.id === f.id ? rec : l)));
    else update("leads", (ls) => [...ls, { ...rec, id: uid("lead"), code: nextCode("L-", ls.map((l) => l.code), 1001), createdDate: todayISO(), projectId: "", siteVisits: [], history: [{ id: uid("h"), date: todayISO(), text: "Lead created", type: "Note" }] }]);
    toast(f.id ? "Lead updated" : "Lead created");
    onClose();
  };
  return (
    <Modal open title={f.id ? `Edit ${f.code}` : "New lead"} onClose={onClose} wide footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={save}>Save lead</button></>}>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Customer name" required error={err.customerName}><Input value={f.customerName} onChange={set("customerName")} /></Field>
        <Field label="Company name"><Input value={f.companyName} onChange={set("companyName")} /></Field>
        <Field label="Phone" required error={err.phone}><Input value={f.phone} onChange={set("phone")} /></Field>
        <Field label="Email" error={err.email}><Input value={f.email} onChange={set("email")} /></Field>
        <Field label="Billing address" className="sm:col-span-2"><Input value={f.billingAddress} onChange={set("billingAddress")} /></Field>
        <Field label="Project name" required error={err.projectName}><Input value={f.projectName} onChange={set("projectName")} /></Field>
        <Field label="City"><Input value={f.city} onChange={set("city")} /></Field>
        <Field label="Project site address" className="sm:col-span-2"><Input value={f.siteAddress} onChange={set("siteAddress")} /></Field>
        <Field label="Lead source"><Select value={f.source} onChange={set("source")} options={LEAD_SOURCES} /></Field>
        <Field label="Assigned employee"><Select value={f.employeeId} onChange={set("employeeId")} options={data.employees.map((e) => ({ value: e.id, label: e.name }))} /></Field>
        <Field label="Estimated value (₹)"><Input type="number" min="0" value={f.value} onChange={set("value")} /></Field>
        <Field label="Follow-up date"><Input type="date" value={f.followUpDate} onChange={set("followUpDate")} /></Field>
        <Field label="Status"><Select value={f.status} onChange={set("status")} options={LEAD_STATUSES} /></Field>
        <Field label="Requirements" className="sm:col-span-2"><Textarea value={f.requirements} onChange={set("requirements")} /></Field>
        <Field label="Notes" className="sm:col-span-2"><Textarea value={f.notes} onChange={set("notes")} /></Field>
      </div>
    </Modal>
  );
}

export function Leads() {
  const { data, go, route, update, toast } = useCRM();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(route.params.status || "");
  const [emp, setEmp] = useState("");
  const [from, setFrom] = useState("");
  const [form, setForm] = useState(route.params.new ? {} : null);
  const [del, setDel] = useState(null);
  const active = route.params.status === "active";
  const rows = data.leads.filter((l) => matches(q, l.code, l.customerName, l.phone, l.projectName, l.companyName)
    && (status === "active" ? !["Converted", "Lost"].includes(l.status) : !status || l.status === status) && (!emp || l.employeeId === emp) && (!from || l.createdDate >= from));
  const cols = [
    { key: "code", label: "Lead ID" }, { key: "customerName", label: "Customer", render: (r) => <span className="font-semibold">{r.customerName}</span> },
    { key: "companyName", label: "Company" }, { key: "phone", label: "Phone" }, { key: "email", label: "Email" },
    { key: "projectName", label: "Project" }, { key: "city", label: "Location" }, { key: "source", label: "Source" },
    { key: "employeeId", label: "Assigned", sortValue: (r) => empName(data, r.employeeId), render: (r) => empName(data, r.employeeId) },
    { key: "value", label: "Est. Value", align: "right", render: (r) => inr(r.value) },
    { key: "followUpDate", label: "Follow-up", render: (r) => fmtDate(r.followUpDate) },
    { key: "status", label: "Status", render: (r) => <Pill>{r.status}</Pill> },
    { key: "createdDate", label: "Created", render: (r) => fmtDate(r.createdDate) },
    { key: "actions", label: "Actions", sortable: false, render: (r) => (<div className="flex gap-1">
      <button className="btn btn-sm" onClick={() => go("lead", { id: r.id })}>View</button>
      <button className="btn btn-sm" onClick={() => setForm(r)}>Edit</button>
      <button className="btn btn-sm" onClick={() => setDel(r)}>Delete</button></div>) },
  ];
  return (
    <div>
      <PageHeader title="Leads" subtitle={active ? "Showing active leads" : "Potential residential and commercial projects."}>
        <button className="btn btn-primary" onClick={() => setForm({})}><Icon name="plus" size={16} /> New Lead</button>
      </PageHeader>
      <Toolbar>
        <SearchBox value={q} onChange={setQ} placeholder="Search name, phone, project, lead ID…" />
        <Field label="Status"><Select value={status} onChange={(e) => setStatus(e.target.value)} placeholder="All" options={[{ value: "active", label: "Active (open)" }, ...LEAD_STATUSES]} /></Field>
        <Field label="Employee"><Select value={emp} onChange={(e) => setEmp(e.target.value)} placeholder="All" options={data.employees.map((e) => ({ value: e.id, label: e.name }))} /></Field>
        <Field label="Created from"><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
      </Toolbar>
      <DataTable columns={cols} rows={rows} onRowClick={(r) => go("lead", { id: r.id })} initialSort={{ key: "createdDate", dir: "desc" }} />
      {form && <LeadForm initial={form.id ? form : null} onClose={() => setForm(null)} />}
      <ConfirmDialog open={!!del} title="Delete lead?" confirmLabel="Delete" onCancel={() => setDel(null)}
        message={del?.projectId ? `${del.code} is linked to a project and cannot be deleted.` : `Delete ${del?.code} · ${del?.customerName}? This cannot be undone.`}
        disabled={!!del?.projectId} onConfirm={() => { update("leads", (ls) => ls.filter((l) => l.id !== del.id)); toast("Lead deleted"); setDel(null); }} />
    </div>
  );
}

export function LeadDetails() {
  const { data, go, route, update, toast } = useCRM();
  const l = data.leads.find((x) => x.id === route.params.id);
  const [edit, setEdit] = useState(false);
  const [note, setNote] = useState("");
  const [visit, setVisit] = useState({ date: todayISO(), by: "", notes: "" });
  const [conv, setConv] = useState(false);
  if (!l) return <div className="card p-10 text-center">Lead not found. <button className="btn" onClick={() => go("leads")}>Back</button></div>;
  const patch = (fn) => update("leads", (ls) => ls.map((x) => (x.id === l.id ? fn(x) : x)));
  const addNote = () => { if (!note.trim()) return; patch((x) => ({ ...x, history: [...x.history, { id: uid("h"), date: todayISO(), text: note.trim(), type: "Note" }] })); setNote(""); toast("Note added"); };
  const addVisit = () => {
    if (!visit.date) return;
    patch((x) => ({ ...x, status: ["New", "Contacted", "Qualified"].includes(x.status) ? "Site Visit Scheduled" : x.status, siteVisits: [...(x.siteVisits || []), { id: uid("sv"), ...visit, by: visit.by || x.employeeId }], history: [...x.history, { id: uid("h"), date: todayISO(), text: `Site visit recorded for ${fmtDate(visit.date)}`, type: "Visit" }] }));
    setVisit({ date: todayISO(), by: "", notes: "" }); toast("Site visit recorded");
  };
  const proj = data.projects.find((p) => p.id === l.projectId);
  const quotes = data.quotations.filter((q) => q.leadId === l.id);
  return (
    <div className="space-y-4">
      <PageHeader title={`${l.code} · ${l.customerName}`} subtitle={`${l.projectName} · ${l.status}`} onBack={() => go("leads")}>
        <button className="btn" onClick={() => setEdit(true)}>Edit</button>
        <button className="btn" onClick={() => go("quotationForm", { leadId: l.id })}>Create Quotation</button>
        {proj ? <button className="btn btn-primary" onClick={() => go("project", { id: proj.id })}>Open Project {proj.code}</button>
          : <button className="btn btn-primary" disabled={l.status === "Lost"} onClick={() => setConv(true)}>Convert to Project</button>}
      </PageHeader>
      <Section title="Lead details">
        <KV items={[["Customer", l.customerName], ["Company", l.companyName], ["Phone", l.phone], ["Email", l.email], ["Billing Address", l.billingAddress], ["Project", l.projectName], ["Site Address", l.siteAddress], ["City", l.city], ["Source", l.source], ["Assigned", empName(data, l.employeeId)], ["Estimated Value", inr(l.value)], ["Follow-up", fmtDate(l.followUpDate)], ["Requirements", l.requirements], ["Notes", l.notes], ["Created", fmtDate(l.createdDate)]]} />
      </Section>
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Interaction history">
          <ul className="mb-3 space-y-1 text-sm">{l.history.map((h) => <li key={h.id}><b>{fmtDate(h.date)}</b> · {h.type} — {h.text}</li>)}</ul>
          <div className="flex gap-2"><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note or call summary" /><button className="btn" onClick={addNote}>Add</button></div>
        </Section>
        <Section title="Site visits">
          <ul className="mb-3 space-y-1 text-sm">{(l.siteVisits || []).length === 0 ? <li>No site visits recorded.</li> : l.siteVisits.map((v) => <li key={v.id}><b>{fmtDate(v.date)}</b> · {empName(data, v.by)} — {v.notes || "—"}</li>)}</ul>
          <div className="grid gap-2 sm:grid-cols-3">
            <Input type="date" value={visit.date} onChange={(e) => setVisit({ ...visit, date: e.target.value })} aria-label="Visit date" />
            <Select value={visit.by} onChange={(e) => setVisit({ ...visit, by: e.target.value })} placeholder="Assigned employee" options={data.employees.map((e) => ({ value: e.id, label: e.name }))} />
            <Input value={visit.notes} onChange={(e) => setVisit({ ...visit, notes: e.target.value })} placeholder="Visit notes" />
          </div>
          <button className="btn mt-2" onClick={addVisit}>Record site visit</button>
        </Section>
      </div>
      <Section title="Quotations for this lead">
        {quotes.length === 0 ? <p className="text-sm">No quotations yet.</p> : <ul className="space-y-1 text-sm">{quotes.map((q) => <li key={q.id}><button className="underline" onClick={() => go("quotation", { id: q.id })}>{q.number}</button> · {fmtDate(q.date)} · {q.status}</li>)}</ul>}
      </Section>
      {edit && <LeadForm initial={l} onClose={() => setEdit(false)} />}
      <ProjectFormModal open={conv} onClose={() => setConv(false)} onSaved={(p) => go("project", { id: p.id })}
        initial={{ name: l.projectName, customerName: l.customerName, companyName: l.companyName, phone: l.phone, email: l.email, billingAddress: l.billingAddress, siteAddress: l.siteAddress, city: l.city, siteContact: l.customerName, startDate: todayISO(), status: "Planning", employeeId: l.employeeId, value: l.value || "", quotationId: quotes.find((q) => q.status === "Accepted" && !q.projectId)?.id || "", leadId: l.id, notes: "" }} />
    </div>
  );
}
