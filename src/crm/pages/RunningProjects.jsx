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
  DataTable,
  SearchBox,
  Toolbar,
} from "../ui";
import { fmtDate, inr, num, round2, todayISO, uid } from "../utils";

export function RunningProjects() {
  const { data, go, addProject, updateProjectStage, logProjectCommunication, toast } = useCRM();
  const projects = data.projects || [];
  const employees = data.employees || [];

  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'pipeline' | 'phases'
  const [q, setQ] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [empFilter, setEmpFilter] = useState("");

  // Modals
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [advanceStageProject, setAdvanceStageProject] = useState(null);
  const [whatsAppModalProject, setWhatsAppModalProject] = useState(null);
  const [emailModalProject, setEmailModalProject] = useState(null);

  // Filtered projects
  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchQ =
        !q ||
        [p.code, p.name, p.customerName, p.workOrderNo, p.phone, p.siteAddress].some((x) =>
          String(x || "")
            .toLowerCase()
            .includes(q.toLowerCase())
        );
      const matchStage = !stageFilter || p.currentStage === stageFilter;
      const matchEmp = !empFilter || p.employeeId === empFilter;
      return matchQ && matchStage && matchEmp;
    });
  }, [projects, q, stageFilter, empFilter]);

  // Aggregate Metrics
  const activeCount = projects.filter((p) => p.currentStage !== "Project Completed").length;
  const inProductionCount = projects.filter((p) => p.currentStage === "Production Started").length;
  const inInstallationCount = projects.filter((p) => p.currentStage === "Installation").length;
  const phasedProjectsCount = projects.filter((p) => (p.phases || []).length > 1).length;
  const totalValue = projects.reduce((acc, p) => acc + (num(p.value) || 0), 0);

  // All active phases across all projects
  const allPhases = useMemo(() => {
    const list = [];
    projects.forEach((p) => {
      (p.phases || []).forEach((ph) => {
        list.push({ ...ph, project: p });
      });
    });
    return list;
  }, [projects]);

  const getStagePillColor = (stg) => {
    switch (stg) {
      case "Advance Received":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Measurement Taken":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Production Started":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Material Dispatched":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Installation":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "Project Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-neutral-100 text-neutral-700 border-neutral-200";
    }
  };

  const getTargetDateBadge = (targetDate, currentStage) => {
    if (currentStage === "Project Completed") {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <Icon name="check" size={12} /> Completed
        </span>
      );
    }
    if (!targetDate) return <span className="text-xs text-neutral-400">—</span>;
    const today = todayISO();
    if (targetDate < today) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          <Icon name="clock" size={12} /> Target Passed ({fmtDate(targetDate)})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
        <Icon name="clock" size={12} /> Due {fmtDate(targetDate)}
      </span>
    );
  };

  const handleLaunchWhatsApp = (project, customMsg) => {
    const rawPhone = String(project.phone || "").replace(/\D/g, "");
    const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const text = encodeURIComponent(customMsg);
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
    logProjectCommunication(project.id, {
      channel: "WhatsApp",
      recipient: `${project.phone} (${project.customerName})`,
      subject: `Stage Update: ${project.currentStage}`,
      message: customMsg,
    });
    toast(`WhatsApp launched & update logged for ${project.name}`);
    setWhatsAppModalProject(null);
  };

  const handleLaunchEmail = (project, subject, body) => {
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
    toast(`Email client opened & update logged for ${project.name}`);
    setEmailModalProject(null);
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="Running Projects"
        subtitle="Live client work orders, stage progression, multi-phase site readiness, and client communications."
      >
        <button
          className="btn btn-primary cursor-pointer flex items-center gap-1.5"
          onClick={() => setNewProjectOpen(true)}
        >
          <Icon name="plus" size={16} /> New Work Order / Project
        </button>
      </PageHeader>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 no-print">
        <StatCard label="Active Projects" value={activeCount} hint="Under live execution" />
        <StatCard
          label="In Production"
          value={inProductionCount}
          hint="Factory fabrication"
          onClick={() => setStageFilter("Production Started")}
        />
        <StatCard
          label="In Installation"
          value={inInstallationCount}
          hint="Site fixing & glazing"
          onClick={() => setStageFilter("Installation")}
        />
        <StatCard
          label="Phased Building Sites"
          value={phasedProjectsCount}
          hint="Multi-floor towers / wings"
          onClick={() => setActiveTab("phases")}
        />
        <StatCard label="Total Work Order Value" value={inr(totalValue)} hint="Committed contracts" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-neutral-200 pb-px no-print">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "all"
              ? "border-neutral-900 text-neutral-900 font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300"
          }`}
        >
          All Running Projects ({projects.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("pipeline")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer inline-flex items-center gap-2 ${
            activeTab === "pipeline"
              ? "border-neutral-900 text-neutral-900 font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300"
          }`}
        >
          <span>Stage-Wise Pipeline (Kanban)</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
            6 Stages
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("phases")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer inline-flex items-center gap-2 ${
            activeTab === "phases"
              ? "border-neutral-900 text-neutral-900 font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300"
          }`}
        >
          <span>Multi-Phase Site Readiness Tracker</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-neutral-900 text-white">
            {allPhases.length} Phases
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: ALL RUNNING PROJECTS TABLE */}
      {/* ======================================================== */}
      {activeTab === "all" && (
        <div className="space-y-4">
          <Toolbar>
            <SearchBox
              value={q}
              onChange={setQ}
              placeholder="Search by project name, WO number, customer, phone, location…"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                options={[
                  { value: "", label: "All Execution Stages" },
                  ...PROJECT_EXECUTION_STAGES.map((s) => ({ value: s, label: s })),
                ]}
              />
              <Select
                value={empFilter}
                onChange={(e) => setEmpFilter(e.target.value)}
                options={[
                  { value: "", label: "All Supervisors" },
                  ...employees.map((e) => ({ value: e.id, label: e.name })),
                ]}
              />
              {(q || stageFilter || empFilter) && (
                <button
                  className="btn btn-sm btn-ghost cursor-pointer text-xs"
                  onClick={() => {
                    setQ("");
                    setStageFilter("");
                    setEmpFilter("");
                  }}
                >
                  Reset Filters
                </button>
              )}
            </div>
          </Toolbar>

          <DataTable
            rows={filtered}
            empty="No running projects match your filters."
            onRowClick={(p) => go("projectDetails", { id: p.id })}
            columns={[
              {
                key: "code",
                label: "Project ID",
                render: (p) => (
                  <div>
                    <div className="font-mono font-bold text-neutral-900">{p.code}</div>
                    <div className="text-[11px] font-mono text-neutral-500">{p.workOrderNo}</div>
                  </div>
                ),
              },
              {
                key: "name",
                label: "Project & Customer",
                render: (p) => (
                  <div>
                    <div className="font-bold text-neutral-900">{p.name}</div>
                    <div className="text-xs text-neutral-600">
                      {p.customerName} {p.companyName ? `(${p.companyName})` : ""}
                    </div>
                  </div>
                ),
              },
              {
                key: "currentStage",
                label: "Active Stage",
                render: (p) => (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${getStagePillColor(
                      p.currentStage
                    )}`}
                  >
                    {p.currentStage}
                  </span>
                ),
              },
              {
                key: "phases",
                label: "Site Phases",
                render: (p) => {
                  const count = (p.phases || []).length;
                  if (!count) return <span className="text-xs text-neutral-400">Single stage</span>;
                  return (
                    <div className="text-xs font-medium text-neutral-800">
                      <span className="font-bold text-neutral-900">{count} Phase(s)</span>
                      <div className="text-[11px] text-neutral-500 truncate max-w-[180px]">
                        {p.phases[0]?.name}
                      </div>
                    </div>
                  );
                },
              },
              {
                key: "targetCompletionDate",
                label: "Target Date",
                render: (p) => getTargetDateBadge(p.targetCompletionDate, p.currentStage),
              },
              {
                key: "employeeId",
                label: "Supervisor",
                render: (p) => (
                  <div className="text-xs font-medium text-neutral-800">
                    {empName(data, p.employeeId)}
                  </div>
                ),
              },
              {
                key: "value",
                label: "Contract Value",
                align: "right",
                render: (p) => (
                  <span className="font-mono font-bold text-neutral-900">{inr(p.value)}</span>
                ),
              },
              {
                key: "actions",
                label: "Actions",
                sortable: false,
                align: "right",
                render: (p) => (
                  <div
                    className="flex items-center justify-end gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="btn btn-sm btn-ghost p-1.5 text-emerald-700 hover:bg-emerald-50 rounded"
                      title="Send WhatsApp Update"
                      onClick={() => setWhatsAppModalProject(p)}
                    >
                      <Icon name="whatsapp" size={16} />
                    </button>
                    <button
                      className="btn btn-sm btn-ghost p-1.5 text-blue-700 hover:bg-blue-50 rounded"
                      title="Send Email Update"
                      onClick={() => setEmailModalProject(p)}
                    >
                      <Icon name="mail" size={16} />
                    </button>
                    <button
                      className="btn btn-sm cursor-pointer"
                      onClick={() => go("projectDetails", { id: p.id })}
                    >
                      Execution
                    </button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: STAGE-WISE PIPELINE (KANBAN BOARD) */}
      {/* ======================================================== */}
      {activeTab === "pipeline" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-500 px-1">
            <span>Stage-wise progress of all running client work orders. Click card to open execution hub.</span>
            <span>Target dates highlighted in red if approaching or overdue.</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {PROJECT_EXECUTION_STAGES.map((stage) => {
              const inStage = projects.filter((p) => p.currentStage === stage);
              return (
                <div
                  key={stage}
                  className="bg-neutral-50/80 rounded-xl border border-neutral-200/90 p-2.5 flex flex-col h-[75vh]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-200">
                    <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider truncate">
                      {stage}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-neutral-200/80 text-neutral-700">
                      {inStage.length}
                    </span>
                  </div>

                  {/* Column Cards */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5">
                    {inStage.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => go("projectDetails", { id: p.id })}
                        className="card p-3 hover:shadow-md transition-shadow cursor-pointer bg-white border border-neutral-200 hover:border-neutral-400 group"
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="font-mono text-xs font-bold text-neutral-900 group-hover:underline">
                            {p.code}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500 truncate max-w-[80px]">
                            {p.workOrderNo}
                          </span>
                        </div>
                        <div className="font-bold text-sm text-neutral-900 leading-tight mb-1">
                          {p.name}
                        </div>
                        <div className="text-xs text-neutral-600 mb-2 truncate">
                          {p.customerName} · {p.city || "Pune"}
                        </div>

                        {/* Phases Tag if available */}
                        {(p.phases || []).length > 0 && (
                          <div className="mb-2 inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                            <Icon name="layers" size={12} /> {(p.phases || []).length} Floors / Phases
                          </div>
                        )}

                        {/* Target Date */}
                        <div className="mb-2">
                          {getTargetDateBadge(p.targetCompletionDate, p.currentStage)}
                        </div>

                        {/* Footer & Quick Actions */}
                        <div
                          className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="font-mono font-bold text-neutral-900">{inr(p.value)}</span>
                          <div className="flex items-center gap-1">
                            <button
                              className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                              title="WhatsApp Update"
                              onClick={() => setWhatsAppModalProject(p)}
                            >
                              <Icon name="whatsapp" size={14} />
                            </button>
                            <button
                              className="p-1 text-blue-700 hover:bg-blue-50 rounded"
                              title="Advance Stage"
                              onClick={() => setAdvanceStageProject(p)}
                            >
                              <Icon name="up" size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {inStage.length === 0 && (
                      <div className="h-28 flex items-center justify-center text-xs text-neutral-400 italic">
                        No projects in this stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end pt-2">
            <button
              className="btn btn-outline cursor-pointer"
              onClick={() => go("invoices")}
            >
              Tax Invoices & Billing Register →
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: MULTI-PHASE SITE READINESS TRACKER */}
      {/* ======================================================== */}
      {activeTab === "phases" && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-4 text-xs text-amber-900 space-y-1">
            <div className="font-bold text-sm text-amber-950 flex items-center gap-2">
              <Icon name="layers" size={16} /> Phase-Wise Construction & Floor Readiness Tracking
            </div>
            <p>
              Designed specifically for multi-storey buildings (e.g. 11-Floor towers) where civil site readiness occurs
              progressively. Track when Floors 1 & 2 are ready for measurement & production while upper floors remain under
              brickwork or shuttering.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {allPhases.map((ph) => {
              const p = ph.project;
              return (
                <div
                  key={ph.id}
                  className="card p-4 hover:shadow-md transition-shadow bg-white border border-neutral-200"
                >
                  <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-neutral-100">
                    <div>
                      <div className="text-[11px] font-mono text-neutral-500">
                        {p.code} · WO: {p.workOrderNo}
                      </div>
                      <h4 className="font-bold text-sm text-neutral-900">{p.name}</h4>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold border ${getStagePillColor(
                        ph.activeStage
                      )}`}
                    >
                      {ph.activeStage}
                    </span>
                  </div>

                  {/* Phase details */}
                  <div className="space-y-2 text-xs mb-3">
                    <div className="font-bold text-sm text-neutral-900">{ph.name}</div>
                    <div className="text-neutral-700 bg-neutral-50 p-2 rounded border border-neutral-100">
                      <b>Scope / Openings:</b> {ph.scope || "—"} ({ph.unitsCount || 0} units)
                    </div>
                    <div>
                      <span className="text-neutral-500">Civil Site Readiness:</span>{" "}
                      <span className="font-semibold text-neutral-800">{ph.civilReadiness || "Pending"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Site Measurement:</span>{" "}
                      <span className="font-semibold text-neutral-800">{ph.measurementStatus || "Pending"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Factory Production:</span>{" "}
                      <span className="font-semibold text-neutral-800">{ph.productionStatus || "Pending"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Material Dispatch:</span>{" "}
                      <span className="font-semibold text-neutral-800">{ph.dispatchStatus || "Pending"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Installation Status:</span>{" "}
                      <span className="font-semibold text-neutral-800">{ph.installationStatus || "Pending"}</span>
                    </div>
                    <div className="pt-1">
                      <span className="text-neutral-500">Phase Target Date:</span>{" "}
                      <span className="font-bold text-neutral-900">{fmtDate(ph.targetDate) || "—"}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                    <button
                      className="btn btn-sm btn-outline text-emerald-700 border-emerald-300 hover:bg-emerald-50 cursor-pointer flex items-center gap-1.5"
                      onClick={() => {
                        const phaseMsg = `Dear ${p.customerName},\n\nProgress update for *${p.name}*:\n🏢 *${ph.name}*\n📍 *Current Status:* ${ph.activeStage}\n📐 *Scope:* ${ph.scope}\n📅 *Target Date:* ${fmtDate(ph.targetDate)}\n\n*Update:* ${ph.installationStatus || ph.productionStatus || "Work progressing on schedule."}\n\nWarm regards,\n*Skyarth uPVC Windows LLP*`;
                        handleLaunchWhatsApp(p, phaseMsg);
                      }}
                    >
                      <Icon name="whatsapp" size={14} /> Send Phase Update
                    </button>
                    <button
                      className="btn btn-sm cursor-pointer"
                      onClick={() => go("projectDetails", { id: p.id })}
                    >
                      Open Project
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: NEW WORK ORDER / PROJECT */}
      {/* ======================================================== */}
      {newProjectOpen && (
        <NewWorkOrderModal
          open={newProjectOpen}
          onClose={() => setNewProjectOpen(false)}
          onCreated={(newP) => {
            setNewProjectOpen(false);
            go("projectDetails", { id: newP.id });
          }}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL 2: ADVANCE STAGE MODAL */}
      {/* ======================================================== */}
      {advanceStageProject && (
        <AdvanceStageModal
          project={advanceStageProject}
          open={!!advanceStageProject}
          onClose={() => setAdvanceStageProject(null)}
          onAdvanced={(updatedProject, newStage, notes) => {
            updateProjectStage(updatedProject.id, newStage, {
              status: "Completed",
              completedDate: todayISO(),
              notes,
            });
            toast(`Advanced ${updatedProject.name} to ${newStage}`);
            setAdvanceStageProject(null);
            // Optionally prompt to send WhatsApp
            setWhatsAppModalProject({ ...updatedProject, currentStage: newStage });
          }}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL 3: WHATSAPP UPDATE MODAL */}
      {/* ======================================================== */}
      {whatsAppModalProject && (
        <WhatsAppUpdateModal
          project={whatsAppModalProject}
          open={!!whatsAppModalProject}
          onClose={() => setWhatsAppModalProject(null)}
          onSend={(msg) => handleLaunchWhatsApp(whatsAppModalProject, msg)}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL 4: EMAIL UPDATE MODAL */}
      {/* ======================================================== */}
      {emailModalProject && (
        <EmailUpdateModal
          project={emailModalProject}
          open={!!emailModalProject}
          onClose={() => setEmailModalProject(null)}
          onSend={(subj, body) => handleLaunchEmail(emailModalProject, subj, body)}
        />
      )}
    </div>
  );
}

/* ---------------- New Work Order Modal ---------------- */
function NewWorkOrderModal({ open, onClose, onCreated }) {
  const { data, addProject, toast } = useCRM();
  const [f, setF] = useState({
    name: "",
    customerName: "",
    companyName: "",
    phone: "",
    email: "",
    city: "Pune",
    siteAddress: "",
    billingAddress: "",
    siteContact: "",
    workOrderNo: `WO/SKY/${new Date().getFullYear()}/${String(
      (data.projects?.length || 0) + 1
    ).padStart(3, "0")}`,
    workOrderDate: todayISO(),
    targetCompletionDate: "",
    startDate: todayISO(),
    currentStage: "Advance Received",
    value: "",
    employeeId: data.settings?.defaultEmployeeId || "emp-3",
    quotationId: "",
    initialFloors: 1,
  });
  const [err, setErr] = useState({});

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = () => {
    const e = {};
    if (!f.name.trim()) e.name = "Project name is required";
    if (!f.customerName.trim()) e.customerName = "Customer name is required";
    if (!/^\d{10}$/.test(String(f.phone).trim())) e.phone = "Enter a 10-digit phone number";
    if (!(num(f.value) > 0)) e.value = "Work order value must be greater than 0";
    if (!f.workOrderNo.trim()) e.workOrderNo = "Work order number is required";
    if (!f.targetCompletionDate) e.targetCompletionDate = "Target completion date is required";

    setErr(e);
    if (Object.keys(e).length > 0) return;

    // Generate phases if multiple floors specified
    const phases = [];
    const floorCount = parseInt(f.initialFloors, 10) || 1;
    if (floorCount > 1) {
      phases.push({
        id: `ph-${Date.now()}-1`,
        name: `Phase 1: Floor 1 & 2 (Initial Phase)`,
        scope: "Initial floor openings ready for site measurement",
        targetDate: f.targetCompletionDate,
        activeStage: "Measurement Taken",
        civilReadiness: "Civil openings ready",
        measurementStatus: "Pending Measurement",
        productionStatus: "Scheduled post measurement",
        dispatchStatus: "Pending",
        installationStatus: "Pending",
        unitsCount: 24,
      });
      phases.push({
        id: `ph-${Date.now()}-2`,
        name: `Phase 2: Upper Floors (Floor 3 to ${floorCount})`,
        scope: "Remaining upper floor units",
        targetDate: f.targetCompletionDate,
        activeStage: "Advance Received",
        civilReadiness: "Civil work ongoing",
        measurementStatus: "Pending Civil Handover",
        productionStatus: "Planned",
        dispatchStatus: "Planned",
        installationStatus: "Planned",
        unitsCount: (floorCount - 2) * 12,
      });
    }

    const created = addProject({
      ...f,
      phases,
    });
    toast(`Running Project ${created.code} registered under Work Order ${f.workOrderNo}`);
    onCreated?.(created);
  };

  return (
    <Modal
      open={open}
      title="Register New Client Work Order & Project"
      onClose={onClose}
      wide
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={save}>
            Create Running Project
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Project Name" required error={err.name}>
            <Input placeholder="e.g. Orion Tower Phase 2" value={f.name} onChange={set("name")} />
          </Field>
          <Field label="Customer / Client Name" required error={err.customerName}>
            <Input placeholder="e.g. Rajesh Kumar" value={f.customerName} onChange={set("customerName")} />
          </Field>
          <Field label="Company / Entity Name">
            <Input placeholder="e.g. Green Valley Developers" value={f.companyName} onChange={set("companyName")} />
          </Field>
          <Field label="Client Phone (WhatsApp)" required error={err.phone}>
            <Input placeholder="10-digit mobile number" value={f.phone} onChange={set("phone")} />
          </Field>
          <Field label="Client Email">
            <Input placeholder="client@example.com" value={f.email} onChange={set("email")} />
          </Field>
          <Field label="City / Location">
            <Input value={f.city} onChange={set("city")} />
          </Field>
          <Field label="Client Work Order No." required error={err.workOrderNo}>
            <Input
              placeholder="e.g. WO/2026/089"
              value={f.workOrderNo}
              onChange={set("workOrderNo")}
              className="font-mono font-bold"
            />
          </Field>
          <Field label="Work Order Date" required>
            <Input type="date" value={f.workOrderDate} onChange={set("workOrderDate")} />
          </Field>
          <Field label="Committed Target Date" required error={err.targetCompletionDate}>
            <Input type="date" value={f.targetCompletionDate} onChange={set("targetCompletionDate")} />
          </Field>
          <Field label="Work Order Contract Value (₹)" required error={err.value}>
            <Input
              type="number"
              placeholder="Total agreed order amount"
              value={f.value}
              onChange={set("value")}
            />
          </Field>
          <Field label="Project Supervisor / In-Charge">
            <Select
              value={f.employeeId}
              onChange={set("employeeId")}
              options={(data.employees || []).map((e) => ({ value: e.id, label: `${e.name} (${e.department})` }))}
            />
          </Field>
          <Field label="Total Building Floors (Optional Phase Generator)">
            <Input
              type="number"
              min="1"
              max="100"
              placeholder="e.g. 11 for 11-floor building"
              value={f.initialFloors}
              onChange={set("initialFloors")}
            />
          </Field>
          <Field label="Project Site Address" className="sm:col-span-2">
            <Textarea
              placeholder="Complete physical site address where delivery & installation will take place"
              value={f.siteAddress}
              onChange={set("siteAddress")}
            />
          </Field>
        </div>
      </div>
    </Modal>
  );
}

/* ---------------- Advance Stage Modal ---------------- */
function AdvanceStageModal({ project, open, onClose, onAdvanced }) {
  const currentIdx = PROJECT_EXECUTION_STAGES.indexOf(project.currentStage);
  const nextStage = PROJECT_EXECUTION_STAGES[Math.min(currentIdx + 1, PROJECT_EXECUTION_STAGES.length - 1)];
  const [targetStage, setTargetStage] = useState(nextStage);
  const [notes, setNotes] = useState("");

  return (
    <Modal
      open={open}
      title={`Advance Stage: ${project.name}`}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => onAdvanced(project, targetStage, notes)}>
            Confirm Stage Advance
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="text-xs bg-neutral-100 p-2.5 rounded border border-neutral-200">
          <div>
            <b>Current Stage:</b> {project.currentStage}
          </div>
          <div>
            <b>Work Order:</b> {project.workOrderNo} · {project.customerName}
          </div>
        </div>
        <Field label="Advance to Stage" required>
          <Select
            value={targetStage}
            onChange={(e) => setTargetStage(e.target.value)}
            options={PROJECT_EXECUTION_STAGES.map((s) => ({ value: s, label: s }))}
          />
        </Field>
        <Field label="Stage Progress Notes / Milestones">
          <Textarea
            placeholder="e.g. Measurement completed for Floor 1 & 2; factory cutting initiated."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}

/* ---------------- WhatsApp Update Modal ---------------- */
function WhatsAppUpdateModal({ project, open, onClose, onSend }) {
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
          ready to send with 1 click. The communication will also be logged in the project audit history.
        </p>
      </div>
    </Modal>
  );
}

/* ---------------- Email Update Modal ---------------- */
function EmailUpdateModal({ project, open, onClose, onSend }) {
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
