import { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus,
  Eye,
  Printer,
  Download,
  Pencil,
  Trash2,
  Copy,
  ExternalLink,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { useCRM, empName } from "../store";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DataTable,
  PageHeader,
  SearchInput,
  Select,
  StatCard,
  Toolbar,
  type Column,
} from "../components/ui-kit";
import { inr, dateFmt, computeTotals, formatQuotationNumber, getQuotationFileName } from "../utils/format";
import { printPdfFromElement, previewPdfInNewTab } from "../utils/pdf";
import { QuotationPrintTemplate } from "../components/QuotationPrintTemplate";

export const QUOTATION_STATUSES = ["Draft", "Sent", "Viewed", "Under Negotiation", "Accepted", "Rejected", "Expired"];

export function Quotations() {
  const { data, go, toast, deleteQuotation, duplicateQuotation } = useCRM();
  const quotations = data.quotations || [];
  const printRef = useRef<HTMLDivElement>(null);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [actionState, setActionState] = useState<{
    type: "print" | "preview";
    quote: any;
  } | null>(null);

  // Trigger print / preview when actionState changes
  useEffect(() => {
    if (!actionState) return;

    const perform = async () => {
      await new Promise((r) => setTimeout(r, 120));
      const el = printRef.current;
      if (!el) {
        toast("Document template could not be rendered", "error");
        setActionState(null);
        return;
      }

      const fileName = getQuotationFileName(actionState.quote.number, actionState.quote.customerName);
      try {
        if (actionState.type === "print") {
          toast("Preparing A4 print document…");
          await printPdfFromElement(el, fileName);
        } else if (actionState.type === "preview") {
          toast("Opening quotation preview in new tab…");
          await previewPdfInNewTab(el, fileName);
        }
      } catch (err) {
        console.error(err);
        toast("Action could not be completed", "error");
      } finally {
        setActionState(null);
      }
    };

    perform();
  }, [actionState, toast]);

  // Compute quotation total
  const getQuoteTotal = (quote: any) => {
    if (quote.grandTotal !== undefined && Number(quote.grandTotal) > 0) {
      return Number(quote.grandTotal);
    }
    const items = quote.items || [];
    if (items.some((i: any) => i.totalValue !== undefined || i.areaSqft !== undefined)) {
      const totalArea = items.reduce(
        (sum: number, it: any) => sum + (Number(it.totalAreaSqft || (it.areaSqft * (it.qty || 1))) || 0),
        0
      );
      const totalVal = items.reduce(
        (sum: number, it: any) => sum + (Number(it.totalValue || (it.areaSqft * it.rate)) || 0),
        0
      );
      const install =
        quote.installationCharges !== undefined && quote.installationCharges !== ""
          ? Number(quote.installationCharges)
          : Number(((quote.installationRatePerSqft || 30) * totalArea).toFixed(2));
      const transport =
        quote.transportCharges !== undefined && quote.transportCharges !== ""
          ? Number(quote.transportCharges)
          : 2500;
      const subtotal = totalVal + install + transport;
      const gst = subtotal * ((quote.taxRate || 18) / 100);
      return Math.round(subtotal + gst);
    }

    const totals = computeTotals(
      items.map((i: any) => ({
        qty: Number(i.qty) || 0,
        rate: Number(i.rate) || 0,
        discount: Number(i.discount) || 0,
        taxRate: Number(i.tax || i.taxRate) || 18,
      })),
      true
    );
    return totals.total;
  };

  // Filtered rows
  const filtered = useMemo(() => {
    return quotations.filter((qt: any) => {
      const matchQ =
        !q ||
        [qt.number, qt.customerName, qt.projectName, qt.customerCompany, qt.customerPhone]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q.toLowerCase()));
      const matchStatus = !status || qt.status === status;
      return matchQ && matchStatus;
    });
  }, [quotations, q, status]);

  // Stat metrics
  const stats = useMemo(() => {
    const total = quotations.length;
    const drafts = quotations.filter((x: any) => x.status === "Draft").length;
    const negotiation = quotations.filter((x: any) => ["Sent", "Viewed", "Under Negotiation"].includes(x.status)).length;
    const accepted = quotations.filter((x: any) => x.status === "Accepted").length;
    const pipelineValue = quotations
      .filter((x: any) => x.status !== "Rejected")
      .reduce((sum: number, x: any) => sum + getQuoteTotal(x), 0);
    return { total, drafts, negotiation, accepted, pipelineValue };
  }, [quotations]);

  const handleDuplicate = (quoteId: string) => {
    const cloned = duplicateQuotation(quoteId);
    if (cloned) {
      toast(`Quotation duplicated as ${cloned.number}`);
      go("quotationForm", { id: cloned.id });
    }
  };

  const columns: Column<any>[] = [
    {
      key: "number",
      header: "Quotation No.",
      sortValue: (r) => r.number,
      className: "w-36 font-bold text-neutral-900",
      render: (r) => (
        <button
          onClick={() => go("quotationForm", { id: r.id })}
          className="font-mono text-xs font-extrabold hover:underline text-left block text-neutral-950"
        >
          {formatQuotationNumber(r.number)}
        </button>
      ),
    },
    {
      key: "customerName",
      header: "Customer & Project",
      sortValue: (r) => r.customerName,
      render: (r) => (
        <div>
          <button
            onClick={() => go("quotationForm", { id: r.id })}
            className="font-bold text-neutral-900 hover:underline text-left block"
          >
            {r.customerName}
          </button>
          <div className="text-xs text-neutral-500">
            {r.projectName || r.customerCompany || "Skyarth Residential Windows"}
          </div>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      sortValue: (r) => r.date,
      render: (r) => (
        <div className="text-xs">
          <div className="font-semibold text-neutral-800">{dateFmt(r.date)}</div>
          <div className="text-[11px] text-neutral-400">Valid: {dateFmt(r.validUntil)}</div>
        </div>
      ),
    },
    {
      key: "itemsCount",
      header: "Systems / Items",
      render: (r) => (
        <span className="text-xs font-semibold text-neutral-600">
          {(r.items || []).length} items
        </span>
      ),
    },
    {
      key: "total",
      header: "Grand Total (₹)",
      sortValue: (r) => getQuoteTotal(r),
      render: (r) => (
        <span className="font-black text-sm text-neutral-900">{inr(getQuoteTotal(r))}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortValue: (r) => r.status,
      render: (r) => <Badge value={r.status || "Draft"} />,
    },
    {
      key: "employee",
      header: "Prepared By",
      render: (r) => (
        <span className="text-xs text-neutral-700 font-medium">
          {empName(data, r.employeeId)}
        </span>
      ),
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
            onClick={() => go("quotationForm", { id: r.id })}
            title="Edit / View Quotation"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setActionState({ type: "print", quote: r })}
            title="Print Quotation Document (A4)"
          >
            <Printer className="size-4 text-neutral-700" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setActionState({ type: "preview", quote: r })}
            title="Preview in New Tab"
          >
            <ExternalLink className="size-4 text-blue-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDuplicate(r.id)}
            title="Duplicate Quotation"
          >
            <Copy className="size-4 text-amber-600" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeleteId(r.id)}
            title="Delete Quotation"
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
        title="Quotations & Estimates"
        description="Prepare detailed uPVC door and window commercial proposals, compute GST, and print A4 quotations."
        actions={
          <Button variant="primary" onClick={() => go("quotationForm", {})}>
            <Plus className="size-4" /> New Quotation
          </Button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Quotations" value={stats.total} />
        <StatCard label="In Negotiation" value={stats.negotiation} tone="warning" />
        <StatCard label="Accepted / Confirmed" value={stats.accepted} tone="success" />
        <StatCard label="Pipeline Value" value={inr(stats.pipelineValue)} tone="primary" />
      </div>

      {/* Table Card */}
      <Card>
        <Toolbar>
          <SearchInput
            value={q}
            onChange={setQ}
            placeholder="Search quotations by number, customer, project…"
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="All Statuses"
            options={QUOTATION_STATUSES}
            className="w-44"
          />
          {(q || status) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setQ("");
                setStatus("");
              }}
            >
              Reset Filters
            </Button>
          )}
        </Toolbar>

        <DataTable rows={filtered} columns={columns} />
      </Card>

      {/* Off-screen Render for Vector Printing & New Tab Preview */}
      <div style={{ position: "fixed", left: -9999, top: -9999, width: 840 }}>
        {actionState?.quote && (
          <QuotationPrintTemplate ref={printRef} quotation={actionState.quote} />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Quotation?"
        message="Are you sure you want to delete this quotation proposal? This action cannot be undone."
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteQuotation(deleteId);
            toast("Quotation deleted");
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}
