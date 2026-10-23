import { useState, useMemo } from "react";
import {
  ArrowLeft,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Plus,
  Search,
} from "lucide-react";
import { useCRM, empName } from "../store";
import {
  Badge,
  Button,
  Card,
  DataTable,
  Field,
  Input,
  Modal,
  PageHeader,
  SearchInput,
  Select,
  StatCard,
  Toolbar,
  type Column,
} from "../components/ui-kit";
import { dateFmt, downloadDocumentFile, todayISO } from "../utils/format";

export const DOC_TYPES = [
  "Aadhaar Card",
  "PAN Card",
  "Employment Agreement",
  "Offer / Appointment Letter",
  "Educational Certificate",
  "NDA Letter",
  "Passport Size Photo",
  "Experience Certificate",
];

export function EmployeeDocuments() {
  const { data, route, go, toast, updateDocStatus, addDocument } = useCRM();
  const documents = data.documents || [];
  const employees = data.employees || [];

  const initialEmpFilter = route.params?.employeeId || "";
  const [empFilter, setEmpFilter] = useState(initialEmpFilter);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [q, setQ] = useState("");

  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [form, setForm] = useState({
    employeeId: employees[0]?.id || "",
    name: "",
    type: DOC_TYPES[0],
  });

  // Filtered documents
  const filtered = useMemo(() => {
    return documents.filter((doc: any) => {
      const matchEmp = !empFilter || doc.employeeId === empFilter;
      const matchType = !typeFilter || doc.type === typeFilter;
      const matchStatus = !statusFilter || doc.status === statusFilter;
      const matchQ =
        !q ||
        [doc.name, doc.type, empName(data, doc.employeeId)]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q.toLowerCase()));
      return matchEmp && matchType && matchStatus && matchQ;
    });
  }, [documents, empFilter, typeFilter, statusFilter, q, data]);

  // Stats
  const stats = useMemo(() => {
    const total = documents.length;
    const verified = documents.filter((d: any) => d.status === "Verified").length;
    const pending = documents.filter((d: any) => d.status === "Pending").length;
    return { total, verified, pending };
  }, [documents]);

  const handleToggleStatus = (docId: string, current: string) => {
    const next = current === "Verified" ? "Pending" : "Verified";
    updateDocStatus(docId, next);
    toast(`Document marked as ${next}`);
  };

  const handleSaveDoc = () => {
    if (!form.name.trim()) {
      toast("Document file title is required", "error");
      return;
    }
    addDocument({
      ...form,
      uploadedDate: todayISO(),
      status: "Verified",
      size: "220 KB",
    });
    toast("Document added to KYC repository");
    setUploadModal(false);
    setForm({ employeeId: employees[0]?.id || "", name: "", type: DOC_TYPES[0] });
  };

  const columns: Column<any>[] = [
    {
      key: "name",
      header: "Document Name",
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-black text-white grid place-items-center shrink-0">
            <FileText className="size-4" />
          </div>
          <div>
            <span className="font-bold text-neutral-900 block text-xs">{r.name}</span>
            <span className="text-[11px] text-neutral-400">{r.size || "180 KB"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "employee",
      header: "Employee",
      sortValue: (r) => empName(data, r.employeeId),
      render: (r) => (
        <button
          onClick={() => go("employee", { id: r.employeeId })}
          className="font-semibold text-xs text-neutral-800 hover:text-black hover:underline text-left block"
        >
          {empName(data, r.employeeId)}
        </button>
      ),
    },
    {
      key: "type",
      header: "Category",
      sortValue: (r) => r.type,
      render: (r) => <span className="text-xs font-semibold text-neutral-600">{r.type}</span>,
    },
    {
      key: "date",
      header: "Uploaded Date",
      sortValue: (r) => r.uploadedDate,
      render: (r) => <span className="text-xs text-neutral-500">{dateFmt(r.uploadedDate)}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortValue: (r) => r.status,
      render: (r) => <Badge value={r.status || "Verified"} />,
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
            onClick={() => setPreviewDoc(r)}
            title="Preview Document"
          >
            <Eye className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              downloadDocumentFile(r, empName(data, r.employeeId));
              toast(`Downloading ${r.name}…`);
            }}
            title="Download Document"
          >
            <Download className="size-4 text-neutral-700" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleToggleStatus(r.id, r.status)}
            title="Toggle Verification"
          >
            <ShieldCheck className="size-4 text-emerald-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => go("employees")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-black cursor-pointer"
        >
          <ArrowLeft className="size-4" /> Back to Employee Directory
        </button>
        <Button variant="primary" onClick={() => setUploadModal(true)}>
          <Plus className="size-4" /> Upload Document
        </Button>
      </div>

      <PageHeader
        title="Employee KYC & Compliance Documents"
        description="Verify Aadhaar, PAN, offer letters, and non-disclosure agreements for all Skyarth team members."
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Uploaded Documents" value={stats.total} />
        <StatCard label="Verified Documents" value={stats.verified} tone="success" />
        <StatCard label="Pending Verification" value={stats.pending} tone="warning" />
      </div>

      {/* Table Card */}
      <Card>
        <Toolbar>
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Search document name or employee…"
          />
          <Select
            value={empFilter}
            onChange={(e) => setEmpFilter(e.target.value)}
            placeholder="All Employees"
            options={employees.map((e: any) => ({ value: e.id, label: e.name }))}
            className="w-48"
          />
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            placeholder="All Document Types"
            options={DOC_TYPES}
            className="w-48"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="All Statuses"
            options={["Verified", "Pending", "Rejected"]}
            className="w-36"
          />
          {(q || empFilter || typeFilter || statusFilter) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setQ("");
                setEmpFilter("");
                setTypeFilter("");
                setStatusFilter("");
              }}
            >
              Reset Filters
            </Button>
          )}
        </Toolbar>

        <DataTable rows={filtered} columns={columns} />
      </Card>

      {/* Upload Modal */}
      {uploadModal && (
        <Modal
          open={uploadModal}
          title="Upload KYC Document"
          size="sm"
          onClose={() => setUploadModal(false)}
          footer={
            <>
              <Button variant="outline" onClick={() => setUploadModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveDoc}>Save Document</Button>
            </>
          }
        >
          <div className="space-y-3">
            <Field label="Employee" required>
              <Select
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                options={employees.map((e: any) => ({ value: e.id, label: e.name }))}
              />
            </Field>
            <Field label="Document Category" required>
              <Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                options={DOC_TYPES}
              />
            </Field>
            <Field label="Document File Name" required>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. rahul-aadhaar-front.pdf"
              />
            </Field>
          </div>
        </Modal>
      )}

      {/* Preview Modal */}
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
                Employee: {empName(data, previewDoc.employeeId)} · Uploaded on {dateFmt(previewDoc.uploadedDate)}
              </p>
            </div>
            <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
              Official Skyarth uPVC Windows LLP internal record. Verified and archived under employee KYC records.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                downloadDocumentFile(previewDoc, empName(data, previewDoc.employeeId));
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
