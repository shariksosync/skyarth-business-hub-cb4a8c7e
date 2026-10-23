import { useState } from "react";
import { CRMProvider, useCRM } from "./store";
import { Sidebar, Topbar, Toasts } from "./Layout";
import { InvoiceDetails, InvoiceForm, InvoiceRegister, ProjectWorkspace, TaxInvoices } from "./pages/Invoices";
import { QuotationForm, QuotationView, Quotations } from "./pages/Quotations";
import { LeadDetails, Leads } from "./pages/Leads";
import { Dashboard, Employees, Inventory, Settings } from "./pages/Other";

const PAGES = {
  dashboard: Dashboard, leads: Leads, lead: LeadDetails, quotations: Quotations, quotationForm: QuotationForm, quotation: QuotationView,
  employees: Employees, inventory: Inventory, invoices: TaxInvoices, project: ProjectWorkspace, invoiceForm: InvoiceForm,
  invoice: InvoiceDetails, register: InvoiceRegister, settings: Settings,
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
  return <CRMProvider><Shell /></CRMProvider>;
}
