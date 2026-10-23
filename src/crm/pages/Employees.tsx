import { useState, useMemo } from "react";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  FileText,
  UserCheck,
  Building,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useCRM } from "../store";
import {
  Avatar,
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
  Toolbar,
  type Column,
} from "../components/ui-kit";
import { inr, dateFmt, todayISO } from "../utils/format";

export const DEPARTMENTS = [
  "Sales & Marketing",
  "Design & Estimating",
  "Production & Fabrication",
  "Site Installation",
  "Quality Assurance",
  "Accounts & Finance",
  "Administration & HR",
];

export const EMPLOYMENT_STATUSES = ["Active", "On Leave", "Inactive"];
export const EMPLOYMENT_TYPES = ["Full Time", "Contract", "Intern", "Part Time"];

export function Employees() {
  const { data, go, toast, addEmployee, updateEmployee, deleteEmployee } = useCRM();
  const employees = data.employees || [];
  const leads = data.leads || [];

  const [q, setQ] = useState("");
  const [dept, setDept] = useState("");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filtered employees
  const filtered = useMemo(() => {
    return employees.filter((e: any) => {
      const matchQ =
        !q ||
        [e.code, e.name, e.phone, e.email, e.designation, e.department]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q.toLowerCase()));
      const matchDept = !dept || e.department === dept;
      const matchStatus = !status || e.status === status;
      return matchQ && matchDept && matchStatus;
    });
  }, [employees, q, dept, status]);

  // KPI stats
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e: any) => e.status === "Active").length;
    const onLeave = employees.filter((e: any) => e.status === "On Leave").length;
    const depts = new Set(employees.map((e: any) => e.department).filter(Boolean)).size;
    return { total, active, onLeave, depts };
  }, [employees]);

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      toast("Employee name is required", "error");
      return;
    }
    const cleanPhone = String(form.phone || "").replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      toast("Phone number must be exactly 10 digits", "error");
      return;
    }

    if (form.id) {
      updateEmployee(form.id, form);
      toast("Employee record updated");
    } else {
      addEmployee(form);
      toast("New employee added successfully");
    }
    setForm(null);
  };

  const columns: Column<any>[] = [
    {
      key: "code",
      header: "Employee ID",
      sortValue: (r) => r.code || r.id,
      className: "w-28 font-mono text-xs font-bold text-neutral-900",
      render: (r) => r.code || r.id,
    },
    {
      key: "name",
      header: "Employee Details",
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={r.name} size={32} />
          <div>
            <button
              onClick={() => go("employee", { id: r.id })}
              className="font-bold text-neutral-950 hover:underline text-left block"
            >
              {r.name}
            </button>
            <div className="text-xs text-neutral-500">{r.designation || "Staff"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      sortValue: (r) => r.department,
      render: (r) => (
        <span className="text-xs font-semibold text-neutral-700">{r.department}</span>
      ),
    },
    {
      key: "contact",
      header: "Contact Info",
      render: (r) => (
        <div className="text-xs">
          <div className="font-semibold text-neutral-900">{r.phone}</div>
          <div className="text-neutral-400 truncate max-w-[150px]">{r.email}</div>
        </div>
      ),
    },
    {
      key: "joiningDate",
      header: "Date of Joining",
      sortValue: (r) => r.joiningDate || "",
      render: (r) => <span className="text-xs text-neutral-600">{dateFmt(r.joiningDate)}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortValue: (r) => r.status,
      render: (r) => <Badge value={r.status || "Active"} />,
    },
    {
      key: "assignedLeads",
      header: "Active Leads",
      render: (r) => {
        const count = leads.filter((l: any) => l.employeeId === r.id && !["Converted", "Lost"].includes(l.status)).length;
        return <span className="font-bold text-xs text-neutral-800">{count}</span>;
      },
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
            onClick={() => go("employee", { id: r.id })}
            title="View Profile"
          >
            <Eye className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => go("employeeDocuments", { employeeId: r.id })}
            title="KYC Documents"
          >
            <FileText className="size-4 text-blue-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setForm({ ...r })}
            title="Edit Employee"
          >
            <Pencil className="size-4 text-neutral-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteId(r.id)}
            title="Delete Employee"
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
        title="Employee Directory"
        description="Manage Skyarth sales estimators, fabrication technicians, site supervisors, and compliance records."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => go("employeeDocuments", {})}>
              <ShieldCheck className="size-4 text-emerald-600" /> KYC Document Hub
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                setForm({
                  code: `E-${String((employees.length || 0) + 101)}`,
                  name: "",
                  designation: "Sales Executive",
                  department: DEPARTMENTS[0],
                  phone: "",
                  altPhone: "",
                  email: "",
                  joiningDate: todayISO(),
                  employmentType: "Full Time",
                  status: "Active",
                  salary: 450000,
                  address: "Pune, Maharashtra",
                  city: "Pune",
                  bankAccount: "",
                  ifsc: "",
                  emergencyName: "",
                  emergencyContact: "",
                })
              }
            >
              <Plus className="size-4" /> Add Employee
            </Button>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Staff" value={stats.total} />
        <StatCard label="Active Employees" value={stats.active} tone="success" />
        <StatCard label="On Leave" value={stats.onLeave} tone="warning" />
        <StatCard label="Departments" value={stats.depts} tone="primary" />
      </div>

      {/* Table Card */}
      <Card>
        <Toolbar>
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Search staff by name, code, designation…"
          />
          <Select
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            placeholder="All Departments"
            options={DEPARTMENTS}
            className="w-52"
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="All Statuses"
            options={EMPLOYMENT_STATUSES}
            className="w-40"
          />
          {(q || dept || status) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setQ("");
                setDept("");
                setStatus("");
              }}
            >
              Reset Filters
            </Button>
          )}
        </Toolbar>

        <DataTable rows={filtered} columns={columns} />
      </Card>

      {/* Add / Edit Employee Modal */}
      {form && (
        <Modal
          open={!!form}
          title={form.id ? `Edit Employee — ${form.name}` : "Add New Employee"}
          size="lg"
          onClose={() => setForm(null)}
          footer={
            <>
              <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveForm}>
                {form.id ? "Save Employee" : "Create Employee"}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveForm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Employee ID / Code" required>
                <Input
                  value={form.code || ""}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. E-107"
                />
              </Field>
              <Field label="Full Name" required>
                <Input
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Vikram Pawar"
                />
              </Field>
              <Field label="Designation" required>
                <Input
                  value={form.designation || ""}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  placeholder="e.g. Site Installation Supervisor"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Department">
                <Select
                  value={form.department || DEPARTMENTS[0]}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  options={DEPARTMENTS}
                />
              </Field>
              <Field label="Employment Type">
                <Select
                  value={form.employmentType || "Full Time"}
                  onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                  options={EMPLOYMENT_TYPES}
                />
              </Field>
              <Field label="Employment Status">
                <Select
                  value={form.status || "Active"}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  options={EMPLOYMENT_STATUSES}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Mobile Phone (10 Digits)" required>
                <Input
                  value={form.phone || ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 9822011005"
                />
              </Field>
              <Field label="Alternate Phone">
                <Input
                  value={form.altPhone || ""}
                  onChange={(e) => setForm({ ...form, altPhone: e.target.value })}
                  placeholder="Optional alternate"
                />
              </Field>
              <Field label="Official Email">
                <Input
                  type="email"
                  value={form.email || ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. vikram.p@skyarthupvc.com"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Residential Address">
                <Input
                  value={form.address || ""}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street / Area, Pune"
                />
              </Field>
              <Field label="Date of Joining">
                <Input
                  type="date"
                  value={form.joiningDate || ""}
                  onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                />
              </Field>
            </div>

            <div className="border-t border-neutral-100 pt-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Compensation & Banking Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Annual CTC / Salary (₹)">
                  <Input
                    type="number"
                    value={form.salary || 0}
                    onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Bank Account Number">
                  <Input
                    value={form.bankAccount || ""}
                    onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                    placeholder="e.g. 502000784123"
                  />
                </Field>
                <Field label="IFSC Code">
                  <Input
                    value={form.ifsc || ""}
                    onChange={(e) => setForm({ ...form, ifsc: e.target.value })}
                    placeholder="e.g. HDFC0001234"
                  />
                </Field>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Emergency Contact
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Contact Person Name">
                  <Input
                    value={form.emergencyName || ""}
                    onChange={(e) => setForm({ ...form, emergencyName: e.target.value })}
                    placeholder="e.g. Priya Pawar (Spouse / Parent)"
                  />
                </Field>
                <Field label="Emergency Phone Number">
                  <Input
                    value={form.emergencyContact || ""}
                    onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                    placeholder="e.g. 9822099999"
                  />
                </Field>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Employee?"
        message="Are you sure you want to remove this employee record? Please reassign any active customer leads first."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteEmployee(deleteId);
            toast("Employee record deleted");
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}
