import { useState } from "react";
import { CRMProvider, useCRM } from "./store";
import { Sidebar, Topbar, Toasts } from "./Layout";

// Tax Invoices, Receipts & Ledger
import {
  InvoiceDetails,
  InvoiceForm,
  InvoiceRegister,
  PartyLedger,
  PaymentReceiptsRegister,
  ProjectWorkspace,
  ReceiptDetails,
  TaxInvoices,
} from "./pages/Invoices";

// Dashboard & Settings
import { Dashboard, Settings } from "./pages/Other";

// Inventory Module & Register (Enhanced for Skyarth)
import { Inventory } from "./pages/Inventory";

// Lead Module (Newly Copied & Enhanced for Skyarth)
import { Leads } from "./pages/Leads";
import { LeadDetails } from "./pages/LeadDetails";

// Quotation Module (Newly Copied & Enhanced for Skyarth)
import { Quotations } from "./pages/Quotations";
import { QuotationEditor } from "./pages/QuotationEditor";

// Running Projects & Work Orders (Stage-wise & Phase-wise Execution Hub)
import { RunningProjects } from "./pages/RunningProjects";
import { RunningProjectDetails } from "./pages/RunningProjectDetails";

// Employee Module (Newly Copied & Enhanced for Skyarth)
import { Employees } from "./pages/Employees";
import { EmployeeDetails } from "./pages/EmployeeDetails";
import { EmployeeDocuments } from "./pages/EmployeeDocuments";

const PAGES = {
  dashboard: Dashboard,
  leads: Leads,
  lead: LeadDetails,
  quotations: Quotations,
  quotationForm: QuotationEditor,
  quotation: QuotationEditor,
  projects: RunningProjects,
  projectDetails: RunningProjectDetails,
  employees: Employees,
  employee: EmployeeDetails,
  employeeDocuments: EmployeeDocuments,
  inventory: Inventory,
  invoices: TaxInvoices,
  project: ProjectWorkspace,
  invoiceForm: InvoiceForm,
  invoice: InvoiceDetails,
  register: InvoiceRegister,
  receipts: PaymentReceiptsRegister,
  receipt: ReceiptDetails,
  ledger: PartyLedger,
  settings: Settings,
};

function Shell() {
  const { route } = useCRM();
  const [open, setOpen] = useState(false);
  const Page = PAGES[route.page] || Dashboard;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:pl-60">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="mx-auto max-w-[1600px] p-4 md:p-6">
          <Page key={`${route.page}-${route.n}`} />
        </main>
      </div>
      <Toasts />
    </div>
  );
}

export default function App() {
  return (
    <CRMProvider>
      <Shell />
    </CRMProvider>
  );
}
