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
  Calculator,
  Layers,
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
  formatQuotationNumber,
  getQuotationFileName,
  todayISO,
} from "../utils/format";
import { printPdfFromElement, previewPdfInNewTab } from "../utils/pdf";
import { QuotationPrintTemplate } from "../components/QuotationPrintTemplate";
import { QUOTATION_STATUSES } from "./Quotations";

export const PRODUCT_BRANDS = [
  "Fenstech",
  "Skyarth Premium",
  "Deceuninck",
  "Prominance",
  "Kommerling",
  "Aluplast",
];

export const WINDOW_COLOURS = [
  "White",
  "Golden Oak",
  "Dark Oak",
  "Walnut",
  "Anthracite Grey",
  "Mahogany",
  "Custom Textured",
];

export const MESH_TYPES = [
  "Nylon",
  "SS 304 Mosquito Mesh",
  "Pleated Mesh",
  "Fiberglass Mesh",
  "Not Applicable",
];

export const GLASS_SPECS = [
  "CLEAR GLASS",
  "FROSTED GLASS",
  "TOUGHENED CLEAR GLASS",
  "TINTED GLASS",
  "DGU (DOUBLE GLAZING)",
  "LAMINATED SAFETY GLASS",
];

export const LOCKING_TYPES = [
  "TOUCHLOCK",
  "LOUVERS",
  "HANDLE",
  "CRESCENT LOCK",
  "MULTIPOINT LOCK",
  "POP-UP HANDLE",
];

export const DESIGN_SPECS = [
  "3 TRACK 2 GLASS 1 MESH (99MM SECTION)",
  "2 TRACK 2 GLASS (60MM SECTION)",
  "3 TRACK 3 GLASS (99MM SECTION)",
  "LOUVERS WITH EXHAUST FAN PROVISION",
  "OPENABLE WINDOW (CASEMENT)",
  "FIXED GLASS WINDOW (60MM SECTION)",
  "FRENCH WINDOW WITH MULTIPOINT LOCK",
  "SLIDE & FOLD (HEAVY SECTION)",
  "LIFT & SLIDE PREMIUM SYSTEM",
];

