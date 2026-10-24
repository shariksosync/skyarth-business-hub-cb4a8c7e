import { useState, useMemo } from "react";
import { useCRM, empName } from "../store";
import { PROJECT_EXECUTION_STAGES } from "../data";
import {
  Icon,
  Modal,
  PageHeader,
  StatCard,
  Field,
  Input,
  Select,
  Textarea,
} from "../ui";
import { fmtDate, inr, num, projectSummary, round2, todayISO } from "../utils";

export function RunningProjectDetails() {
  const {
    data,
    route,
    go,
    updateProject,
    updateProjectStage,
    addProjectPhase,
    updateProjectPhase,
    deleteProjectPhase,
    logProjectCommunication,
    toast,
  } = useCRM();

  const projectId = route.params?.id;
  const project = (data.projects || []).find((p) => p.id === projectId);
  const employees = data.employees || [];
  const invoices = (data.invoices || []).filter((i) => i.projectId === projectId);
  const receipts = (data.receipts || []).filter((r) => r.projectId === projectId);
  const summary = project ? projectSummary(project, data.invoices) : { invoiced: 0, paid: 0, balance: 0, uninvoiced: 0 };

  // Modals
  const [editWOOpen, setEditWOOpen] = useState(false);
  const [addPhaseOpen, setAddPhaseOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState(null);
  const [updateStageModal, setUpdateStageModal] = useState(null); // { stageName, ... }
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [phaseWhatsAppModal, setPhaseWhatsAppModal] = useState(null);

  if (!project) {
    return (
      <div className="card p-10 text-center space-y-3">
        <h2 className="text-xl font-bold">Project Not Found</h2>
        <p className="text-sm text-neutral-500">The requested running project does not exist.</p>
        <button className="btn btn-primary" onClick={() => go("projects")}>
          Back to Running Projects
        </button>
      </div>
    );
  }

  // Ensure stages array is populated
  const stages = useMemo(() => {
    if (Array.isArray(project.stages) && project.stages.length) {
      return project.stages;
    }
    return PROJECT_EXECUTION_STAGES.map((stg) => ({
      stageName: stg,
      targetDate: project.targetCompletionDate || project.startDate,
      completedDate: stg === "Advance Received" ? project.startDate : "",
      status: stg === "Advance Received" ? "Completed" : "Pending",
      supervisorId: project.employeeId,
      notes: "",
    }));
  }, [project]);

  const phases = project.phases || [];
  const communications = project.communications || [];

  const handleLaunchWhatsApp = (customMsg) => {
    const rawPhone = String(project.phone || "").replace(/\D/g, "");
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const text = encodeURIComponent(customMsg);
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
    logProjectCommunication(project.id, {
      channel: "WhatsApp",
      recipient: `${project.phone} (${project.customerName})`,
      subject: `Project Update: ${project.currentStage}`,
      message: customMsg,
    });
    toast(`WhatsApp opened & communication logged`);
    setWhatsAppModalOpen(false);
    setPhaseWhatsAppModal(null);
  };

  const handleLaunchEmail = (subject, body) => {
    const email = project.email || "";
    const mailtoUrl = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, "_blank");
    logProjectCommunication(project.id, {
      channel: "Email",
      recipient: `${email} (${project.customerName})`,
      subject,
      message: body,
    });
    toast(`Email client opened & communication logged`);
    setEmailModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        title={`${project.code} · ${project.name}`}
        subtitle={`Client Work Order: ${project.workOrderNo} · ${project.customerName} (${project.city || "Pune"})`}
        onBack={() => go("projects")}
      >
        <button
          className="btn text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-300 flex items-center gap-1.5 cursor-pointer"
          onClick={() => setWhatsAppModalOpen(true)}
        >
          <Icon name="whatsapp" size={16} /> Send WhatsApp Update
        </button>
        <button
          className="btn text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-300 flex items-center gap-1.5 cursor-pointer"
          onClick={() => setEmailModalOpen(true)}
        >
          <Icon name="mail" size={16} /> Send Email Update
        </button>
        <button
          className="btn btn-outline flex items-center gap-1.5 cursor-pointer"
          onClick={() => setAddPhaseOpen(true)}
        >
          <Icon name="layers" size={16} /> + Add Phase / Floor
        </button>
        <button
          className="btn btn-primary flex items-center gap-1.5 cursor-pointer"
          onClick={() => go("invoiceForm", { projectId: project.id })}
        >
          <Icon name="plus" size={16} /> Create Invoice
        </button>
      </PageHeader>

      {/* Top Work Order Profile Summary */}
      <div className="card p-5 bg-white border border-neutral-200">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-neutral-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-neutral-900 text-white px-2 py-0.5 rounded">
                {project.code}
              </span>
              <span className="text-xs font-mono font-bold bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded border border-neutral-200">
                Work Order: {project.workOrderNo}
              </span>
              <span className="text-xs font-bold text-neutral-600">
                WO Date: {fmtDate(project.workOrderDate)}
              </span>
            </div>
            <h2 className="text-xl font-bold text-neutral-900">{project.name}</h2>
            <div className="text-xs text-neutral-600">
              <b>Site Address:</b> {project.siteAddress || "Not specified"} · <b>Contact:</b>{" "}
              {project.customerName} ({project.phone})
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              className="text-xs font-bold underline text-neutral-800 hover:text-black cursor-pointer"
              onClick={() => setEditWOOpen(true)}
            >
              Edit Work Order Details ✏️
            </button>
            <div className="text-xs text-neutral-500">
              Supervisor: <b>{empName(data, project.employeeId)}</b>
            </div>
          </div>
        </div>

        {/* Financial & Delivery Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4">
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <div className="text-[11px] font-semibold text-neutral-500 uppercase">Work Order Value</div>
            <div className="text-lg font-bold font-mono text-neutral-900">{inr(project.value)}</div>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <div className="text-[11px] font-semibold text-neutral-500 uppercase">Total Invoiced</div>
            <div className="text-lg font-bold font-mono text-neutral-900">{inr(summary.invoiced)}</div>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <div className="text-[11px] font-semibold text-neutral-500 uppercase">Total Received</div>
            <div className="text-lg font-bold font-mono text-emerald-700">{inr(summary.paid)}</div>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <div className="text-[11px] font-semibold text-neutral-500 uppercase">Outstanding Balance</div>
            <div className="text-lg font-bold font-mono text-rose-700">{inr(summary.outstanding)}</div>
          </div>
          <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <div className="text-[11px] font-semibold text-neutral-500 uppercase">Committed Target Date</div>
            <div className="text-sm font-bold text-neutral-900 mt-1">
              {project.targetCompletionDate ? fmtDate(project.targetCompletionDate) : "Not set"}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: STAGE-WISE PROGRESSION (6 STAGES) */}
      {/* ======================================================== */}
      <div className="card p-5 bg-white border border-neutral-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <span>Stage-Wise Execution Lifecycle</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border">
                Current: {project.currentStage}
              </span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live status across the 6 standard stages of uPVC manufacturing and installation.
            </p>
          </div>
          <div className="text-xs text-neutral-500 font-mono">
            {stages.filter((s) => s.status === "Completed").length} of 6 Completed
          </div>
        </div>

        {/* Visual Stage Stepper Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5">
          {stages.map((stg, idx) => {
            const isCompleted = stg.status === "Completed";
            const isInProgress = stg.status === "In Progress" || project.currentStage === stg.stageName;
            return (
              <div
                key={stg.stageName}
                onClick={() => setUpdateStageModal(stg)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isCompleted
                    ? "bg-emerald-50/60 border-emerald-300"
                    : isInProgress
                    ? "bg-amber-50/70 border-amber-300 shadow-sm"
                    : "bg-neutral-50/70 border-neutral-200"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[11px] font-mono font-bold text-neutral-500">0{idx + 1}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : isInProgress
                          ? "bg-amber-600 text-white"
                          : "bg-neutral-200 text-neutral-600"
                      }`}
                    >
                      {isCompleted ? "Done" : isInProgress ? "Active" : "Pending"}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-neutral-900 leading-tight mb-2">
                    {stg.stageName}
                  </h4>
                  <div className="space-y-1 text-[11px]">
                    <div className="text-neutral-600">
                      Target: <b>{fmtDate(stg.targetDate || project.targetCompletionDate) || "—"}</b>
                    </div>
                    {stg.completedDate && (
                      <div className="text-emerald-700">
                        Done: <b>{fmtDate(stg.completedDate)}</b>
                      </div>
                    )}
                    {stg.notes && (
                      <div className="text-neutral-500 italic truncate" title={stg.notes}>
                        &quot;{stg.notes}&quot;
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-2 mt-2 border-t border-neutral-200/60 text-[11px] text-neutral-500 flex items-center justify-between">
                  <span>Supervisor: {empName(data, stg.supervisorId || project.employeeId)}</span>
                  <span className="font-bold text-neutral-700 underline">Update</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: PHASE-WISE SITE EXECUTION (MULTI-FLOOR BUILDING) */}
      {/* ======================================================== */}
      <div className="card p-5 bg-white border border-neutral-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Icon name="layers" size={18} />
              <span>Phase-Wise Site Readiness &amp; Floor Execution</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-neutral-900 text-white">
                {phases.length} Phase(s)
              </span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Break down large orders (e.g. 11-floor buildings) into progressive floor batches based on civil readiness.
            </p>
          </div>
          <button
            className="btn btn-sm btn-outline flex items-center gap-1.5 cursor-pointer"
            onClick={() => setAddPhaseOpen(true)}
          >
            <Icon name="plus" size={14} /> Add New Phase
          </button>
        </div>

        {phases.length === 0 ? (
          <div className="p-8 text-center bg-neutral-50 rounded-xl border border-dashed border-neutral-300 space-y-2">
            <p className="text-sm font-semibold text-neutral-700">No specific phases created yet.</p>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              If this project has multiple wings or floors (e.g. 11-floor building with 2 floors ready), add phases to
              track measurement, manufacturing, and installation floor-by-floor.
            </p>
            <button className="btn btn-sm btn-primary mt-2" onClick={() => setAddPhaseOpen(true)}>
              + Create Phase 1
            </button>
          </div>
        ) : (
          <div className="grid gap-3.5 md:grid-cols-2">
            {phases.map((ph, idx) => (
              <div
                key={ph.id || idx}
                className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-neutral-100">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-neutral-500">
                      Phase #{idx + 1}
                    </span>
                    <h4 className="font-bold text-sm text-neutral-900">{ph.name}</h4>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border">
                    {ph.activeStage || "In Progress"}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded bg-neutral-50 border border-neutral-100 font-semibold text-neutral-800">
                    Scope: {ph.scope || "—"} ({ph.unitsCount || 0} units)
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div>
                      <span className="text-neutral-500 block">Civil Readiness:</span>
                      <span className="font-semibold text-neutral-800">{ph.civilReadiness || "Pending"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Measurement Status:</span>
                      <span className="font-semibold text-neutral-800">{ph.measurementStatus || "Pending"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Factory Production:</span>
                      <span className="font-semibold text-neutral-800">{ph.productionStatus || "Pending"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block">Dispatch Info:</span>
                      <span className="font-semibold text-neutral-800">{ph.dispatchStatus || "Pending"}</span>
                    </div>
                  </div>
                  <div className="pt-1 text-[11px]">
                    <span className="text-neutral-500">Installation Progress:</span>{" "}
                    <span className="font-semibold text-neutral-800">{ph.installationStatus || "Pending"}</span>
                  </div>
                  <div className="text-[11px]">
                    <span className="text-neutral-500">Phase Target Date:</span>{" "}
                    <span className="font-bold text-neutral-900">{fmtDate(ph.targetDate) || "—"}</span>
                  </div>
                </div>

                {/* Phase Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                  <button
                    className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    onClick={() => {
                      const msg = `*SKYARTH uPVC WINDOWS LLP*\n*Phase Execution Milestone*\n-------------------------------------\nDear *${project.customerName}*,\n\nUpdate regarding *${project.name}*:\n🏢 *${ph.name}*\n📍 *Current Status:* ${ph.activeStage}\n📐 *Scope:* ${ph.scope} (${ph.unitsCount} Units)\n📅 *Target Date:* ${fmtDate(ph.targetDate)}\n\n*Progress Notes:*\n${ph.installationStatus || ph.productionStatus || "Production and installation proceeding on track."}\n\nWarm regards,\n*Skyarth uPVC Windows LLP*\nPune | 9945678901`;
                      handleLaunchWhatsApp(msg);
                    }}
                  >
                    <Icon name="whatsapp" size={14} /> Send Phase Update
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      className="text-neutral-700 hover:text-black font-semibold cursor-pointer underline"
                      onClick={() => setEditingPhase(ph)}
                    >
                      Edit Phase
                    </button>
                    <button
                      className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                      onClick={() => {
                        if (window.confirm(`Delete phase "${ph.name}"?`)) {
                          deleteProjectPhase(project.id, ph.id);
                          toast(`Phase deleted`);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* SECTION 3: COMMUNICATIONS LOG & BILLING PREVIEWS */}
      {/* ======================================================== */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Communications Audit Log */}
        <div className="card p-5 bg-white border border-neutral-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Icon name="whatsapp" size={16} /> Client Updates History ({communications.length})
            </h3>
            <button
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              onClick={() => setWhatsAppModalOpen(true)}
            >
              + New Update
            </button>
          </div>
          {communications.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-400 italic">
              No WhatsApp or Email updates logged yet for this project.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {communications.map((comm) => (
                <div key={comm.id} className="p-2.5 rounded bg-neutral-50 border border-neutral-100 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 mb-1">
                    <span className="font-bold text-neutral-800">{comm.channel} · {comm.subject}</span>
                    <span>{new Date(comm.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div className="text-neutral-700 text-[11px] line-clamp-3 whitespace-pre-line font-sans">
                    {comm.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Linked Tax Invoices with Work Order */}
        <div className="card p-5 bg-white border border-neutral-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900">
              Tax Invoices ({invoices.length})
            </h3>
            <button
              className="text-xs font-bold text-neutral-900 hover:underline cursor-pointer"
              onClick={() => go("invoiceForm", { projectId: project.id })}
            >
              + New Invoice
            </button>
          </div>
          {invoices.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-400 italic">
              No invoices generated for this project yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => go("invoice", { id: inv.id })}
                  className="p-2.5 rounded border border-neutral-200 hover:border-neutral-400 transition-all cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-mono font-bold text-neutral-900">{inv.number}</div>
                    <div className="text-[11px] text-neutral-500">
                      Stage: {inv.stage} · WO: {inv.workOrderNo || project.workOrderNo}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-neutral-900">{inr(inv.items ? inv.items.reduce((a, b) => a + (Number(b.rate) * Number(b.qty)), 0) * 1.18 : 0)}</div>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700">
                      {inv.state}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: EDIT WORK ORDER DETAILS */}
      {/* ======================================================== */}
      {editWOOpen && (
        <Modal
          open={editWOOpen}
          title={`Edit Work Order · ${project.code}`}
          onClose={() => setEditWOOpen(false)}
          wide
          footer={
            <>
              <button className="btn" onClick={() => setEditWOOpen(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  updateProject(project.id, {
                    name: project.name,
                    workOrderNo: project.workOrderNo,
                    workOrderDate: project.workOrderDate,
                    targetCompletionDate: project.targetCompletionDate,
                    value: round2(num(project.value)),
                    siteAddress: project.siteAddress,
                    employeeId: project.employeeId,
                  });
                  toast("Work Order details updated");
                  setEditWOOpen(false);
                }}
              >
                Save Changes
              </button>
            </>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Project Name" required>
              <Input
                value={project.name}
                onChange={(e) => updateProject(project.id, { name: e.target.value })}
              />
            </Field>
            <Field label="Client Work Order No." required>
              <Input
                value={project.workOrderNo || ""}
                onChange={(e) => updateProject(project.id, { workOrderNo: e.target.value })}
                className="font-mono font-bold"
              />
            </Field>
            <Field label="Work Order Date">
              <Input
                type="date"
                value={project.workOrderDate || ""}
                onChange={(e) => updateProject(project.id, { workOrderDate: e.target.value })}
              />
            </Field>
            <Field label="Committed Target Completion Date">
              <Input
                type="date"
                value={project.targetCompletionDate || ""}
                onChange={(e) =>
                  updateProject(project.id, { targetCompletionDate: e.target.value })
                }
              />
            </Field>
            <Field label="Contract Value (₹)">
              <Input
                type="number"
                value={project.value}
                onChange={(e) => updateProject(project.id, { value: e.target.value })}
              />
            </Field>
            <Field label="Assigned Supervisor">
              <Select
                value={project.employeeId}
                onChange={(e) => updateProject(project.id, { employeeId: e.target.value })}
                options={employees.map((e) => ({ value: e.id, label: e.name }))}
              />
            </Field>
            <Field label="Site Address" className="sm:col-span-2">
              <Textarea
                value={project.siteAddress || ""}
                onChange={(e) => updateProject(project.id, { siteAddress: e.target.value })}
              />
            </Field>
          </div>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADD / EDIT PHASE */}
      {/* ======================================================== */}
      {(addPhaseOpen || editingPhase) && (
        <PhaseModal
          open={addPhaseOpen || !!editingPhase}
          phase={editingPhase}
          project={project}
          onClose={() => {
            setAddPhaseOpen(false);
            setEditingPhase(null);
          }}
          onSave={(phaseData) => {
            if (editingPhase) {
              updateProjectPhase(project.id, editingPhase.id, phaseData);
              toast(`Phase "${phaseData.name}" updated`);
            } else {
              addProjectPhase(project.id, phaseData);
              toast(`New phase "${phaseData.name}" added`);
            }
            setAddPhaseOpen(false);
            setEditingPhase(null);
          }}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL 3: UPDATE STAGE MODAL */}
      {/* ======================================================== */}
      {updateStageModal && (
        <UpdateStageModal
          stage={updateStageModal}
          project={project}
          open={!!updateStageModal}
          onClose={() => setUpdateStageModal(null)}
          onSave={(patch) => {
            updateProjectStage(project.id, updateStageModal.stageName, patch);
            toast(`Stage ${updateStageModal.stageName} updated`);
            setUpdateStageModal(null);
          }}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL 4: WHATSAPP UPDATE MODAL */}
      {/* ======================================================== */}
      {whatsAppModalOpen && (
        <WhatsAppModal
          open={whatsAppModalOpen}
          project={project}
          onClose={() => setWhatsAppModalOpen(false)}
          onSend={(msg) => handleLaunchWhatsApp(msg)}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL 5: EMAIL UPDATE MODAL */}
      {/* ======================================================== */}
      {emailModalOpen && (
        <EmailModal
          open={emailModalOpen}
          project={project}
          onClose={() => setEmailModalOpen(false)}
          onSend={(subj, body) => handleLaunchEmail(subj, body)}
        />
      )}
    </div>
  );
}

/* ---------------- Phase Modal ---------------- */
function PhaseModal({ open, phase, project, onClose, onSave }) {
  const [f, setF] = useState(() => ({
    name: phase?.name || `Phase ${(project.phases || []).length + 1}: Floors …`,
    scope: phase?.scope || "",
    unitsCount: phase?.unitsCount || 24,
    targetDate: phase?.targetDate || project.targetCompletionDate || todayISO(),
    activeStage: phase?.activeStage || "Measurement Taken",
    civilReadiness: phase?.civilReadiness || "Civil openings ready for measurement",
    measurementStatus: phase?.measurementStatus || "Pending",
    productionStatus: phase?.productionStatus || "Pending",
    dispatchStatus: phase?.dispatchStatus || "Pending",
    installationStatus: phase?.installationStatus || "Pending",
    notes: phase?.notes || "",
  }));

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  return (
    <Modal
      open={open}
      title={phase ? `Edit Phase: ${phase.name}` : `Add New Phase / Floor Batch`}
      onClose={onClose}
      wide
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => onSave(f)}>
            Save Phase
          </button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Phase Name (e.g. Floors / Wing)" required>
          <Input placeholder="e.g. Phase 2: 3rd & 4th Floor" value={f.name} onChange={set("name")} />
        </Field>
        <Field label="Phase Target Completion Date" required>
          <Input type="date" value={f.targetDate} onChange={set("targetDate")} />
        </Field>
        <Field label="Scope & Openings Description" className="sm:col-span-2">
          <Input
            placeholder="e.g. 8 Flats: 24 Sliding 3-Track Windows, 8 Casements, 4 Balcony Sliders"
            value={f.scope}
            onChange={set("scope")}
          />
        </Field>
        <Field label="Total Units in this Phase">
          <Input type="number" min="1" value={f.unitsCount} onChange={set("unitsCount")} />
        </Field>
        <Field label="Current Active Phase Stage">
          <Select
            value={f.activeStage}
            onChange={set("activeStage")}
            options={PROJECT_EXECUTION_STAGES.map((s) => ({ value: s, label: s }))}
          />
        </Field>
        <Field label="Civil Site Readiness Details">
          <Input
            placeholder="e.g. 100% Ready (Plastering & sill stone fixed)"
            value={f.civilReadiness}
            onChange={set("civilReadiness")}
          />
        </Field>
        <Field label="Measurement Status">
          <Input
            placeholder="e.g. Completed on 06 Jul by Amit Joshi"
            value={f.measurementStatus}
            onChange={set("measurementStatus")}
          />
        </Field>
        <Field label="Factory Production Status">
          <Input
            placeholder="e.g. Profiles cut & welded; multi-point locks fitted"
            value={f.productionStatus}
            onChange={set("productionStatus")}
          />
        </Field>
        <Field label="Material Dispatch Details">
          <Input
            placeholder="e.g. Dispatched on 24 Jul (Challan #CH-991)"
            value={f.dispatchStatus}
            onChange={set("dispatchStatus")}
          />
        </Field>
        <Field label="Installation Progress" className="sm:col-span-2">
          <Input
            placeholder="e.g. Outer frames fixed, silicon sealing in progress"
            value={f.installationStatus}
            onChange={set("installationStatus")}
          />
        </Field>
      </div>
    </Modal>
  );
}

/* ---------------- Update Stage Modal ---------------- */
function UpdateStageModal({ stage, project, open, onClose, onSave }) {
  const [status, setStatus] = useState(stage.status || "Pending");
  const [targetDate, setTargetDate] = useState(stage.targetDate || project.targetCompletionDate || todayISO());
  const [completedDate, setCompletedDate] = useState(stage.completedDate || (status === "Completed" ? todayISO() : ""));
  const [notes, setNotes] = useState(stage.notes || "");

  return (
    <Modal
      open={open}
      title={`Update Stage: ${stage.stageName}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={() =>
              onSave({
                status,
                targetDate,
                completedDate: status === "Completed" ? (completedDate || todayISO()) : "",
                notes,
              })
            }
          >
            Save Stage Update
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <Field label="Stage Status">
          <Select
            value={status}
            onChange={(e) => {
              const val = e.target.value;
              setStatus(val);
              if (val === "Completed" && !completedDate) setCompletedDate(todayISO());
            }}
            options={[
              { value: "Pending", label: "Pending" },
              { value: "In Progress", label: "In Progress" },
              { value: "Completed", label: "Completed" },
            ]}
          />
        </Field>
        <Field label="Target Date">
          <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </Field>
        {status === "Completed" && (
          <Field label="Actual Completed Date">
            <Input type="date" value={completedDate} onChange={(e) => setCompletedDate(e.target.value)} />
          </Field>
        )}
        <Field label="Milestone Notes & Remarks">
          <Textarea
            placeholder="e.g. Material dispatched via Tempo MH-12-AB-1234. Installation supervisor mobilized."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}

/* ---------------- WhatsApp Modal ---------------- */
function WhatsAppModal({ open, project, onClose, onSend }) {
  const defaultMsg = `*SKYARTH uPVC WINDOWS LLP*\n*Project Execution Update*\n-------------------------------------\nDear *${project.customerName}*,\n\nHere is the latest progress update for your project *${project.name}*:\n📋 *Work Order Ref:* ${project.workOrderNo}\n📍 *Current Stage:* ${project.currentStage}\n📅 *Committed Target Date:* ${fmtDate(project.targetCompletionDate) || "On schedule"}\n\n*Progress Notes:*\nOur team is actively executing your project in accordance with high architectural precision standards.\n\nFor any on-site queries, please reach out to our Site Supervisor or company helpline.\n\nThank you for choosing Skyarth uPVC Windows!\n-------------------------------------\n*Skyarth uPVC Windows LLP*\nPune, Maharashtra | 9945678901 | support@skyarthupvc.com`;

  const [message, setMessage] = useState(defaultMsg);

  return (
    <Modal
      open={open}
      title={`Send WhatsApp Update · ${project.customerName}`}
      onClose={onClose}
      wide
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 cursor-pointer"
            onClick={() => onSend(message)}
          >
            <Icon name="whatsapp" size={16} /> Open WhatsApp (Direct Send)
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-900 p-2.5 rounded border border-emerald-200">
          <div>
            <b>Client Mobile:</b> {project.phone} (India +91)
          </div>
          <div>
            <b>Work Order:</b> {project.workOrderNo}
          </div>
        </div>
        <Field label="WhatsApp Message Preview & Customization" required>
          <Textarea
            rows={10}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="font-mono text-xs"
          />
        </Field>
        <p className="text-[11px] text-neutral-500">
          ℹ Clicking &quot;Open WhatsApp&quot; will launch WhatsApp Web or Mobile directly with this formatted message
          ready to send with 1 click.
        </p>
      </div>
    </Modal>
  );
}

/* ---------------- Email Modal ---------------- */
function EmailModal({ open, project, onClose, onSend }) {
  const defaultSubj = `[SKYARTH UPDATE] Work Order ${project.workOrderNo}: ${project.currentStage} - ${project.name}`;
  const defaultBody = `Dear ${project.customerName},\n\nWe are pleased to provide you with the latest project execution update for ${project.name}.\n\nWork Order Reference: ${project.workOrderNo}\nCurrent Execution Stage: ${project.currentStage}\nCommitted Target Completion Date: ${fmtDate(project.targetCompletionDate) || "On schedule"}\n\nOur fabrication and installation team are maintaining rigorous quality checks for smooth delivery.\n\nPlease feel free to contact us for any site coordination.\n\nWarm regards,\nSkyarth uPVC Windows LLP\nPune, Maharashtra\nPhone: 9945678901\nEmail: support@skyarthupvc.com`;

  const [subject, setSubject] = useState(defaultSubj);
  const [body, setBody] = useState(defaultBody);

  return (
    <Modal
      open={open}
      title={`Send Email Update · ${project.customerName}`}
      onClose={onClose}
      wide
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 cursor-pointer"
            onClick={() => onSend(subject, body)}
          >
            <Icon name="mail" size={16} /> Open Email Client
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="text-xs bg-blue-50 text-blue-900 p-2.5 rounded border border-blue-200">
          <b>Client Recipient:</b> {project.email || "No email on file"}
        </div>
        <Field label="Subject Line" required>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </Field>
        <Field label="Email Body" required>
          <Textarea rows={9} value={body} onChange={(e) => setBody(e.target.value)} className="text-xs" />
        </Field>
      </div>
    </Modal>
  );
}
