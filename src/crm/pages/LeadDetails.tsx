import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Calendar,
  FileText,
  Clock,
  Lock,
  Send,
  Pencil,
  Trash2,
  CheckCircle2,
  Plus,
} from "lucide-react";
import { useCRM, empName } from "../store";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DetailRow,
  Field,
  Input,
  Modal,
  SectionCard,
  Select,
  Textarea,
  Tabs,
} from "../components/ui-kit";
import { inr, dateFmt, dateTimeFmt, todayISO } from "../utils/format";
import { LEAD_STATUSES, LEAD_SOURCES, PRIORITY } from "./Leads";

export function LeadDetails() {
  const { data, route, go, toast, updateLead, deleteLead, addLeadRemark, updateLeadRemark } = useCRM();
  const id = route.params?.id;
  const lead = (data.leads || []).find((l: any) => l.id === id);

  const [activeTab, setActiveTab] = useState("Remarks Timeline");
  const [editModal, setEditModal] = useState<any | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [newRemarkText, setNewRemarkText] = useState("");
  const [submittingRemark, setSubmittingRemark] = useState(false);
  const [editingRemarkId, setEditingRemarkId] = useState<string | null>(null);
  const [editRemarkText, setEditRemarkText] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Site visit & call modal
  const [visitModal, setVisitModal] = useState(false);
  const [visitForm, setVisitForm] = useState({ date: todayISO(), time: "11:00 AM", observations: "", employeeId: "" });
  const [callModal, setCallModal] = useState(false);
  const [callForm, setCallForm] = useState({ date: todayISO(), time: "10:00 AM", discussion: "", outcome: "Positive" });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!lead) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-base font-bold text-neutral-700">Lead not found.</p>
        <Button variant="outline" onClick={() => go("leads")}>
          <ArrowLeft className="size-4" /> Back to Leads
        </Button>
      </div>
    );
  }

  const allRemarks = useMemo(() => {
    const list = Array.isArray(lead.remarksList) ? [...lead.remarksList] : [];
    if (list.length === 0 && lead.requirements) {
      list.push({
        id: `init-${lead.id}`,
        text: lead.requirements,
        authorName: "System / Inception",
        createdAt: lead.createdDate ? `${lead.createdDate}T10:00:00.000Z` : new Date().toISOString(),
      });
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [lead]);

  // Associated quotations
  const associatedQuotations = useMemo(() => {
    return (data.quotations || []).filter(
      (q: any) => q.leadId === lead.id || q.customerName?.toLowerCase() === lead.customerName?.toLowerCase()
    );
  }, [data.quotations, lead]);

  const handlePostRemark = () => {
    if (!newRemarkText.trim()) return;
    setSubmittingRemark(true);
    addLeadRemark(lead.id, newRemarkText.trim(), "Management");
    setNewRemarkText("");
    setSubmittingRemark(false);
    toast("Remark logged to history");
  };

  const handleSaveEditRemark = (remarkId: string) => {
    if (!editRemarkText.trim()) return;
    updateLeadRemark(lead.id, remarkId, editRemarkText.trim());
    setEditingRemarkId(null);
    setEditRemarkText("");
    toast("Remark updated");
  };

  const handleSaveVisit = () => {
    const visits = Array.isArray(lead.siteVisits) ? [...lead.siteVisits] : [];
    visits.push({
      id: `sv-${Date.now()}`,
      ...visitForm,
      employeeId: visitForm.employeeId || lead.employeeId,
    });
    updateLead(lead.id, {
      siteVisits: visits,
      status: "Site Visit Scheduled",
    });
    addLeadRemark(
      lead.id,
      `Site measurement visit scheduled for ${dateFmt(visitForm.date)} at ${visitForm.time}. Notes: ${visitForm.observations}`,
      "Supervisor"
    );
    toast("Site visit scheduled");
    setVisitModal(false);
  };

  const handleSaveCall = () => {
    const calls = Array.isArray(lead.calls) ? [...lead.calls] : [];
    calls.push({
      id: `call-${Date.now()}`,
      ...callForm,
    });
    updateLead(lead.id, { calls });
    addLeadRemark(
      lead.id,
      `Call completed: ${callForm.discussion}. Outcome: ${callForm.outcome}`,
      "Sales Representative"
    );
    toast("Follow-up call logged");
    setCallModal(false);
  };

  const handleConvertToQuotation = () => {
    go("quotationForm", {
      leadId: lead.id,
      customerName: lead.customerName,
      customerCompany: lead.companyName || "",
      customerPhone: lead.phone || "",
      customerEmail: lead.email || "",
      customerAddress: lead.billingAddress || lead.siteAddress || "",
      projectName: lead.projectName || `${lead.customerName} uPVC Project`,
      employeeId: lead.employeeId || "",
      expectedCompletionDate: lead.expectedCompletionDate || "",
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateLead(lead.id, editModal);
    toast("Lead updated successfully");
    setEditModal(null);
  };

  // Status progression stages
  const STAGES = ["New", "Contacted", "Site Visit Scheduled", "Measurement Done", "Quotation Sent", "Negotiation", "Converted"];
  const currentStageIdx = STAGES.indexOf(lead.status);

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => go("leads")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-black"
        >
          <ArrowLeft className="size-4" /> Back to Leads Directory
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => setCallModal(true)}>
            <Phone className="size-4 text-blue-600" /> Log Call
          </Button>
          <Button variant="outline" onClick={() => setVisitModal(true)}>
            <Calendar className="size-4 text-amber-600" /> Schedule Visit
          </Button>
          <Button variant="primary" onClick={handleConvertToQuotation}>
            <FileText className="size-4 text-emerald-400" /> Convert to Quotation
          </Button>
          <Button variant="outline" onClick={() => setEditModal({ ...lead })}>
            <Pencil className="size-4" /> Edit
          </Button>
          <Button variant="ghost" onClick={() => setDeleteModal(true)} className="text-rose-600 hover:text-rose-700">
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Main Profile Header Card */}
      <Card className="p-5 border-neutral-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-extrabold bg-black text-white px-2 py-0.5 rounded">
                {lead.code || lead.id}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900">{lead.customerName}</h1>
              <Badge value={lead.status} />
              <span className="text-xs font-bold text-neutral-500 uppercase px-2 py-0.5 bg-neutral-100 rounded">
                {lead.priority || "Medium"} Priority
              </span>
            </div>
            {lead.projectName && (
              <p className="mt-1 text-sm font-semibold text-neutral-600">
                Project: {lead.projectName} {lead.companyName ? `· ${lead.companyName}` : ""}
              </p>
            )}
            {lead.expectedCompletionDate && (
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-semibold">
                <Calendar className="size-3.5 text-amber-600" />
                <span>Expected Handover: <strong className="font-bold">{dateFmt(lead.expectedCompletionDate)}</strong></span>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-neutral-400 uppercase">Estimated Value</div>
            <div className="text-2xl font-black text-neutral-900">{inr(Number(lead.value) || 0)}</div>
          </div>
        </div>

        {/* Stepper Progress Bar */}
        <div className="pt-4">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-neutral-500 mb-2 overflow-x-auto pb-1">
            {STAGES.map((st, i) => (
              <span
                key={st}
                className={i <= currentStageIdx ? "text-neutral-950 font-black" : "text-neutral-400"}
              >
                {i + 1}. {st}
              </span>
            ))}
          </div>
          <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-300"
              style={{
                width: `${currentStageIdx >= 0 ? ((currentStageIdx + 1) / STAGES.length) * 100 : 10}%`,
              }}
            />
          </div>
        </div>
      </Card>

      {/* Grid: Details & Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left Column: Customer & Site Info */}
        <div className="space-y-4">
          <SectionCard title="Contact & Site Details">
            <DetailRow label="Phone" value={lead.phone} />
            <DetailRow label="Alt Phone" value={lead.altPhone} />
            <DetailRow label="Email" value={lead.email} />
            <DetailRow label="Site Address" value={lead.siteAddress || lead.billingAddress} />
            <DetailRow label="City / Region" value={lead.city || "Pune"} />
            <DetailRow label="Lead Source" value={lead.source} />
            <DetailRow label="Assigned Rep" value={empName(data, lead.employeeId)} />
            <DetailRow label="Next Follow-up" value={lead.followUpDate ? dateFmt(lead.followUpDate) : "—"} />
            <DetailRow label="Exp. Project Completion" value={lead.expectedCompletionDate ? dateFmt(lead.expectedCompletionDate) : "—"} />
            <DetailRow label="Created On" value={dateFmt(lead.createdDate)} />
          </SectionCard>

          <SectionCard title="uPVC Requirements">
            <p className="text-xs leading-relaxed text-neutral-800 whitespace-pre-wrap font-medium">
              {lead.requirements || lead.service || "Standard uPVC sliding and casement window framing."}
            </p>
          </SectionCard>
        </div>

        {/* Right Column: Interactive Tabs */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <Tabs
              tabs={["Remarks Timeline", "Site Visits & Calls", `Quotations (${associatedQuotations.length})`]}
              active={activeTab}
              onChange={setActiveTab}
            />

            <div className="pt-4">
              {/* Tab 1: Remarks Timeline */}
              {activeTab === "Remarks Timeline" && (
                <div className="space-y-4">
                  {/* Post new remark */}
                  <div className="flex gap-2">
                    <Input
                      value={newRemarkText}
                      onChange={(e) => setNewRemarkText(e.target.value)}
                      placeholder="Type a meeting note, discussion or customer response…"
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

                  {/* List of remarks */}
                  <div className="space-y-3">
                    {allRemarks.map((remark: any) => {
                      const createdAtTs = new Date(remark.createdAt).getTime();
                      const ageMs = currentTime - createdAtTs;
                      const isUnder2Minutes = ageMs < 120000;
                      const secondsLeft = Math.max(0, Math.ceil((120000 - ageMs) / 1000));
                      const isEditing = editingRemarkId === remark.id;

                      return (
                        <div
                          key={remark.id}
                          className="border border-neutral-200 rounded-lg p-3 bg-neutral-50/50"
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-neutral-900">{remark.authorName || "Staff"}</span>
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
                            <div className="mt-1 flex justify-end">
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
                    })}
                  </div>
                </div>
              )}

              {/* Tab 2: Site Visits & Calls */}
              {activeTab === "Site Visits & Calls" && (
                <div className="space-y-4">
                  {/* Site Visits */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Site Measurement Visits</h3>
                      <Button size="sm" variant="outline" onClick={() => setVisitModal(true)}>
                        <Plus className="size-3.5" /> Add Visit
                      </Button>
                    </div>
                    {(!lead.siteVisits || lead.siteVisits.length === 0) ? (
                      <p className="text-xs text-neutral-400 italic">No site visits recorded yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {lead.siteVisits.map((v: any, idx: number) => (
                          <div key={idx} className="border border-neutral-200 rounded p-2.5 text-xs bg-neutral-50/50">
                            <div className="flex justify-between font-bold text-neutral-900">
                              <span>Date: {dateFmt(v.date)} at {v.time}</span>
                              <span>Technician: {empName(data, v.employeeId)}</span>
                            </div>
                            <p className="mt-1 text-neutral-700">{v.observations || "Site measurement completed"}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Calls Log */}
                  <div className="pt-2 border-t border-neutral-100">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Follow-up Calls</h3>
                      <Button size="sm" variant="outline" onClick={() => setCallModal(true)}>
                        <Plus className="size-3.5" /> Log Call
                      </Button>
                    </div>
                    {(!lead.calls || lead.calls.length === 0) ? (
                      <p className="text-xs text-neutral-400 italic">No phone calls logged yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {lead.calls.map((c: any, idx: number) => (
                          <div key={idx} className="border border-neutral-200 rounded p-2.5 text-xs bg-neutral-50/50">
                            <div className="flex justify-between font-bold text-neutral-900">
                              <span>Call on {dateFmt(c.date)} ({c.time})</span>
                              <span className="text-emerald-700 font-semibold">{c.outcome}</span>
                            </div>
                            <p className="mt-1 text-neutral-700">{c.discussion}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Associated Quotations */}
              {activeTab.startsWith("Quotations") && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-neutral-500">Quotations generated for this lead or customer:</p>
                    <Button size="sm" variant="primary" onClick={handleConvertToQuotation}>
                      <Plus className="size-3.5" /> Create Quotation
                    </Button>
                  </div>
                  {associatedQuotations.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-neutral-200 rounded-lg">
                      <p className="text-xs text-neutral-500">No quotation issued yet.</p>
                      <Button size="sm" variant="outline" className="mt-2" onClick={handleConvertToQuotation}>
                        Generate Quotation Now
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg overflow-hidden">
                      {associatedQuotations.map((q: any) => (
                        <div
                          key={q.id}
                          className="flex items-center justify-between p-3 hover:bg-neutral-50 cursor-pointer transition-colors"
                          onClick={() => go("quotationForm", { id: q.id })}
                        >
                          <div>
                            <span className="font-bold text-sm text-neutral-900">{q.number || q.id}</span>
                            <div className="text-xs text-neutral-500">
                              Dated: {dateFmt(q.date)} · Valid until: {dateFmt(q.validUntil)}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge value={q.status || "Draft"} />
                            <span className="font-extrabold text-sm text-neutral-900">
                              {inr(
                                (q.items || []).reduce(
                                  (a: number, b: any) =>
                                    a + (Number(b.qty) || 0) * (Number(b.rate) || 0) * (1 - (Number(b.discount) || 0) / 100),
                                  0
                                ) * 1.18
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <Modal
          open={!!editModal}
          title={`Edit Lead — ${lead.code || lead.customerName}`}
          size="lg"
          onClose={() => setEditModal(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setEditModal(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveEdit}>Save Changes</Button>
            </>
          }
        >
          <form onSubmit={handleSaveEdit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Customer Full Name" required>
                <Input
                  value={editModal.customerName || ""}
                  onChange={(e) => setEditModal({ ...editModal, customerName: e.target.value })}
                />
              </Field>
              <Field label="Project / Villa Name">
                <Input
                  value={editModal.projectName || ""}
                  onChange={(e) => setEditModal({ ...editModal, projectName: e.target.value })}
                />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Phone" required>
                <Input
                  value={editModal.phone || ""}
                  onChange={(e) => setEditModal({ ...editModal, phone: e.target.value })}
                />
              </Field>
              <Field label="Alt Phone">
                <Input
                  value={editModal.altPhone || ""}
                  onChange={(e) => setEditModal({ ...editModal, altPhone: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <Input
                  value={editModal.email || ""}
                  onChange={(e) => setEditModal({ ...editModal, email: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Site Address">
              <Textarea
                value={editModal.siteAddress || editModal.billingAddress || ""}
                onChange={(e) => setEditModal({ ...editModal, siteAddress: e.target.value })}
              />
            </Field>
            <Field label="Requirements">
              <Textarea
                value={editModal.requirements || ""}
                onChange={(e) => setEditModal({ ...editModal, requirements: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Next Follow-up Date">
                <Input
                  type="date"
                  value={editModal.followUpDate || ""}
                  onChange={(e) => setEditModal({ ...editModal, followUpDate: e.target.value })}
                />
              </Field>
              <Field label="Expected Project Completion Date">
                <Input
                  type="date"
                  value={editModal.expectedCompletionDate || ""}
                  onChange={(e) => setEditModal({ ...editModal, expectedCompletionDate: e.target.value })}
                />
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Status">
                <Select
                  value={editModal.status}
                  onChange={(e) => setEditModal({ ...editModal, status: e.target.value })}
                  options={LEAD_STATUSES}
                />
              </Field>
              <Field label="Priority">
                <Select
                  value={editModal.priority || "Medium"}
                  onChange={(e) => setEditModal({ ...editModal, priority: e.target.value })}
                  options={PRIORITY}
                />
              </Field>
              <Field label="Estimated Value (₹)">
                <Input
                  type="number"
                  value={editModal.value || 0}
                  onChange={(e) => setEditModal({ ...editModal, value: Number(e.target.value) })}
                />
              </Field>
            </div>
          </form>
        </Modal>
      )}

      {/* Schedule Visit Modal */}
      {visitModal && (
        <Modal
          open={visitModal}
          title="Schedule Site Measurement Visit"
          size="sm"
          onClose={() => setVisitModal(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setVisitModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveVisit}>Schedule Visit</Button>
            </>
          }
        >
          <div className="space-y-3">
            <Field label="Visit Date" required>
              <Input
                type="date"
                value={visitForm.date}
                onChange={(e) => setVisitForm({ ...visitForm, date: e.target.value })}
              />
            </Field>
            <Field label="Time">
              <Input
                value={visitForm.time}
                onChange={(e) => setVisitForm({ ...visitForm, time: e.target.value })}
                placeholder="e.g. 11:30 AM"
              />
            </Field>
            <Field label="Site Measurement Notes">
              <Textarea
                value={visitForm.observations}
                onChange={(e) => setVisitForm({ ...visitForm, observations: e.target.value })}
                placeholder="Windows to measure, civil readiness, client availability..."
              />
            </Field>
          </div>
        </Modal>
      )}

      {/* Log Call Modal */}
      {callModal && (
        <Modal
          open={callModal}
          title="Log Client Follow-up Call"
          size="sm"
          onClose={() => setCallModal(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setCallModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveCall}>Save Call</Button>
            </>
          }
        >
          <div className="space-y-3">
            <Field label="Call Date">
              <Input
                type="date"
                value={callForm.date}
                onChange={(e) => setCallForm({ ...callForm, date: e.target.value })}
              />
            </Field>
            <Field label="Outcome / Feedback">
              <Select
                value={callForm.outcome}
                onChange={(e) => setCallForm({ ...callForm, outcome: e.target.value })}
                options={["Positive / Interested", "Quotation Requested", "Site Visit Confirmed", "Under Negotiation", "Price Objection", "Not Reachable", "Lost"]}
              />
            </Field>
            <Field label="Call Discussion Details">
              <Textarea
                value={callForm.discussion}
                onChange={(e) => setCallForm({ ...callForm, discussion: e.target.value })}
                placeholder="What was discussed with the client..."
              />
            </Field>
          </div>
        </Modal>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteModal}
        title="Delete Lead?"
        message="Are you sure you want to delete this lead? All communication records will be removed."
        onCancel={() => setDeleteModal(false)}
        onConfirm={() => {
          deleteLead(lead.id);
          toast("Lead deleted");
          go("leads");
        }}
      />
    </div>
  );
}