const blankWindowItem = (idx = 1) => ({
  id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  windowCode: `W${idx}`,
  location: `BEDROOM ${idx > 1 ? idx : 1}`,
  widthMm: 1524,
  heightMm: 1402,
  areaSqft: 23.12,
  qty: 1,
  totalAreaSqft: 23.12,
  rate: 480,
  valueEach: 11098.18,
  totalValue: 11098.18,
  glassThickness: "5",
  glassSpec: "CLEAR GLASS",
  lockingType: "TOUCHLOCK",
  designSpecs: "3 TRACK 2 GLASS 1 MESH (99MM SECTION)",
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
        subject: quote.subject || "Delivery Of uPVC DOORS & WINDOWS",
        productBrand: quote.productBrand || "Fenstech",
        windowColour: quote.windowColour || "White",
        deliveryDays: quote.deliveryDays || "Delivery with in 30 days",
        meshType: quote.meshType || "Nylon",
        paymentTerms: quote.paymentTerms || "Payment - 100% Advance",
        hardwareBrand: quote.hardwareBrand || "Windseal / DNV Imported hardware",
        installationRatePerSqft: quote.installationRatePerSqft !== undefined ? quote.installationRatePerSqft : 30,
        installationCharges: quote.installationCharges !== undefined ? quote.installationCharges : "",
        transportCharges: quote.transportCharges !== undefined ? quote.transportCharges : 2500,
        taxRate: quote.taxRate !== undefined ? quote.taxRate : 18,
        representativeName: quote.representativeName || "Mr. Swapnil Pawar",
        representativeAddress:
          quote.representativeAddress ||
          "Gat NO.226, BAIF Road, Manjari Khurd, Satav wasti, Pune 412307",
        items: (quote.items || []).map((i: any, idx: number) => normalizeItem(i, idx)),
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
      customerName: p.customerName || "Mr. Mahesh Chawla Sir",
      projectName: p.projectName || "PUNE",
      customerCompany: p.customerCompany || "",
      customerPhone: p.customerPhone || "9822011001",
      customerEmail: p.customerEmail || "",
      customerAddress: p.customerAddress || "Pune, Maharashtra",
      siteAddress: p.siteAddress || p.customerAddress || "PUNE",
      billingAddress: p.customerAddress || "PUNE",
      customerGstin: "",
      employeeId: p.employeeId || employees[0]?.id || "",
      expectedCompletionDate: p.expectedCompletionDate || "",
      status: "Draft",
      subject: "Delivery Of uPVC DOORS & WINDOWS",
      productBrand: "Fenstech",
      windowColour: "White",
      deliveryDays: "Delivery with in 30 days",
      meshType: "Nylon",
      paymentTerms: "Payment - 100% Advance",
      hardwareBrand: "Windseal / DNV Imported hardware",
      installationRatePerSqft: 30,
      installationCharges: "",
      transportCharges: 2500,
      taxRate: 18,
      representativeName: "Mr. Swapnil Pawar",
      representativeAddress: "Gat NO.226, BAIF Road, Manjari Khurd, Satav wasti, Pune 412307",
      items: [
        {
          id: "w-1",
          windowCode: "W1",
          location: "BEDROOM 1",
          widthMm: 1524,
          heightMm: 1402,
          areaSqft: 23.12,
          qty: 1,
          totalAreaSqft: 23.12,
          rate: 480,
          valueEach: 11098.18,
          totalValue: 11098.18,
          glassThickness: "5",
          glassSpec: "CLEAR GLASS",
          lockingType: "TOUCHLOCK",
          designSpecs: "3 TRACK 2 GLASS 1 MESH (99MM SECTION)",
        },
        {
          id: "w-2",
          windowCode: "W2",
          location: "WASHROOM 1",
          widthMm: 914,
          heightMm: 701,
          areaSqft: 6.94,
          qty: 1,
          totalAreaSqft: 6.94,
          rate: 460,
          valueEach: 3190.73,
          totalValue: 3190.73,
          glassThickness: "4",
          glassSpec: "FROSTED GLASS",
          lockingType: "LOUVERS",
          designSpecs: "LOUVERS WITH EXHAUST FAN PROVISION",
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

  // Financial calculations
  const summary = useMemo(() => {
    const items = draft.items || [];
    const totalUnits = items.reduce((sum: number, it: any) => sum + (Number(it.qty) || 0), 0);
    const totalAreaSqft = Number(
      items.reduce((sum: number, it: any) => sum + (Number(it.totalAreaSqft) || 0), 0).toFixed(2)
    );
    const totalWindowValue = Number(
      items.reduce((sum: number, it: any) => sum + (Number(it.totalValue) || 0), 0).toFixed(2)
    );
    const avgRatePerSqft = totalAreaSqft > 0 ? Math.round(totalWindowValue / totalAreaSqft) : 0;

    const installRate = draft.installationRatePerSqft !== undefined ? Number(draft.installationRatePerSqft) : 30;
    const installationCharges =
      draft.installationCharges !== undefined && draft.installationCharges !== ""
        ? Number(draft.installationCharges)
        : Number((installRate * totalAreaSqft).toFixed(2));

    const transportCharges =
      draft.transportCharges !== undefined && draft.transportCharges !== ""
        ? Number(draft.transportCharges)
        : 2500.0;

    const totalProjectValue = Number((totalWindowValue + installationCharges + transportCharges).toFixed(2));
    const gstRate = draft.taxRate !== undefined ? Number(draft.taxRate) : 18;
    const gstAmount = Number(((totalProjectValue * gstRate) / 100).toFixed(2));
    const grandTotal = Number((totalProjectValue + gstAmount).toFixed(2));

    return {
      totalUnits,
      totalAreaSqft,
      totalWindowValue,
      avgRatePerSqft,
      installRate,
      installationCharges,
      transportCharges,
      totalProjectValue,
      gstRate,
      gstAmount,
      grandTotal,
    };
  }, [
    draft.items,
    draft.installationRatePerSqft,
    draft.installationCharges,
    draft.transportCharges,
    draft.taxRate,
  ]);

  // Save handler
  const handleSave = () => {
    if (!draft.customerName?.trim()) {
      toast("Customer name is required", "error");
      return;
    }

    const payload = {
      ...draft,
      value: summary.grandTotal,
      installationCharges: summary.installationCharges,
      totalAreaSqft: summary.totalAreaSqft,
      totalUnits: summary.totalUnits,
      grandTotal: summary.grandTotal,
    };

    if (id) {
      updateQuotation(id, payload);
      toast("Quotation updated successfully");
    } else {
      const created = addQuotation(payload);
      toast(`Quotation ${draft.number} created successfully`);
      go("quotationForm", { id: created.id });
    }
    setInitialDraft(JSON.parse(JSON.stringify(payload)));
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
    const nextIdx = (draft.items?.length || 0) + 1;
    setDraft({
      ...draft,
      items: [...draft.items, blankWindowItem(nextIdx)],
    });
    toast(`Added Window W${nextIdx}`);
  };

  const handleUpdateItem = (idx: number, patch: any) => {
    const next = [...draft.items];
    const current = { ...next[idx], ...patch };

    // Auto-calculate area in sqft when Width or Height in mm change
    if (patch.widthMm !== undefined || patch.heightMm !== undefined) {
      const w = Number(current.widthMm) || 0;
      const h = Number(current.heightMm) || 0;
      if (w > 0 && h > 0 && patch.areaSqft === undefined) {
        current.areaSqft = Number(((w * h) / 92903.04).toFixed(2));
      }
    }

    const qty = Number(current.qty) || 1;
    const areaSqft = Number(current.areaSqft) || 0;
    const rate = Number(current.rate) || 0;

    current.totalAreaSqft = Number((areaSqft * qty).toFixed(2));
    current.valueEach = Number((areaSqft * rate).toFixed(2));
    current.totalValue = Number((current.totalAreaSqft * rate).toFixed(2));

    next[idx] = current;
    setDraft({ ...draft, items: next });
  };

  const handleRemoveItem = (idx: number) => {
    if (draft.items.length <= 1) {
      toast("Quotation must have at least one window schedule item", "error");
      return;
    }
    const next = draft.items.filter((_: any, i: number) => i !== idx);
    setDraft({ ...draft, items: next });
  };

  const handleDuplicateItem = (idx: number) => {
    const item = draft.items[idx];
    const nextCode = `W${draft.items.length + 1}`;
    const cloned = { ...item, id: `w-${Date.now()}`, windowCode: nextCode };
    const next = [...draft.items];
    next.splice(idx + 1, 0, cloned);
    setDraft({ ...draft, items: next });
    toast(`Window duplicated as ${nextCode}`);
  };

  // Vector printing and new tab preview
  const handlePrint = async () => {
    const el = printRef.current;
    if (!el) return;
    const fileName = getQuotationFileName(draft.number, draft.customerName);
    toast("Preparing A4 Landscape print document…");
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
    <div className="space-y-4 pb-16">
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
            <ExternalLink className="size-4 text-blue-600" /> Preview A4 Landscape
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="size-4" /> Print Quotation (PDF)
          </Button>
          <Button variant="primary" onClick={handleSave}>
            <Save className="size-4" /> Save Quotation
          </Button>
        </div>
      </div>

      {/* Main Metadata Card */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-extrabold bg-black text-white px-2 py-0.5 rounded">
                {formatQuotationNumber(draft.number)}
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
                Fenstech Schedule Format
              </span>
            </div>
            <h1 className="text-xl font-black text-neutral-900 mt-1">
              {id ? `Edit Quotation — ${draft.number}` : "Create Detailed Architectural Quotation"}
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4">
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
          <Field label="Subject Line">
            <Input
              value={draft.subject || "Delivery Of uPVC DOORS & WINDOWS"}
              onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
              placeholder="e.g. Delivery Of uPVC DOORS & WINDOWS"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
          <Field label="Client / Customer Name" required>
            <Input
              value={draft.customerName || ""}
              onChange={(e) => setDraft({ ...draft, customerName: e.target.value })}
              placeholder="e.g. Mr. Mahesh Chawla Sir"
            />
          </Field>
          <Field label="Project / City Location">
            <Input
              value={draft.projectName || ""}
              onChange={(e) => setDraft({ ...draft, projectName: e.target.value })}
              placeholder="e.g. PUNE / Baner Bungalow"
            />
          </Field>
          <Field label="Client Phone Number">
            <Input
              value={draft.customerPhone || ""}
              onChange={(e) => setDraft({ ...draft, customerPhone: e.target.value })}
              placeholder="e.g. 9822011001"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
          <Field label="Site Delivery Address">
            <Input
              value={draft.siteAddress || ""}
              onChange={(e) => setDraft({ ...draft, siteAddress: e.target.value })}
              placeholder="Delivery / Installation location address"
            />
          </Field>
          <Field label="Expected Project Completion Date">
            <Input
              type="date"
              value={draft.expectedCompletionDate || ""}
              onChange={(e) => setDraft({ ...draft, expectedCompletionDate: e.target.value })}
            />
          </Field>
        </div>
      </Card>

      {/* 14-Column Architectural Window Schedule Editor */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-amber-600" />
              <h2 className="text-base font-bold text-neutral-900">
                Window & Door Schedule (14-Column Engineering Specification)
              </h2>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Input Width & Height in MM; Area (sqft), Line Total & Window Values calculate automatically.
            </p>
          </div>
          <Button size="sm" variant="primary" onClick={handleAddItem}>
            <Plus className="size-4" /> Add Window / Door
          </Button>
        </div>

        <div className="space-y-4 mt-4">
          {(draft.items || []).map((it: any, idx: number) => {
            return (
              <div
                key={it.id || idx}
                className="p-3.5 rounded-lg border border-neutral-300 bg-neutral-50/60 space-y-3"
              >
                {/* Row Header */}
                <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black bg-neutral-900 text-white px-2 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                    <span className="font-mono font-bold text-neutral-950 text-sm">
                      {it.windowCode || `W${idx + 1}`}
                    </span>
                    <span className="text-xs font-bold text-neutral-500 uppercase">
                      · {it.location || "Window Location"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDuplicateItem(idx)}
                      title="Duplicate Window"
                    >
                      <Copy className="size-3.5" /> Duplicate
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-rose-600 hover:text-rose-700"
                      title="Delete Window"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Dimension & Area Calculations Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5">
                  <Field label="Window Code">
                    <Input
                      value={it.windowCode || ""}
                      onChange={(e) => handleUpdateItem(idx, { windowCode: e.target.value })}
                      placeholder="e.g. W1, D1"
                    />
                  </Field>
                  <Field label="Location">
                    <Input
                      value={it.location || ""}
                      onChange={(e) => handleUpdateItem(idx, { location: e.target.value })}
                      placeholder="e.g. BEDROOM 1"
                    />
                  </Field>
                  <Field label="Width in (MM)">
                    <Input
                      type="number"
                      value={it.widthMm || ""}
                      onChange={(e) => handleUpdateItem(idx, { widthMm: Number(e.target.value) })}
                      placeholder="1524"
                    />
                  </Field>
                  <Field label="Height in (MM)">
                    <Input
                      type="number"
                      value={it.heightMm || ""}
                      onChange={(e) => handleUpdateItem(idx, { heightMm: Number(e.target.value) })}
                      placeholder="1402"
                    />
                  </Field>
                  <Field label="Area (sqft)">
                    <Input
                      type="number"
                      step="0.01"
                      value={it.areaSqft || ""}
                      onChange={(e) => handleUpdateItem(idx, { areaSqft: Number(e.target.value) })}
                      placeholder="23.12"
                    />
                  </Field>
                  <Field label="Unit No. (Qty)">
                    <Input
                      type="number"
                      value={it.qty || 1}
                      onChange={(e) => handleUpdateItem(idx, { qty: Number(e.target.value) })}
                    />
                  </Field>
                </div>

                {/* Technical Specs: Glass, Locking & Design Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <Field label="Rate per sqft (₹)">
                    <Input
                      type="number"
                      value={it.rate || 480}
                      onChange={(e) => handleUpdateItem(idx, { rate: Number(e.target.value) })}
                    />
                  </Field>
                  <Field label="Glass Thickness (mm)">
                    <Input
                      value={it.glassThickness || "5"}
                      onChange={(e) => handleUpdateItem(idx, { glassThickness: e.target.value })}
                      placeholder="e.g. 5 or 4"
                    />
                  </Field>
                  <Field label="Glass Specs">
                    <Select
                      value={it.glassSpec || "CLEAR GLASS"}
                      onChange={(e) => handleUpdateItem(idx, { glassSpec: e.target.value })}
                      options={GLASS_SPECS}
                    />
                  </Field>
                  <Field label="Locking Type">
                    <Select
                      value={it.lockingType || "TOUCHLOCK"}
                      onChange={(e) => handleUpdateItem(idx, { lockingType: e.target.value })}
                      options={LOCKING_TYPES}
                    />
                  </Field>
                </div>

                {/* Design Specifications & Live Calculations */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-8">
                    <Field label="Design Specifications">
                      <Select
                        value={it.designSpecs || DESIGN_SPECS[0]}
                        onChange={(e) => handleUpdateItem(idx, { designSpecs: e.target.value })}
                        options={DESIGN_SPECS}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-4 bg-white p-2 rounded border border-neutral-200 flex justify-around items-center text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase font-bold">Total Area</span>
                      <span className="font-mono font-bold text-neutral-900">{Number(it.totalAreaSqft).toFixed(2)} sqft</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase font-bold">Value Each</span>
                      <span className="font-mono font-bold text-neutral-900">{inr(Number(it.valueEach))}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-500 block uppercase font-bold">Total Line Value</span>
                      <span className="font-mono font-black text-neutral-950">{inr(Number(it.totalValue))}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Button size="sm" variant="outline" onClick={handleAddItem} className="mt-4">
          <Plus className="size-4" /> Add Another Window to Schedule
        </Button>
      </Card>

      {/* Technical Specifications & Commercial Terms */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Side: Technical Options & Notes */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-4 space-y-3">
            <h3 className="font-bold text-sm text-neutral-900 border-b border-neutral-100 pb-2">
              Technical Specifications & Commercial Terms (PDF Box 1)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Product Profile Brand">
                <Select
                  value={draft.productBrand || "Fenstech"}
                  onChange={(e) => setDraft({ ...draft, productBrand: e.target.value })}
                  options={PRODUCT_BRANDS}
                />
              </Field>
              <Field label="Window Colour">
                <Select
                  value={draft.windowColour || "White"}
                  onChange={(e) => setDraft({ ...draft, windowColour: e.target.value })}
                  options={WINDOW_COLOURS}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Delivery Schedule">
                <Input
                  value={draft.deliveryDays || "Delivery with in 30 days"}
                  onChange={(e) => setDraft({ ...draft, deliveryDays: e.target.value })}
                  placeholder="e.g. Delivery with in 30 days"
                />
              </Field>
              <Field label="Mesh Type">
                <Select
                  value={draft.meshType || "Nylon"}
                  onChange={(e) => setDraft({ ...draft, meshType: e.target.value })}
                  options={MESH_TYPES}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Payment Terms">
                <Input
                  value={draft.paymentTerms || "Payment - 100% Advance"}
                  onChange={(e) => setDraft({ ...draft, paymentTerms: e.target.value })}
                  placeholder="e.g. Payment - 100% Advance"
                />
              </Field>
              <Field label="Hardware Specification">
                <Input
                  value={draft.hardwareBrand || "Windseal / DNV Imported hardware"}
                  onChange={(e) => setDraft({ ...draft, hardwareBrand: e.target.value })}
                  placeholder="e.g. Windseal / DNV Imported hardware"
                />
              </Field>
            </div>
          </Card>

          {/* Representative & Address Box */}
          <Card className="p-4 space-y-3">
            <h3 className="font-bold text-sm text-neutral-900 border-b border-neutral-100 pb-2">
              Representative & Dispatch Office (PDF Box 3)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Company Representative Name">
                <Input
                  value={draft.representativeName || "Mr. Swapnil Pawar"}
                  onChange={(e) => setDraft({ ...draft, representativeName: e.target.value })}
                />
              </Field>
              <Field label="Office / Factory Address">
                <Input
                  value={
                    draft.representativeAddress ||
                    "Gat NO.226, BAIF Road, Manjari Khurd, Satav wasti, Pune 412307"
                  }
                  onChange={(e) => setDraft({ ...draft, representativeAddress: e.target.value })}
                />
              </Field>
            </div>
          </Card>
        </div>

        {/* Right Side: Financial Calculation Summary (PDF Box 2) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 space-y-3 border-neutral-400 shadow-sm">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <h3 className="font-black text-sm uppercase tracking-wide text-neutral-900">
                Summary Calculation
              </h3>
              <span className="text-xs font-bold font-mono text-neutral-500">
                {summary.totalUnits} Units · {summary.totalAreaSqft} Sq.ft
              </span>
            </div>

            {/* Configurable charges */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Field label="Installation Rate (₹ / sqft)">
                <Input
                  type="number"
                  value={draft.installationRatePerSqft !== undefined ? draft.installationRatePerSqft : 30}
                  onChange={(e) =>
                    setDraft({ ...draft, installationRatePerSqft: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Transport Charges (₹)">
                <Input
                  type="number"
                  value={draft.transportCharges !== undefined ? draft.transportCharges : 2500}
                  onChange={(e) => setDraft({ ...draft, transportCharges: Number(e.target.value) })}
                />
              </Field>
            </div>

            {/* Financial Breakdown Table */}
            <div className="divide-y divide-neutral-200 border border-neutral-300 rounded text-xs overflow-hidden mt-2">
              <div className="flex justify-between p-2 bg-neutral-50 font-semibold">
                <span>Total No. Of Windows / Doors</span>
                <span className="font-bold">{summary.totalUnits}</span>
              </div>
              <div className="flex justify-between p-2">
                <span className="text-neutral-700">Total Window Value (Base)</span>
                <span className="font-mono font-bold text-neutral-900">
                  {inr(summary.totalWindowValue)}
                </span>
              </div>
              <div className="flex justify-between p-2">
                <span className="text-neutral-700">Average Rate per Sqft</span>
                <span className="font-mono font-bold text-neutral-900">
                  ₹{summary.avgRatePerSqft} / sqft
                </span>
              </div>
              <div className="flex justify-between p-2">
                <span className="text-neutral-700">
                  Installation Charges (₹{summary.installRate} × {summary.totalAreaSqft} sqft)
                </span>
                <span className="font-mono font-semibold text-neutral-900">
                  {inr(summary.installationCharges)}
                </span>
              </div>
              <div className="flex justify-between p-2">
                <span className="text-neutral-700">Transport & Handling</span>
                <span className="font-mono font-semibold text-neutral-900">
                  {inr(summary.transportCharges)}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-neutral-100 font-bold border-t border-neutral-300">
                <span>Total Project Value</span>
                <span className="font-mono">{inr(summary.totalProjectValue)}</span>
              </div>
              <div className="flex justify-between p-2">
                <span className="text-neutral-700">GST 18%</span>
                <span className="font-mono font-semibold text-neutral-900">
                  {inr(summary.gstAmount)}
                </span>
              </div>
              <div className="flex justify-between p-2.5 bg-neutral-950 text-white font-extrabold text-sm">
                <span>Grand Total (INR)</span>
                <span className="font-mono">{inr(summary.grandTotal)}</span>
              </div>
            </div>

            <Button variant="primary" className="w-full mt-3 font-bold" onClick={handleSave}>
              <Save className="size-4" /> Save Quotation
            </Button>
          </Card>
        </div>
      </div>

      {/* Hidden Vector Print Template for PDF Export */}
      <div className="hidden">
        <QuotationPrintTemplate ref={printRef} quotation={draft} />
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      <ConfirmDialog
        open={showExitModal}
        title="Unsaved Changes"
        message="You have unsaved changes in this quotation. Are you sure you want to leave?"
        confirmLabel="Discard & Leave"
        variant="danger"
        onCancel={() => setShowExitModal(false)}
        onConfirm={() => {
          setShowExitModal(false);
          go("quotations");
        }}
      />
    </div>
  );
}

function normalizeItem(i: any, idx: number) {
  const widthMm = Number(i.widthMm) || (i.dimensions ? parseDim(i.dimensions, "w") : 1524);
  const heightMm = Number(i.heightMm) || (i.dimensions ? parseDim(i.dimensions, "h") : 1402);
  const qty = Number(i.qty) || 1;
  const rate = Number(i.rate) || 480;
  const computedArea = Number(((widthMm * heightMm) / 92903.04).toFixed(2));
  const areaSqft = i.areaSqft !== undefined ? Number(i.areaSqft) : computedArea;
  const totalAreaSqft = i.totalAreaSqft !== undefined ? Number(i.totalAreaSqft) : Number((areaSqft * qty).toFixed(2));
  const valueEach = i.valueEach !== undefined ? Number(i.valueEach) : Number((areaSqft * rate).toFixed(2));
  const totalValue = i.totalValue !== undefined ? Number(i.totalValue) : Number((totalAreaSqft * rate).toFixed(2));

  return {
    ...i,
    id: i.id || `it-${idx}`,
    windowCode: i.windowCode || `W${idx + 1}`,
    location: i.location || i.name || "WINDOW",
    widthMm,
    heightMm,
    areaSqft,
    qty,
    totalAreaSqft,
    rate,
    valueEach,
    totalValue,
    glassThickness: i.glassThickness || "5",
    glassSpec: i.glassSpec || "CLEAR GLASS",
    lockingType: i.lockingType || "TOUCHLOCK",
    designSpecs: i.designSpecs || i.description || "3 TRACK 2 GLASS 1 MESH (99MM SECTION)",
  };
}

function parseDim(dim: string, axis: "w" | "h"): number {
  if (!dim) return 1200;
  const match = dim.match(/(\d+)\s*(?:x|X|\*)\s*(\d+)/);
  if (match) {
    const val = axis === "w" ? match[1] : match[2];
    return Number(val) || 1200;
  }
  return 1200;
}
