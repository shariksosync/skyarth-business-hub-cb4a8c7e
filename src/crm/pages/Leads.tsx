import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  UserPlus,
  MessageSquare,
  History,
  Clock,
  Lock,
  Send,
  Search,
  Check,
  X,
  Sparkles,
  FileText,
  Calendar,
} from "lucide-react";
import { useCRM, empName } from "../store";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  Field,
  Input,
  Modal,
  PageHeader,
  SearchInput,
  Select,
  StatCard,
  Textarea,
  Toolbar,
  type Column,
} from "../components/ui-kit";
import { inr, dateFmt, dateTimeFmt, relativeTimeFmt, todayISO } from "../utils/format";

export const LEAD_SOURCES = [
  "Website",
  "WhatsApp",
  "Referral",
  "Architect / Designer",
  "Builder / Contractor",
  "Walk-in",
  "Exhibition",
  "Phone Inquiry",
  "Other",
];

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Follow-up",
  "Site Visit Scheduled",
  "Measurement Done",
  "Quotation Sent",
  "Negotiation",
  "Converted",
  "Lost",
];

export const PRIORITY = ["Low", "Medium", "High", "Urgent"];

export const UPVC_PRODUCTS = [
  "uPVC Casement Windows",
  "uPVC Sliding Windows (2-Track / 3-Track)",
  "uPVC Fixed Windows & Facades",
  "uPVC French Windows & Doors",
  "Heavy-Duty Patio Sliding Doors",
  "Lift & Slide Premium Doors",
  "Slide & Fold (Bi-Fold) Systems",
  "Hardware & Custom Glazing Solutions",
];

