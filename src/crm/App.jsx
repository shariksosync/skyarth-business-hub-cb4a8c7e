import { useState } from "react";
import { CRMProvider, useCRM } from "./store";
import { Sidebar, Topbar, Toasts } from "./Layout";

// Tax Invoices (Untouched & Preserved)
import { InvoiceDetails, InvoiceForm, InvoiceRegister, ProjectWorkspace, TaxInvoices } from "./pages/Invoices";

// Inventory, Dashboard & Settings (Untouched & Preserved)
import { Dashboard, Inventory, Settings } from "./pages/Other";

// Lead Module (Newly Copied & Enhanced for Skyarth)
import { Leads } from "./pages/Leads";
import { LeadDetails } from "./pages/LeadDetails";

// Quotation Module (Newly Copied & Enhanced for Skyarth)
import { Quotations } from "./pages/Quotations";
import { QuotationEditor } from "./pages/QuotationEditor";

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
  employees: Employees,
  employee: EmployeeDetails,
  employeeDocuments: EmployeeDocuments,
  inventory: Inventory,
  invoices: TaxInvoices,
  project: ProjectWorkspace,
  invoiceForm: InvoiceForm,
  invoice: InvoiceDetails,
  register: InvoiceRegister,
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
