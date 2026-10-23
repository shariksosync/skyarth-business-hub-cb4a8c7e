import { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Printer,
  ExternalLink,
  Copy,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useCRM, empName } from "../store";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  Field,
  Input,
  Modal,
  SectionCard,
  Select,
  Textarea,
} from "../components/ui-kit";
import {
  inr,
  dateFmt,
  computeTotals,
  amountInWords,
  formatQuotationNumber,
  getQuotationFileName,
  todayISO,
} from "../utils/format";
import { printPdfFromElement, previewPdfInNewTab } from "../utils/pdf";
import { QuotationPrintTemplate } from "../components/QuotationPrintTemplate";
import { QUOTATION_STATUSES } from "./Quotations";

const UPVC_CATEGORIES = [
  "uPVC Casement Windows",
  "uPVC Sliding Windows (2-Track)",
  "uPVC Sliding Windows (3-Track with Mesh)",
  "uPVC Fixed Windows & Architectural Facades",
  "uPVC French Windows & Doors",
  "Heavy-Duty Patio Sliding Doors",
  "Lift and Slide Premium Doors",
  "Slide & Fold (Bi-Fold) Systems",
  "Hardware, Multipoint Locks & Handles",
  "Fabrication, Glazing & Site Installation",
  "Custom uPVC Framing Solution",
];

const UNITS = ["Sq.ft", "Nos", "Sq.m", "Rft", "Set", "Job", "Lot"];

