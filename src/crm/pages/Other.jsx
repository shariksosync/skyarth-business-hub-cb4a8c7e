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
        <StatCard label="Total Projects" value={data.projects.length} onClick={() => go("invoices")} />
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

/* ---------------- Employees ---------------- */
export function Employees() {
  const { data, update, toast, route, go } = useCRM();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("");
  const [st, setSt] = useState("");
  const [form, setForm] = useState(null);
  const [view, setView] = useState(route.params.view || null);
  const [del, setDel] = useState(null);
  const [err, setErr] = useState({});
  const counts = (id) => ({ leads: data.leads.filter((l) => l.employeeId === id).length, projects: data.projects.filter((p) => p.employeeId === id).length });
  const rows = data.employees.map((e) => ({ ...e, ...counts(e.id) })).filter((e) => matches(q, e.code, e.name, e.phone, e.email, e.designation) && (!dept || e.department === dept) && (!st || e.status === st));
  const save = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Required";
    if (!form.code?.trim()) e.code = "Required";
    else if (data.employees.some((x) => x.id !== form.id && x.code === form.code.trim())) e.code = "Employee ID already exists";
    if (!/^\d{10}$/.test(String(form.phone || ""))) e.phone = "Enter a 10-digit phone";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    setErr(e); if (Object.keys(e).length) return;
    if (form.id) update("employees", (xs) => xs.map((x) => (x.id === form.id ? form : x)));
    else update("employees", (xs) => [...xs, { ...form, id: uid("emp") }]);
    toast(form.id ? "Employee updated" : "Employee added"); setForm(null);
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const v = data.employees.find((e) => e.id === view);
  const doDelete = () => { update("employees", (xs) => xs.filter((x) => x.id !== del.id)); toast("Employee deleted"); setDel(null); };
  const delBlocked = del && (counts(del.id).leads + counts(del.id).projects > 0);
  return (
    <div>
      <PageHeader title="Employees" subtitle="Team members and their assigned work.">
        <button className="btn btn-primary" onClick={() => { setErr({}); setForm({ code: nextCode("E-", data.employees.map((e) => e.code), 101), name: "", designation: "", department: DEPARTMENTS[0], phone: "", email: "", joiningDate: todayISO(), address: "", status: "Active" }); }}><Icon name="plus" size={16} /> Add Employee</button>
      </PageHeader>
      <Toolbar>
        <SearchBox value={q} onChange={setQ} placeholder="Search name, ID, phone, email…" />
        <Field label="Department"><Select value={dept} onChange={(e) => setDept(e.target.value)} placeholder="All" options={DEPARTMENTS} /></Field>
        <Field label="Status"><Select value={st} onChange={(e) => setSt(e.target.value)} placeholder="All" options={EMPLOYMENT_STATUSES} /></Field>
      </Toolbar>
      <DataTable rows={rows} onRowClick={(r) => setView(r.id)} columns={[
        { key: "code", label: "ID" }, { key: "name", label: "Name", render: (r) => <span className="font-semibold">{r.name}</span> }, { key: "designation", label: "Designation" },
        { key: "department", label: "Department" }, { key: "phone", label: "Phone" }, { key: "email", label: "Email" }, { key: "joiningDate", label: "Joined", render: (r) => fmtDate(r.joiningDate) },
        { key: "status", label: "Status", render: (r) => <Pill>{r.status}</Pill> }, { key: "leads", label: "Leads", align: "right" }, { key: "projects", label: "Projects", align: "right" },
        { key: "actions", label: "Actions", sortable: false, render: (r) => <div className="flex gap-1"><button className="btn btn-sm" onClick={() => setView(r.id)}>View</button><button className="btn btn-sm" onClick={() => { setErr({}); setForm(data.employees.find((x) => x.id === r.id)); }}>Edit</button><button className="btn btn-sm" onClick={() => setDel(r)}>Delete</button></div> },
      ]} />
      {form && (
        <Modal open title={form.id ? `Edit ${form.code}` : "Add employee"} onClose={() => setForm(null)} footer={<><button className="btn" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Employee name" required error={err.name}><Input value={form.name} onChange={set("name")} /></Field>
            <Field label="Employee ID" required error={err.code}><Input value={form.code} onChange={set("code")} /></Field>
            <Field label="Designation"><Input value={form.designation} onChange={set("designation")} /></Field>
            <Field label="Department"><Select value={form.department} onChange={set("department")} options={DEPARTMENTS} /></Field>
            <Field label="Phone" required error={err.phone}><Input value={form.phone} onChange={set("phone")} /></Field>
            <Field label="Email" error={err.email}><Input value={form.email} onChange={set("email")} /></Field>
            <Field label="Joining date"><Input type="date" value={form.joiningDate} onChange={set("joiningDate")} /></Field>
            <Field label="Status"><Select value={form.status} onChange={set("status")} options={EMPLOYMENT_STATUSES} /></Field>
            <Field label="Address" className="sm:col-span-2"><Input value={form.address} onChange={set("address")} /></Field>
          </div>
        </Modal>
      )}
      {v && (
        <Modal open wide title={`${v.code} · ${v.name}`} onClose={() => setView(null)}>
          <KV items={[["Designation", v.designation], ["Department", v.department], ["Phone", v.phone], ["Email", v.email], ["Joined", fmtDate(v.joiningDate)], ["Status", v.status], ["Address", v.address]]} />
          <h3 className="mt-4 mb-2 font-semibold">Assigned leads & follow-ups</h3>
          <ul className="space-y-1 text-sm">{data.leads.filter((l) => l.employeeId === v.id).map((l) => <li key={l.id}><button className="underline" onClick={() => go("lead", { id: l.id })}>{l.code} · {l.customerName}</button> · {l.status}{l.followUpDate ? ` · follow-up ${fmtDate(l.followUpDate)}` : ""}</li>)}</ul>
          <h3 className="mt-4 mb-2 font-semibold">Assigned projects</h3>
          <ul className="space-y-1 text-sm">{data.projects.filter((p) => p.employeeId === v.id).map((p) => <li key={p.id}><button className="underline" onClick={() => go("project", { id: p.id })}>{p.code} · {p.name}</button> · {p.status}</li>)}</ul>
          <p className="mt-4 text-xs">Reassign leads or projects from their Edit forms.</p>
        </Modal>
      )}
      <ConfirmDialog open={!!del} title="Delete employee?" confirmLabel="Delete" disabled={delBlocked} onCancel={() => setDel(null)} onConfirm={doDelete}
        message={delBlocked ? `${del?.name} still has assigned leads or projects. Reassign them first.` : `Delete ${del?.name}? This cannot be undone.`} />
    </div>
  );
}

/* ---------------- Inventory ---------------- */
export function Inventory() {
  const { data, update, toast, route } = useCRM();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [st, setSt] = useState("");
  const [form, setForm] = useState(route.params.new ? {} : null);
  const [view, setView] = useState(null);
  const [mv, setMv] = useState(null);
  const [del, setDel] = useState(null);
  const [err, setErr] = useState({});
  const rows = data.inventory.map((i) => ({ ...i, avail: stockAvailable(i), status: stockStatus(i) })).filter((i) => matches(q, i.code, i.name, i.description) && (!cat || i.category === cat) && (!st || i.status === st));
  const low = data.inventory.filter((i) => stockStatus(i) !== "In Stock").length;
  const openForm = (it) => { setErr({}); setForm(it?.id ? { ...it } : { code: "", name: "", category: INVENTORY_CATEGORIES[0], description: "", unit: "Nos", stock: 0, reserved: 0, purchaseRate: 0, sellingRate: 0, reorderLevel: 0 }); };
  if (form && !("code" in form)) openForm();
  const saveItem = () => {
    const e = {};
    if (!form.code?.trim()) e.code = "Required"; else if (data.inventory.some((x) => x.id !== form.id && x.code.toLowerCase() === form.code.trim().toLowerCase())) e.code = "Item code already exists";
    if (!form.name?.trim()) e.name = "Required";
    ["stock", "reserved", "purchaseRate", "sellingRate", "reorderLevel"].forEach((k) => { if (num(form[k]) < 0) e[k] = "Cannot be negative"; });
    if (num(form.reserved) > num(form.stock)) e.reserved = "Reserved cannot exceed stock";
    setErr(e); if (Object.keys(e).length) return;
    const rec = { ...form, code: form.code.trim(), stock: num(form.stock), reserved: num(form.reserved), purchaseRate: num(form.purchaseRate), sellingRate: num(form.sellingRate), reorderLevel: num(form.reorderLevel) };
    if (form.id) update("inventory", (xs) => xs.map((x) => (x.id === form.id ? rec : x)));
    else { rec.id = uid("item"); update("inventory", (xs) => [...xs, rec]); if (rec.stock > 0) update("movements", (m) => [...m, { id: uid("mv"), itemId: rec.id, date: todayISO(), type: "Received", qty: rec.stock, projectId: "", reference: "Opening", notes: "Opening stock", balanceAfter: rec.stock }]); }
    toast(form.id ? "Item updated" : "Item added"); setForm(null);
  };
  const saveMove = () => {
    const it = data.inventory.find((x) => x.id === mv.itemId);
    const qn = num(mv.qty), e = {};
    if (mv.type !== "Adjustment" && !(qn > 0)) e.qty = "Quantity must be greater than 0";
    if (mv.type === "Adjustment" && qn === 0) e.qty = "Adjustment cannot be 0";
    let stock = it.stock, reserved = it.reserved;
    if (mv.type === "Received") stock += qn;
    if (mv.type === "Issued") { if (qn > stock) e.qty = `Only ${stock} ${it.unit} in stock`; stock -= qn; reserved = Math.max(0, reserved - (mv.projectId ? Math.min(qn, reserved) : 0)); }
    if (mv.type === "Adjustment") { stock += qn; if (stock < 0) e.qty = "Adjustment would make stock negative"; }
    if (mv.type === "Reserved") { if (qn > stockAvailable(it)) e.qty = `Only ${stockAvailable(it)} available to reserve`; reserved += qn; }
    if (reserved > stock) reserved = stock;
    setErr(e); if (Object.keys(e).length) return;
    update("inventory", (xs) => xs.map((x) => (x.id === it.id ? { ...x, stock: round2(stock), reserved: round2(reserved) } : x)));
    update("movements", (m) => [...m, { id: uid("mv"), itemId: it.id, date: mv.date, type: mv.type, qty: qn, projectId: mv.projectId, reference: mv.reference, notes: mv.notes, balanceAfter: round2(stock) }]);
    toast(`Stock ${mv.type.toLowerCase()} recorded for ${it.code}`); setMv(null);
  };
  const vi = data.inventory.find((x) => x.id === view);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <div>
      <PageHeader title="Inventory" subtitle={`${data.inventory.length} items · ${low} low or out of stock`}>
        <button className="btn btn-primary" onClick={() => openForm()}><Icon name="plus" size={16} /> Add Item</button>
      </PageHeader>
      <Toolbar>
        <SearchBox value={q} onChange={setQ} placeholder="Search code, name, description…" />
        <Field label="Category"><Select value={cat} onChange={(e) => setCat(e.target.value)} placeholder="All" options={INVENTORY_CATEGORIES} /></Field>
        <Field label="Stock status"><Select value={st} onChange={(e) => setSt(e.target.value)} placeholder="All" options={["In Stock", "Low Stock", "Out of Stock"]} /></Field>
      </Toolbar>
      <DataTable rows={rows} onRowClick={(r) => setView(r.id)} columns={[
        { key: "code", label: "Code" }, { key: "name", label: "Item", render: (r) => <span className="font-semibold">{r.name}</span> }, { key: "category", label: "Category" }, { key: "description", label: "Description" },
        { key: "unit", label: "Unit" }, { key: "stock", label: "Stock", align: "right" }, { key: "reserved", label: "Reserved", align: "right" }, { key: "avail", label: "Available", align: "right" },
        { key: "purchaseRate", label: "Purchase", align: "right", render: (r) => inr(r.purchaseRate) }, { key: "sellingRate", label: "Selling", align: "right", render: (r) => inr(r.sellingRate) },
        { key: "reorderLevel", label: "Reorder", align: "right" }, { key: "status", label: "Status", render: (r) => <Pill>{r.status === "In Stock" ? r.status : `⚠ ${r.status}`}</Pill> },
        { key: "actions", label: "Actions", sortable: false, render: (r) => <div className="flex gap-1">
          <button className="btn btn-sm" onClick={() => { setErr({}); setMv({ itemId: r.id, type: "Received", qty: "", date: todayISO(), projectId: "", reference: "", notes: "" }); }}>Stock</button>
          <button className="btn btn-sm" onClick={() => openForm(data.inventory.find((x) => x.id === r.id))}>Edit</button>
          <button className="btn btn-sm" onClick={() => setDel(r)}>Delete</button></div> },
      ]} />
      {form && "code" in form && (
        <Modal open title={form.id ? `Edit ${form.code}` : "Add inventory item"} onClose={() => setForm(null)} footer={<><button className="btn" onClick={() => setForm(null)}>Cancel</button><button className="btn btn-primary" onClick={saveItem}>Save</button></>}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Item code" required error={err.code}><Input value={form.code} onChange={set("code")} /></Field>
            <Field label="Item name" required error={err.name}><Input value={form.name} onChange={set("name")} /></Field>
            <Field label="Category"><Select value={form.category} onChange={set("category")} options={INVENTORY_CATEGORIES} /></Field>
            <Field label="Unit"><Input list="inv-units" value={form.unit} onChange={set("unit")} /><datalist id="inv-units">{UNITS.map((u) => <option key={u} value={u} />)}</datalist></Field>
            <Field label="Description" className="sm:col-span-2"><Input value={form.description} onChange={set("description")} /></Field>
            {!form.id && <Field label="Opening stock" error={err.stock}><Input type="number" min="0" value={form.stock} onChange={set("stock")} /></Field>}
            <Field label="Reserved" error={err.reserved}><Input type="number" min="0" value={form.reserved} onChange={set("reserved")} /></Field>
            <Field label="Purchase rate (₹)" error={err.purchaseRate}><Input type="number" min="0" value={form.purchaseRate} onChange={set("purchaseRate")} /></Field>
            <Field label="Selling rate (₹)" error={err.sellingRate}><Input type="number" min="0" value={form.sellingRate} onChange={set("sellingRate")} /></Field>
            <Field label="Reorder level" error={err.reorderLevel}><Input type="number" min="0" value={form.reorderLevel} onChange={set("reorderLevel")} /></Field>
          </div>
          {form.id && <p className="mt-3 text-xs">To change stock quantity, use the Stock action so the change is recorded in history.</p>}
        </Modal>
      )}
      {mv && (
        <Modal open title={`Stock movement · ${data.inventory.find((x) => x.id === mv.itemId)?.code}`} onClose={() => setMv(null)} footer={<><button className="btn" onClick={() => setMv(null)}>Cancel</button><button className="btn btn-primary" onClick={saveMove}>Record</button></>}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Type"><Select value={mv.type} onChange={(e) => setMv({ ...mv, type: e.target.value })} options={["Received", "Issued", "Adjustment", "Reserved"]} /></Field>
            <Field label={mv.type === "Adjustment" ? "Quantity (+/-)" : "Quantity"} error={err.qty}><Input type="number" value={mv.qty} onChange={(e) => setMv({ ...mv, qty: e.target.value })} /></Field>
            <Field label="Date"><Input type="date" value={mv.date} onChange={(e) => setMv({ ...mv, date: e.target.value })} /></Field>
            <Field label="Project (optional)"><Select value={mv.projectId} onChange={(e) => setMv({ ...mv, projectId: e.target.value })} placeholder="—" options={data.projects.map((p) => ({ value: p.id, label: `${p.code} · ${p.name}` }))} /></Field>
            <Field label="Reference"><Input value={mv.reference} onChange={(e) => setMv({ ...mv, reference: e.target.value })} /></Field>
            <Field label="Notes"><Input value={mv.notes} onChange={(e) => setMv({ ...mv, notes: e.target.value })} /></Field>
          </div>
        </Modal>
      )}
      {vi && (
        <Modal open wide title={`${vi.code} · ${vi.name}`} onClose={() => setView(null)}>
          <KV items={[["Category", vi.category], ["Unit", vi.unit], ["Description", vi.description], ["Stock", vi.stock], ["Reserved", vi.reserved], ["Available", stockAvailable(vi)], ["Purchase rate", inr(vi.purchaseRate)], ["Selling rate", inr(vi.sellingRate)], ["Status", stockStatus(vi)]]} />
          <h3 className="mt-4 mb-2 font-semibold">Stock movement history</h3>
          <DataTable compact rows={data.movements.filter((m) => m.itemId === vi.id)} empty="No movements yet." initialSort={{ key: "date", dir: "desc" }} columns={[
            { key: "date", label: "Date", render: (r) => fmtDate(r.date) }, { key: "type", label: "Type" }, { key: "qty", label: "Qty", align: "right" },
            { key: "projectId", label: "Project", render: (r) => data.projects.find((p) => p.id === r.projectId)?.code || "—" }, { key: "reference", label: "Ref" }, { key: "notes", label: "Notes" }, { key: "balanceAfter", label: "Stock after", align: "right" }]} />
        </Modal>
      )}
      <ConfirmDialog open={!!del} title="Delete item?" confirmLabel="Delete" onCancel={() => setDel(null)} disabled={del && num(del.reserved) > 0}
        message={del && num(del.reserved) > 0 ? "This item has reserved stock and cannot be deleted." : `Delete ${del?.code} · ${del?.name}? Its history will also be removed.`}
        onConfirm={() => { update("inventory", (xs) => xs.filter((x) => x.id !== del.id)); update("movements", (m) => m.filter((x) => x.itemId !== del.id)); toast("Item deleted"); setDel(null); }} />
    </div>
  );
}

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
      <Section title="Demo data"><button className="btn" onClick={() => setReset(true)}>Reset all demo data</button></Section>
      <ConfirmDialog open={reset} title="Reset demo data?" confirmLabel="Reset" onCancel={() => setReset(false)} onConfirm={() => { resetData(); setReset(false); toast("Demo data reset"); }}
        message="All changes made in this session will be lost." />
    </div>
  );
}
