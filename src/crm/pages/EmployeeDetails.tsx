import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
} from "lucide-react";
import { useCRM } from "../store";
import {
  Avatar,
  Badge,
  Button,
  Card,
  DetailRow,
  Field,
  Input,
  Modal,
  SectionCard,
  Select,
  Tabs,
} from "../components/ui-kit";
import { inr, dateFmt, downloadDocumentFile, todayISO } from "../utils/format";

export function EmployeeDetails() {
  const { data, route, go, toast, updateEmployee, updateDocStatus, addDocument } = useCRM();
  const id = route.params?.id;
  const emp = (data.employees || []).find((e: any) => e.id === id || e.code === id);

  const [activeTab, setActiveTab] = useState("Overview");
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [docForm, setDocForm] = useState({ name: "", type: "Aadhaar Card" });

  if (!emp) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-base font-bold text-neutral-700">Employee not found.</p>
        <Button variant="outline" onClick={() => go("employees")}>
          <ArrowLeft className="size-4" /> Back to Employee Directory
        </Button>
      </div>
    );
  }

  // Employee's KYC Documents
  const empDocs = useMemo(() => {
    return (data.documents || []).filter(
      (doc: any) => doc.employeeId === emp.id || doc.employeeId === emp.code
    );
  }, [data.documents, emp]);

  // Employee's assigned leads
  const assignedLeads = useMemo(() => {
    return (data.leads || []).filter((l: any) => l.employeeId === emp.id);
  }, [data.leads, emp]);

  const handleToggleDocStatus = (docId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Verified" ? "Pending" : "Verified";
    updateDocStatus(docId, nextStatus);
    toast(`Document marked as ${nextStatus}`);
  };

  const handleAddDoc = () => {
    if (!docForm.name.trim()) {
      toast("Document title is required", "error");
      return;
    }
    addDocument({
      employeeId: emp.id,
      name: docForm.name.trim(),
      type: docForm.type,
      uploadedDate: todayISO(),
      status: "Verified",
      size: "240 KB",
    });
    toast("KYC Document added to employee profile");
    setDocForm({ name: "", type: "Aadhaar Card" });
    setUploadModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => go("employees")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-black cursor-pointer"
        >
          <ArrowLeft className="size-4" /> Back to Employee Directory
        </button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setUploadModal(true)}>
            <Plus className="size-4" /> Add KYC Document
          </Button>
          <Button variant="primary" onClick={() => go("employeeDocuments", { employeeId: emp.id })}>
            <FileText className="size-4" /> View All Documents
          </Button>
        </div>
      </div>

      {/* Main Employee Banner Card */}
      <Card className="p-5 border-neutral-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={emp.name} size={56} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-extrabold bg-black text-white px-2 py-0.5 rounded">
                  {emp.code || emp.id}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900">{emp.name}</h1>
                <Badge value={emp.status || "Active"} />
              </div>
              <p className="mt-1 text-sm font-semibold text-neutral-600">
                {emp.designation} · <span className="text-neutral-900 font-bold">{emp.department}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                <span className="inline-flex items-center gap-1 font-medium">
                  <Phone className="size-3 text-neutral-400" /> {emp.phone}
                </span>
                {emp.email && (
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Mail className="size-3 text-neutral-400" /> {emp.email}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 font-medium">
                  <Calendar className="size-3 text-neutral-400" /> Joined {dateFmt(emp.joiningDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Card className="p-4">
        <Tabs
          tabs={["Overview", `KYC & Documents (${empDocs.length})`, `Assigned Leads (${assignedLeads.length})`]}
          active={activeTab}
          onChange={setActiveTab}
        />

        <div className="pt-4">
          {/* Tab 1: Overview */}
          {activeTab === "Overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SectionCard title="Employment Details">
                <DetailRow label="Employee ID" value={emp.code || emp.id} />
                <DetailRow label="Department" value={emp.department} />
                <DetailRow label="Designation" value={emp.designation} />
                <DetailRow label="Employment Type" value={emp.employmentType || "Full Time"} />
                <DetailRow label="Date of Joining" value={dateFmt(emp.joiningDate)} />
                <DetailRow label="Employment Status" value={emp.status || "Active"} />
                <DetailRow label="Residential Address" value={emp.address || "Pune, Maharashtra"} />
              </SectionCard>

              <div className="space-y-4">
                <SectionCard title="Compensation & Banking">
                  <DetailRow label="Annual CTC" value={emp.salary ? inr(emp.salary) : "₹4,80,000"} />
                  <DetailRow label="Bank Account" value={emp.bankAccount || "50200089211045"} />
                  <DetailRow label="Bank IFSC" value={emp.ifsc || "HDFC0001234"} />
                </SectionCard>

                <SectionCard title="Emergency Contact">
                  <DetailRow label="Emergency Name" value={emp.emergencyName || "Family Contact"} />
                  <DetailRow label="Emergency Contact" value={emp.emergencyContact || emp.altPhone || "—"} />
                </SectionCard>
              </div>
            </div>
          )}

          {/* Tab 2: KYC & Documents */}
          {activeTab.startsWith("KYC") && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-neutral-500">
                  Verification status of identification, compliance, and employment contracts:
                </p>
                <Button size="sm" variant="primary" onClick={() => setUploadModal(true)}>
                  <Plus className="size-3.5" /> Upload Document
                </Button>
              </div>

              {empDocs.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-neutral-200 rounded-lg">
                  <p className="text-xs text-neutral-500">No KYC documents uploaded yet.</p>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => setUploadModal(true)}>
                    Upload First Document
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {empDocs.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="border border-neutral-200 rounded-lg p-3 bg-neutral-50/40 hover:bg-neutral-50 transition-colors flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="size-9 rounded-lg bg-black text-white grid place-items-center shrink-0">
                          <FileText className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-neutral-900 truncate">{doc.name}</h4>
                          <p className="text-[11px] text-neutral-500">
                            {doc.type} · {doc.size || "180 KB"} · {dateFmt(doc.uploadedDate)}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge value={doc.status || "Verified"} />
                            <button
                              onClick={() => handleToggleDocStatus(doc.id, doc.status)}
                              className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                            >
                              Toggle Status
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPreviewDoc(doc)}
                          title="Preview Document"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            downloadDocumentFile(doc, emp.name);
                            toast(`Downloading ${doc.name}…`);
                          }}
                          title="Download Document"
                        >
                          <Download className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Assigned Leads */}
          {activeTab.startsWith("Assigned Leads") && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-500">
                Customer leads and inquiries assigned to {emp.name}:
              </p>
              {assignedLeads.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-neutral-200 rounded-lg">
                  <p className="text-xs text-neutral-400">No customer leads currently assigned.</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-lg overflow-hidden">
                  {assignedLeads.map((l: any) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between p-3 hover:bg-neutral-50 cursor-pointer transition-colors"
                      onClick={() => go("lead", { id: l.id })}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold">{l.code || l.id}</span>
                          <span className="font-bold text-sm text-neutral-900">{l.customerName}</span>
                        </div>
                        <div className="text-xs text-neutral-500">
                          {l.projectName || l.city || "Pune Project"} · Requirements: {l.requirements || l.service}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge value={l.status} />
                        <span className="font-black text-sm text-neutral-900">{inr(Number(l.value) || 0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Add KYC Document Modal */}
      {uploadModal && (
        <Modal
          open={uploadModal}
          title={`Upload KYC Document — ${emp.name}`}
          size="sm"
          onClose={() => setUploadModal(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setUploadModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleAddDoc}>Save Document</Button>
            </>
          }
        >
          <div className="space-y-3">
            <Field label="Document Category" required>
              <Select
                value={docForm.type}
                onChange={(e) => setDocForm({ ...docForm, type: e.target.value })}
                options={[
                  "Aadhaar Card",
                  "PAN Card",
                  "Employment Agreement",
                  "Offer / Appointment Letter",
                  "Educational Certificate",
                  "NDA Letter",
                  "Passport Size Photo",
                  "Experience Certificate",
                ]}
              />
            </Field>
            <Field label="Document File Name / Title" required>
              <Input
                value={docForm.name}
                onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                placeholder="e.g. vikram-aadhaar-front.pdf"
              />
            </Field>
          </div>
        </Modal>
      )}

      {/* Preview Document Modal */}
      {previewDoc && (
        <Modal
          open={!!previewDoc}
          title={`Document Preview — ${previewDoc.name}`}
          size="md"
          onClose={() => setPreviewDoc(null)}
          footer={
            <Button variant="primary" onClick={() => setPreviewDoc(null)}>
              Close
            </Button>
          }
        >
          <div className="p-6 text-center space-y-4 border border-dashed border-neutral-300 rounded-xl bg-neutral-50">
            <div className="size-16 rounded-full bg-black text-white grid place-items-center mx-auto">
              <FileText className="size-8" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900">{previewDoc.name}</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Category: <span className="font-semibold text-neutral-800">{previewDoc.type}</span> &nbsp;|&nbsp;
                Status: <span className="font-semibold text-emerald-700">{previewDoc.status}</span>
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Employee: {emp.name} ({emp.code}) · Uploaded on {dateFmt(previewDoc.uploadedDate)}
              </p>
            </div>
            <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
              Official Skyarth uPVC Windows LLP internal record. Verified and archived under employee KYC records.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                downloadDocumentFile(previewDoc, emp.name);
                toast(`Downloading ${previewDoc.name}…`);
              }}
            >
              <Download className="size-4" /> Download File Copy
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