const blankItem = () => ({
  id: `it-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name: "uPVC Casement Window",
  description: "uPVC casement window with 5mm clear toughened glass, premium white multi-chamber profile & multipoint lock",
  dimensions: "4 ft x 5 ft",
  qty: 1,
  unit: "Sq.ft",
  rate: 650,
  discount: 0,
  taxRate: 18,
});

export function QuotationEditor() {
  const { data, route, go, toast, addQuotation, updateQuotation } = useCRM();
  const id = route.params?.id;
  const quote = id ? (data.quotations || []).find((q: any) => q.id === id) : null;
  const employees = data.employees || [];

  const [draft, setDraft] = useState<any>(() => {
    if (quote) {
      return {
        ...quote,
        items: (quote.items || []).map((i: any) => ({ ...i })),
      };
    }
    // Prefill from params if converting from a lead
    const p = route.params || {};
    return {
      number: `SKY/QT/${new Date().getFullYear()}/${String(
        (data.quotations?.length || 0) + 101
      ).padStart(4, "0")}`,
      date: todayISO(),
      validUntil: todayISO(),
      leadId: p.leadId || "",
      customerName: p.customerName || "",
      projectName: p.projectName || "",
      customerCompany: p.customerCompany || "",
      customerPhone: p.customerPhone || "",
      customerEmail: p.customerEmail || "",
      customerAddress: p.customerAddress || "",
      siteAddress: p.siteAddress || p.customerAddress || "",
      customerGstin: "",
      employeeId: p.employeeId || employees[0]?.id || "",
      status: "Draft",
      paymentTerms: "50% Advance with confirmation order, 40% on dispatch of fabricated frames, 10% on completion of installation.",
      notes: "10 Years Warranty on uPVC profiles against fading & warping. 1 Year on moving hardware components. Civil preparation in client's scope.",
      items: [
        {
          name: "uPVC Casement Windows",
          description: "4 ft x 5 ft casement window with 5mm Saint-Gobain clear toughened glass & SS hinges",
          dimensions: "4 ft x 5 ft (4 nos)",
          qty: 80,
          unit: "Sq.ft",
          rate: 650,
          discount: 5,
          taxRate: 18,
        },
        {
          name: "uPVC Sliding Windows (3-Track with Mesh)",
          description: "6 ft x 5 ft 3-track sliding window with SS mosquito mesh shutter & premium rollers",
          dimensions: "6 ft x 5 ft (3 nos)",
          qty: 90,
          unit: "Sq.ft",
          rate: 580,
          discount: 5,
          taxRate: 18,
        },
        {
          name: "Fabrication, Glazing & Site Installation",
          description: "Full site alignment, polyurethane foam sealing, silicone weatherproofing & testing",
          dimensions: "Site Scope",
          qty: 1,
          unit: "Job",
          rate: 25000,
          discount: 0,
          taxRate: 18,
        },
      ],
    };
  });

  const [initialDraft, setInitialDraft] = useState<any>(() => JSON.parse(JSON.stringify(draft)));
  const [showExitModal, setShowExitModal] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Check if draft has unsaved changes
  const isDirty = useMemo(() => {
    return JSON.stringify(draft) !== JSON.stringify(initialDraft);
  }, [draft, initialDraft]);

  // Prevent accidental unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Compute live totals
  const totals = useMemo(() => {
    return computeTotals(
      (draft.items || []).map((i: any) => ({
        qty: Number(i.qty) || 0,
        rate: Number(i.rate) || 0,
        discount: Number(i.discount) || 0,
        taxRate: Number(i.taxRate || i.tax) || 18,
      })),
      true
    );
  }, [draft.items]);

  // Save handler
  const handleSave = () => {
    if (!draft.customerName?.trim()) {
      toast("Customer name is required", "error");
      return;
    }
    const cleanPhone = String(draft.customerPhone || "").replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      toast("Client Mobile Number is required and must be exactly 10 digits", "error");
      return;
    }

    if (id) {
      updateQuotation(id, draft);
      toast("Quotation updated successfully");
    } else {
      const created = addQuotation(draft);
      toast(`Quotation ${draft.number} created successfully`);
      go("quotationForm", { id: created.id });
    }
    setInitialDraft(JSON.parse(JSON.stringify(draft)));
  };

  const handleBack = () => {
    if (isDirty) {
      setShowExitModal(true);
    } else {
      go("quotations");
    }
  };

  // Item row operations
  const handleAddItem = () => {
    setDraft({
      ...draft,
      items: [...draft.items, blankItem()],
    });
  };

  const handleUpdateItem = (idx: number, patch: any) => {
    const next = [...draft.items];
    next[idx] = { ...next[idx], ...patch };
    setDraft({ ...draft, items: next });
  };

  const handleRemoveItem = (idx: number) => {
    if (draft.items.length <= 1) {
      toast("Quotation must have at least one line item", "error");
      return;
    }
    const next = draft.items.filter((_: any, i: number) => i !== idx);
    setDraft({ ...draft, items: next });
  };

  const handleDuplicateItem = (idx: number) => {
    const item = draft.items[idx];
    const cloned = { ...item, id: `it-${Date.now()}` };
    const next = [...draft.items];
    next.splice(idx + 1, 0, cloned);
    setDraft({ ...draft, items: next });
    toast("Line item duplicated");
  };

  // Vector printing and new tab preview
  const handlePrint = async () => {
    const el = printRef.current;
    if (!el) return;
    const fileName = getQuotationFileName(draft.number, draft.customerName);
    toast("Preparing A4 print document…");
    await printPdfFromElement(el, fileName);
  };

  const handlePreview = async () => {
    const el = printRef.current;
    if (!el) return;
    const fileName = getQuotationFileName(draft.number, draft.customerName);
    toast("Opening preview in new tab…");
    await previewPdfInNewTab(el, fileName);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header & Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-black cursor-pointer"
        >
          <ArrowLeft className="size-4" /> Back to Quotations Directory
        </button>
        <div className="flex flex-wrap items-center gap-2">
          {isDirty && (
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 animate-pulse">
              ● Unsaved Changes
            </span>
          )}
          <Button variant="outline" onClick={handlePreview}>
            <ExternalLink className="size-4 text-blue-600" /> Preview in New Tab
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="size-4" /> Print Document (A4)
          </Button>
          <Button variant="primary" onClick={handleSave}>
            <Save className="size-4" /> Save Quotation
          </Button>
        </div>
      </div>

      {/* Main Form Information Card */}
      <Card className="p-5">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div>
            <span className="font-mono text-xs font-extrabold bg-black text-white px-2 py-0.5 rounded">
              {formatQuotationNumber(draft.number)}
            </span>
            <h1 className="text-xl font-black text-neutral-900 mt-1">
              {id ? `Edit Quotation — ${draft.number}` : "Create New Quotation"}
            </h1>
          </div>
          <div className="w-48">
            <Field label="Quotation Status">
              <Select
                value={draft.status || "Draft"}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                options={QUOTATION_STATUSES}
              />
            </Field>
          </div>
        </div>

        {/* Client & Date Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <Field label="Quotation Number" required>
            <Input
              value={draft.number || ""}
              onChange={(e) => setDraft({ ...draft, number: e.target.value })}
            />
          </Field>
          <Field label="Quotation Date">
            <Input
              type="date"
              value={draft.date || ""}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            />
          </Field>
          <Field label="Valid Until Date">
            <Input
              type="date"
              value={draft.validUntil || ""}
              onChange={(e) => setDraft({ ...draft, validUntil: e.target.value })}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          <Field label="Customer Full Name" required>
            <Input
              value={draft.customerName || ""}
              onChange={(e) => setDraft({ ...draft, customerName: e.target.value })}
              placeholder="e.g. Anand Mahindra"
            />
          </Field>
          <Field label="Project / Villa / Site Name">
            <Input
              value={draft.projectName || ""}
              onChange={(e) => setDraft({ ...draft, projectName: e.target.value })}
              placeholder="e.g. Mahindra Villa, Baner"
            />
          </Field>
          <Field label="Company / Entity Name">
            <Input
              value={draft.customerCompany || ""}
              onChange={(e) => setDraft({ ...draft, customerCompany: e.target.value })}
              placeholder="Optional company name"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          <Field label="Client Mobile (10 Digits)" required>
            <Input
              value={draft.customerPhone || ""}
              onChange={(e) => setDraft({ ...draft, customerPhone: e.target.value })}
              placeholder="e.g. 9822011001"
            />
          </Field>
          <Field label="Client Email">
            <Input
              type="email"
              value={draft.customerEmail || ""}
              onChange={(e) => setDraft({ ...draft, customerEmail: e.target.value })}
              placeholder="e.g. client@example.com"
            />
          </Field>
          <Field label="Customer GSTIN">
            <Input
              value={draft.customerGstin || ""}
              onChange={(e) => setDraft({ ...draft, customerGstin: e.target.value })}
              placeholder="Optional GST number"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
          <Field label="Site Delivery / Installation Address">
            <Textarea
              value={draft.siteAddress || draft.customerAddress || ""}
              onChange={(e) => setDraft({ ...draft, siteAddress: e.target.value })}
              placeholder="Site location where uPVC doors & windows will be installed"
            />
          </Field>
          <Field label="Billing Address">
            <Textarea
              value={draft.billingAddress || draft.customerAddress || ""}
              onChange={(e) => setDraft({ ...draft, billingAddress: e.target.value })}
              placeholder="Billing address for tax invoice records"
            />
          </Field>
        </div>
      </Card>

      {/* uPVC Window Line Items Editor */}
      <Card className="p-5">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-bold text-neutral-900">uPVC Window & Door Systems</h2>
            <p className="text-xs text-neutral-500">
              Specify system category, dimensions, clear/toughened glass, rates, and discounts
            </p>
          </div>
          <Button size="sm" variant="primary" onClick={handleAddItem}>
            <Plus className="size-4" /> Add System / Line Item
          </Button>
        </div>

        <div className="divide-y divide-neutral-200 mt-3">
          {(draft.items || []).map((item: any, idx: number) => {
            const lineBase = (Number(item.qty) || 0) * (Number(item.rate) || 0);
            const lineDisc = lineBase * ((Number(item.discount) || 0) / 100);
            const lineNet = lineBase - lineDisc;

            return (
              <div key={idx} className="py-4 space-y-3 bg-neutral-50/40 p-3 rounded-lg mb-2 border border-neutral-200">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-neutral-600 uppercase">
                    System #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDuplicateItem(idx)}
                      title="Duplicate item"
                    >
                      <Copy className="size-3.5" /> Duplicate
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-rose-600 hover:text-rose-700"
                      title="Delete item"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="uPVC Product Category" required>
                    <Select
                      value={item.name || item.category || UPVC_CATEGORIES[0]}
                      onChange={(e) => handleUpdateItem(idx, { name: e.target.value, category: e.target.value })}
                      options={UPVC_CATEGORIES}
                    />
                  </Field>
                  <Field label="Dimensions / Frame Size (e.g. 6 ft x 5 ft)">
                    <Input
                      value={item.dimensions || item.type || ""}
                      onChange={(e) => handleUpdateItem(idx, { dimensions: e.target.value, type: e.target.value })}
                      placeholder="e.g. 4 ft x 5 ft (4 nos)"
                    />
                  </Field>
                  <Field label="Unit of Measurement">
                    <Select
                      value={item.unit || "Sq.ft"}
                      onChange={(e) => handleUpdateItem(idx, { unit: e.target.value })}
                      options={UNITS}
                    />
                  </Field>
                </div>

                <Field label="Detailed Profile & Glass Specification">
                  <Input
                    value={item.description || ""}
                    onChange={(e) => handleUpdateItem(idx, { description: e.target.value })}
                    placeholder="e.g. Multi-chamber white uPVC profile, 5mm Saint-Gobain clear toughened glass, multipoint locking handle"
                  />
                </Field>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
                  <Field label="Quantity">
                    <Input
                      type="number"
                      value={item.qty}
                      onChange={(e) => handleUpdateItem(idx, { qty: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Rate per Unit (₹)">
                    <Input
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleUpdateItem(idx, { rate: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Discount (%)">
                    <Input
                      type="number"
                      value={item.discount || 0}
                      onChange={(e) => handleUpdateItem(idx, { discount: Number(e.target.value) })}
                    />
                  </Field>
                  <div className="pb-1 text-right">
                    <span className="block text-[11px] font-bold uppercase text-neutral-400">Line Amount</span>
                    <span className="text-base font-black text-neutral-950">{inr(lineNet)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Button size="sm" variant="outline" onClick={handleAddItem} className="mt-3">
          <Plus className="size-4" /> Add Another Line Item
        </Button>
      </Card>

      {/* Commercial Terms & Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 space-y-3">
            <h3 className="font-bold text-sm text-neutral-900 border-b border-neutral-100 pb-2">
              Commercial Terms & Warranties
            </h3>
            <Field label="Payment Milestones & Commercial Terms">
              <Textarea
                value={draft.paymentTerms || ""}
                onChange={(e) => setDraft({ ...draft, paymentTerms: e.target.value })}
                rows={3}
              />
            </Field>
            <Field label="Warranty, Civil Exclusions & Special Notes">
              <Textarea
                value={draft.notes || ""}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                rows={3}
              />
            </Field>
          </Card>
        </div>

        <div>
          <Card className="p-5 space-y-3 border-neutral-300">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
              Financial Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal (Gross):</span>
                <span className="font-semibold text-neutral-900">{inr(totals.subtotal)}</span>
              </div>
              {totals.totalDiscount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Total Discount:</span>
                  <span className="font-semibold">- {inr(totals.totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-neutral-900 bg-neutral-50 p-1.5 rounded">
                <span>Taxable Value:</span>
                <span>{inr(totals.taxable)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>CGST (9%):</span>
                <span className="font-medium text-neutral-900">{inr(totals.cgst)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>SGST (9%):</span>
                <span className="font-medium text-neutral-900">{inr(totals.sgst)}</span>
              </div>
              {totals.roundOff !== 0 && (
                <div className="flex justify-between text-neutral-400 text-[11px]">
                  <span>Round off:</span>
                  <span>{totals.roundOff > 0 ? `+${totals.roundOff}` : totals.roundOff}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-white bg-black p-3 rounded-lg mt-3">
                <span>Grand Total:</span>
                <span>{inr(totals.total)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100">
              <p className="text-[10.5px] font-bold uppercase text-neutral-500">Amount in Words:</p>
              <p className="text-xs font-extrabold text-neutral-900 mt-0.5 leading-snug">
                {amountInWords(totals.total)}
              </p>
            </div>

            <Button variant="primary" onClick={handleSave} className="w-full mt-3">
              <Save className="size-4" /> Save Quotation
            </Button>
          </Card>
        </div>
      </div>

      {/* Hidden container for print template */}
      <div style={{ position: "fixed", left: -9999, top: -9999, width: 840 }}>
        <QuotationPrintTemplate ref={printRef} quotation={{ ...draft, ...totals }} />
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      <ConfirmDialog
        open={showExitModal}
        title="Discard Unsaved Changes?"
        message="You have unsaved changes in this quotation. Are you sure you want to leave without saving?"
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => {
          setShowExitModal(false);
          go("quotations");
        }}
      />
    </div>
  );
}