export function Leads() {
  const { data, go, toast, addLead, updateLead, deleteLead, addLeadRemark, updateLeadRemark } = useCRM();
  const leads = data.leads || [];
  const employees = data.employees || [];

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [form, setForm] = useState<any | null>(null);
  const [statusLead, setStatusLead] = useState<{ id: string; status: string; followUp: string; remarks: string } | null>(null);
  const [assign, setAssign] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Remarks state
  const [remarksLeadId, setRemarksLeadId] = useState<string | null>(null);
  const [newRemarkText, setNewRemarkText] = useState("");
  const [submittingRemark, setSubmittingRemark] = useState(false);
  const [editingRemarkId, setEditingRemarkId] = useState<string | null>(null);
  const [editRemarkText, setEditRemarkText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());

  // 1-second interval for live 2-minute countdown timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered rows
  const filtered = useMemo(() => {
    return leads.filter((l: any) => {
      const matchQ =
        !q ||
        [l.code, l.customerName, l.companyName, l.phone, l.email, l.projectName, l.requirements, l.service]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q.toLowerCase()));
      const matchStatus = !status || l.status === status;
      const matchSource = !source || l.source === source;
      return matchQ && matchStatus && matchSource;
    });
  }, [leads, q, status, source]);

  // Stat metrics
  const stats = useMemo(() => {
    const total = leads.length;
    const activeFollowUps = leads.filter(
      (l: any) => l.followUpDate && !["Converted", "Lost"].includes(l.status)
    ).length;
    const won = leads.filter((l: any) => l.status === "Converted").length;
    const pipelineValue = leads
      .filter((l: any) => !["Converted", "Lost"].includes(l.status))
      .reduce((sum: number, l: any) => sum + (Number(l.value) || 0), 0);
    return { total, activeFollowUps, won, pipelineValue };
  }, [leads]);

  // Handle lead save
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName?.trim()) {
      toast("Customer name is required", "error");
      return;
    }
    const cleanPhone = String(form.phone || "").replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      toast("Customer phone number must be exactly 10 digits", "error");
      return;
    }

    if (form.id) {
      updateLead(form.id, form);
      toast("Lead updated successfully");
    } else {
      addLead(form);
      toast("New lead created successfully");
    }
    setForm(null);
  };

  // Quick status update save
  const handleSaveStatus = () => {
    if (!statusLead) return;
    updateLead(statusLead.id, {
      status: statusLead.status,
      followUpDate: statusLead.followUp,
    });
    if (statusLead.remarks.trim()) {
      addLeadRemark(statusLead.id, `Status changed to ${statusLead.status}. ${statusLead.remarks.trim()}`, "Sales Executive");
    }
    toast(`Lead status updated to ${statusLead.status}`);
    setStatusLead(null);
  };

  // Quick reassign employee
  const handleSaveAssign = (empId: string) => {
    if (!assign) return;
    updateLead(assign.id, { employeeId: empId });
    addLeadRemark(assign.id, `Lead reassigned to ${empName(data, empId)}`, "Management");
    toast(`Lead reassigned to ${empName(data, empId)}`);
    setAssign(null);
  };

  // Convert lead to quotation
  const handleConvertToQuotation = (lead: any) => {
    go("quotationForm", {
      leadId: lead.id,
      customerName: lead.customerName,
      customerCompany: lead.companyName || "",
      customerPhone: lead.phone || "",
      customerEmail: lead.email || "",
      customerAddress: lead.billingAddress || lead.siteAddress || "",
      projectName: lead.projectName || `${lead.customerName} uPVC Project`,
      employeeId: lead.employeeId || employees[0]?.id || "",
    });
  };

  // Active remarks lead
  const activeRemarksLead = useMemo(() => {
    if (!remarksLeadId) return null;
    return leads.find((l: any) => l.id === remarksLeadId) || null;
  }, [remarksLeadId, leads]);

  const allRemarks = useMemo(() => {
    if (!activeRemarksLead) return [];
    const list = Array.isArray(activeRemarksLead.remarksList) ? [...activeRemarksLead.remarksList] : [];
    if (list.length === 0 && activeRemarksLead.requirements) {
      list.push({
        id: `init-${activeRemarksLead.id}`,
        text: activeRemarksLead.requirements,
        authorName: "System / Creator",
        createdAt: activeRemarksLead.createdDate ? `${activeRemarksLead.createdDate}T10:00:00.000Z` : new Date().toISOString(),
      });
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activeRemarksLead]);

  const filteredRemarks = useMemo(() => {
    if (!historySearch.trim()) return allRemarks;
    const term = historySearch.toLowerCase();
    return allRemarks.filter(
      (r: any) =>
        r.text?.toLowerCase().includes(term) ||
        r.authorName?.toLowerCase().includes(term)
    );
  }, [allRemarks, historySearch]);

  const handlePostRemark = () => {
    if (!newRemarkText.trim() || !remarksLeadId) return;
    setSubmittingRemark(true);
    addLeadRemark(remarksLeadId, newRemarkText.trim(), "Management");
    setNewRemarkText("");
    setSubmittingRemark(false);
    toast("Remark added to lead history");
  };

  const handleSaveEditRemark = (remarkId: string) => {
    if (!editRemarkText.trim() || !remarksLeadId) return;
    setSavingEdit(true);
    updateLeadRemark(remarksLeadId, remarkId, editRemarkText.trim());
    setEditingRemarkId(null);
    setEditRemarkText("");
    setSavingEdit(false);
    toast("Remark updated");
  };

  // Table columns definition
  const columns: Column<any>[] = [
    {
      key: "code",
      header: "Lead ID",
      sortValue: (r) => r.code || r.id,
      className: "w-24 font-bold text-neutral-900",
      render: (r) => <span className="font-mono text-xs">{r.code || r.id}</span>,
    },
    {
      key: "customerName",
      header: "Customer & Project",
      sortValue: (r) => r.customerName,
      render: (r) => (
        <div>
          <button
            onClick={() => go("lead", { id: r.id })}
            className="font-bold text-neutral-900 hover:underline text-left block"
          >
            {r.customerName}
          </button>
          <div className="text-xs text-neutral-500">
            {r.projectName || r.companyName || r.city || "Residential Project"}
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Contact Details",
      render: (r) => (
        <div className="text-xs">
          <div className="font-semibold text-neutral-800">{r.phone || "—"}</div>
          {r.email && <div className="text-neutral-500 truncate max-w-[150px]">{r.email}</div>}
        </div>
      ),
    },
    {
      key: "requirements",
      header: "uPVC Requirements",
      render: (r) => (
        <div className="text-xs max-w-xs truncate text-neutral-700">
          {r.requirements || r.service || "uPVC Windows & Doors"}
        </div>
      ),
    },
    {
      key: "value",
      header: "Est. Value",
      sortValue: (r) => Number(r.value) || 0,
      render: (r) => <span className="font-bold text-neutral-900">{inr(Number(r.value) || 0)}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortValue: (r) => r.status,
      render: (r) => <Badge value={r.status} />,
    },
    {
      key: "assigned",
      header: "Assigned To",
      render: (r) => (
        <button
          onClick={() => setAssign(r)}
          className="text-xs font-semibold text-neutral-800 hover:text-black flex items-center gap-1 hover:underline"
        >
          {empName(data, r.employeeId)}
        </button>
      ),
    },
    {
      key: "followUp",
      header: "Follow-up",
      sortValue: (r) => r.followUpDate || "",
      render: (r) => (
        <div className="text-xs font-medium text-neutral-600">
          {r.followUpDate ? dateFmt(r.followUpDate) : "—"}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => go("lead", { id: r.id })}
            title="View Details"
          >
            <Eye className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              setStatusLead({
                id: r.id,
                status: r.status,
                followUp: r.followUpDate || todayISO(),
                remarks: "",
              })
            }
            title="Update Status"
          >
            <Calendar className="size-4 text-amber-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setRemarksLeadId(r.id)}
            title="Communication Log"
          >
            <MessageSquare className="size-4 text-blue-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleConvertToQuotation(r)}
            title="Create Quotation"
          >
            <FileText className="size-4 text-emerald-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setForm({ ...r })}
            title="Edit Lead"
          >
            <Pencil className="size-4 text-neutral-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteId(r.id)}
            title="Delete Lead"
          >
            <Trash2 className="size-4 text-rose-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Leads & Inquiries"
        description="Track customer inquiries, architectural site visits, window requirements, and quotation conversions."
        actions={
          <Button
            variant="primary"
            onClick={() =>
              setForm({
                customerName: "",
                companyName: "",
                phone: "",
                altPhone: "",
                email: "",
                billingAddress: "",
                siteAddress: "",
                city: "Pune",
                source: "Website",
                requirements: "uPVC Casement Windows & Sliding Doors",
                value: 150000,
                priority: "Medium",
                status: "New",
                followUpDate: todayISO(),
                employeeId: employees[0]?.id || "",
              })
            }
          >
            <Plus className="size-4" /> Add Lead
          </Button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Leads" value={stats.total} />
        <StatCard label="Active Follow-ups" value={stats.activeFollowUps} tone="warning" />
        <StatCard label="Converted / Won" value={stats.won} tone="success" />
        <StatCard label="Pipeline Value" value={inr(stats.pipelineValue)} tone="primary" />
      </div>

      {/* Table Card */}
      <Card>
        <Toolbar>
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Search leads by customer, phone, location…"
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="All Statuses"
            options={LEAD_STATUSES}
            className="w-44"
          />
          <Select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="All Sources"
            options={LEAD_SOURCES}
            className="w-44"
          />
          {(q || status || source) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setQ("");
                setStatus("");
                setSource("");
              }}
            >
              Reset Filters
            </Button>
          )}
        </Toolbar>

        <DataTable rows={filtered} columns={columns} />
      </Card>

      {/* Create / Edit Lead Modal */}
      {form && (
        <Modal
          open={!!form}
          title={form.id ? `Edit Lead — ${form.code || form.customerName}` : "Create New Customer Lead"}
          subtitle="Record customer requirements and site contact info"
          size="lg"
          onClose={() => setForm(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setForm(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveForm}>
                {form.id ? "Save Changes" : "Create Lead"}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveForm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Customer Full Name" required>
                <Input
                  value={form.customerName || ""}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="e.g. Rajesh Kumar"
                />
              </Field>
              <Field label="Project / Villa / Company Name">
                <Input
                  value={form.companyName || form.projectName || ""}
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value, projectName: e.target.value })
                  }
                  placeholder="e.g. Kumar Residence Baner"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Mobile Phone (10 Digits)" required>
                <Input
                  value={form.phone || ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 9822011001"
                />
              </Field>
              <Field label="Alternate Phone">
                <Input
                  value={form.altPhone || ""}
                  onChange={(e) => setForm({ ...form, altPhone: e.target.value })}
                  placeholder="Optional alternate"
                />
              </Field>
              <Field label="Email Address">
                <Input
                  type="email"
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. rajesh@example.com"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Site / Delivery Location Address">
                <Textarea
                  value={form.siteAddress || form.billingAddress || ""}
                  onChange={(e) =>
                    setForm({ ...form, siteAddress: e.target.value, billingAddress: e.target.value })
                  }
                  placeholder="Plot / Flat details, Street, Landmark"
                />
              </Field>
              <Field label="uPVC Requirements & Dimensions">
                <Textarea
                  value={form.requirements || form.service || ""}
                  onChange={(e) =>
                    setForm({ ...form, requirements: e.target.value, service: e.target.value })
                  }
                  placeholder="e.g. 4 Casement Windows (4x5), 2 Sliding Doors (8x7), Toughened glass"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="Lead Source">
                <Select
                  value={form.source || "Website"}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  options={LEAD_SOURCES}
                />
              </Field>
              <Field label="Current Status">
                <Select
                  value={form.status || "New"}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  options={LEAD_STATUSES}
                />
              </Field>
              <Field label="Priority">
                <Select
                  value={form.priority || "Medium"}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  options={PRIORITY}
                />
              </Field>
              <Field label="Estimated Value (₹)">
                <Input
                  type="number"
                  value={form.value || 0}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Next Follow-up Date">
                <Input
                  type="date"
                  value={form.followUpDate || ""}
                  onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
                />
              </Field>
              <Field label="Assigned Sales Representative">
                <Select
                  value={form.employeeId || ""}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  options={employees.map((emp: any) => ({
                    value: emp.id,
                    label: `${emp.name} (${emp.designation || "Sales"})`,
                  }))}
                />
              </Field>
            </div>
          </form>
        </Modal>
      )}

      {/* Quick Status Update Modal */}
      {statusLead && (
        <Modal
          open={!!statusLead}
          title="Update Status & Schedule Follow-up"
          size="sm"
          onClose={() => setStatusLead(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setStatusLead(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveStatus}>
                Update Status
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <Field label="Stage / Status">
              <Select
                value={statusLead.status}
                onChange={(e) => setStatusLead({ ...statusLead, status: e.target.value })}
                options={LEAD_STATUSES}
              />
            </Field>
            <Field label="Next Scheduled Follow-up Date">
              <Input
                type="date"
                value={statusLead.followUp}
                onChange={(e) => setStatusLead({ ...statusLead, followUp: e.target.value })}
              />
            </Field>
            <Field label="Follow-up Notes / Discussion">
              <Textarea
                value={statusLead.remarks}
                onChange={(e) => setStatusLead({ ...statusLead, remarks: e.target.value })}
                placeholder="Key points from the call or client feedback..."
              />
            </Field>
          </div>
        </Modal>
      )}

      {/* Reassign Employee Modal */}
      {assign && (
        <Modal
          open={!!assign}
          title={`Assign Lead — ${assign.customerName}`}
          size="sm"
          onClose={() => setAssign(null)}
        >
          <div className="space-y-3">
            <p className="text-xs text-neutral-500">
              Select a team member to take ownership of this lead:
            </p>
            <div className="divide-y divide-neutral-100 max-h-72 overflow-y-auto">
              {employees.map((emp: any) => (
                <div
                  key={emp.id}
                  onClick={() => handleSaveAssign(emp.id)}
                  className="flex items-center justify-between p-2.5 hover:bg-neutral-50 cursor-pointer rounded-lg transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-neutral-900">{emp.name}</p>
                    <p className="text-xs text-neutral-500">{emp.designation} · {emp.department}</p>
                  </div>
                  {assign.employeeId === emp.id && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Standalone Remarks History Modal with 2-Minute Countdown Timer */}
      {remarksLeadId && activeRemarksLead && (
        <Modal
          open={!!remarksLeadId}
          title={`Communication Log — ${activeRemarksLead.customerName}`}
          subtitle={`Lead Code: ${activeRemarksLead.code || activeRemarksLead.id}`}
          size="md"
          onClose={() => {
            setRemarksLeadId(null);
            setEditingRemarkId(null);
          }}
        >
          <div className="space-y-4">
            {/* Input new remark */}
            <div className="flex gap-2">
              <Input
                value={newRemarkText}
                onChange={(e) => setNewRemarkText(e.target.value)}
                placeholder="Add a remark, call update or site notes…"
                onKeyDown={(e) => e.key === "Enter" && handlePostRemark()}
              />
              <Button
                variant="primary"
                onClick={handlePostRemark}
                disabled={submittingRemark || !newRemarkText.trim()}
              >
                <Send className="size-4" /> Post
              </Button>
            </div>

            {/* Filter remarks */}
            {allRemarks.length > 2 && (
              <Input
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search remark text or author…"
                className="text-xs h-8"
              />
            )}

            {/* Remarks timeline */}
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {filteredRemarks.length === 0 ? (
                <div className="text-center py-6 text-xs text-neutral-400">
                  No communication records found.
                </div>
              ) : (
                filteredRemarks.map((remark: any) => {
                  const createdAtTs = new Date(remark.createdAt).getTime();
                  const ageMs = currentTime - createdAtTs;
                  const isUnder2Minutes = ageMs < 120000;
                  const secondsLeft = Math.max(0, Math.ceil((120000 - ageMs) / 1000));
                  const isEditing = editingRemarkId === remark.id;

                  return (
                    <div
                      key={remark.id}
                      className="border border-neutral-200 rounded-lg p-3 bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-neutral-800">{remark.authorName || "Staff"}</span>
                        <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
                          <span>{dateTimeFmt(remark.createdAt)}</span>
                          {isUnder2Minutes ? (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              <Clock className="size-3 animate-spin" /> {secondsLeft}s left to edit
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-neutral-400">
                              <Lock className="size-3" /> Locked
                            </span>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="space-y-2 mt-2">
                          <Textarea
                            value={editRemarkText}
                            onChange={(e) => setEditRemarkText(e.target.value)}
                            className="text-xs"
                          />
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="outline" onClick={() => setEditingRemarkId(null)}>
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              variant="primary"
                              disabled={savingEdit}
                              onClick={() => handleSaveEditRemark(remark.id)}
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-neutral-700 whitespace-pre-wrap">{remark.text}</p>
                      )}

                      {!isEditing && isUnder2Minutes && (
                        <div className="mt-1.5 flex justify-end">
                          <button
                            onClick={() => {
                              setEditingRemarkId(remark.id);
                              setEditRemarkText(remark.text);
                            }}
                            className="text-[11px] font-semibold text-black hover:underline inline-flex items-center gap-1"
                          >
                            <Pencil className="size-3" /> Edit remark
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Customer Lead?"
        message="Are you sure you want to permanently delete this lead? This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteLead(deleteId);
            toast("Lead deleted");
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}
