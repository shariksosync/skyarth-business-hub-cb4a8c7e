import React, { forwardRef } from "react";
import { inr, dateFmt, computeTotals, amountInWords, formatQuotationNumber } from "../utils/format";

export interface QuotationPrintTemplateProps {
  quotation: any;
  className?: string;
}

export const QuotationPrintTemplate = forwardRef<HTMLDivElement, QuotationPrintTemplateProps>(
  ({ quotation, className = "" }, ref) => {
    if (!quotation) return null;

    const items = quotation.items || [];
    const totals = computeTotals(
      items.map((i: any) => ({
        qty: Number(i.qty) || 0,
        rate: Number(i.rate) || 0,
        discount: Number(i.discount) || 0,
        taxRate: Number(i.tax || i.taxRate) || 18,
      })),
      true
    );

    return (
      <div
        ref={ref}
        style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
        className={`print-area p-6 sm:p-8 bg-white border border-neutral-300 shadow-lg font-sans text-neutral-900 w-full max-w-[840px] mx-auto box-border print:border-none print:shadow-none print:p-0 print:max-w-full print:!bg-white ${className}`}
      >
        {/* Header */}
        <div className="flex flex-row justify-between items-start gap-4 pb-4 border-b-2 border-neutral-800">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3.5">
              <div className="size-16 shrink-0 rounded-xl bg-black text-white flex items-center justify-center font-extrabold text-2xl tracking-tighter">
                SKY
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-950 uppercase leading-none">
                  SKYARTH uPVC Windows LLP
                </h1>
                <p className="text-[11px] font-bold tracking-wider text-neutral-600 uppercase mt-1">
                  Architectural uPVC Doors, Windows & Sliding Systems
                </p>
              </div>
            </div>

            <div className="mt-3 text-[11px] leading-relaxed text-neutral-700">
              <p className="font-semibold text-neutral-900">Office No. 113, Tower B, City Vista, Kharadi, Pune - 411014</p>
              <p>
                <span className="font-semibold text-neutral-900">Email:</span> support@skyarthupvc.com &nbsp;|&nbsp;
                <span className="font-semibold text-neutral-900"> Phone:</span> +91 99456 78901
              </p>
              <p>
                <span className="font-semibold text-neutral-900">GSTIN:</span> 27AAHFS8921C1Z4 &nbsp;|&nbsp;
                <span className="font-semibold text-neutral-900"> State:</span> Maharashtra (Code: 27)
              </p>
            </div>
          </div>

          <div className="w-[230px] shrink-0 flex flex-col items-end">
            <div className="bg-black text-white px-3 py-1 font-black text-base tracking-widest uppercase rounded-sm">
              QUOTATION
            </div>

            <div className="mt-3 border border-neutral-300 rounded text-[11px] w-full bg-neutral-50/60 overflow-hidden">
              <div className="grid grid-cols-[85px_1fr] border-b border-neutral-200">
                <span className="bg-neutral-100 p-1.5 font-bold text-neutral-700 uppercase border-r border-neutral-200">
                  Date:
                </span>
                <span className="p-1.5 font-semibold text-neutral-900 text-center">
                  {dateFmt(quotation.date)}
                </span>
              </div>
              <div className="grid grid-cols-[85px_1fr] border-b border-neutral-200">
                <span className="bg-neutral-100 p-1.5 font-bold text-neutral-700 uppercase border-r border-neutral-200">
                  Quote No:
                </span>
                <span className="p-1.5 font-bold text-neutral-950 text-center">
                  {formatQuotationNumber(quotation.number)}
                </span>
              </div>
              <div className="grid grid-cols-[85px_1fr]">
                <span className="bg-neutral-100 p-1.5 font-bold text-neutral-700 uppercase border-r border-neutral-200">
                  Valid Until:
                </span>
                <span className="p-1.5 font-medium text-neutral-800 text-center">
                  {dateFmt(quotation.validUntil)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Client & Site Details */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-[11px]">
          <div className="border border-neutral-300 rounded p-2.5 bg-neutral-50/40">
            <h3 className="font-bold uppercase tracking-wider text-neutral-700 border-b border-neutral-200 pb-1 mb-1.5">
              Customer / Billing Details
            </h3>
            <p className="font-bold text-sm text-neutral-950">{quotation.customerName || "Customer Name"}</p>
            {quotation.projectName && (
              <p className="font-semibold text-neutral-800 mt-0.5">Project: {quotation.projectName}</p>
            )}
            {quotation.customerCompany && (
              <p className="text-neutral-600">{quotation.customerCompany}</p>
            )}
            <p className="text-neutral-700 mt-1">{quotation.billingAddress || quotation.customerAddress || "Address on record"}</p>
            <p className="mt-1">
              <span className="font-semibold">Phone:</span> {quotation.customerPhone || quotation.phone || "—"}
              {quotation.customerEmail && (
                <> &nbsp;|&nbsp; <span className="font-semibold">Email:</span> {quotation.customerEmail}</>
              )}
            </p>
            {quotation.customerGstin && (
              <p className="font-semibold">GSTIN: {quotation.customerGstin}</p>
            )}
          </div>

          <div className="border border-neutral-300 rounded p-2.5 bg-neutral-50/40">
            <h3 className="font-bold uppercase tracking-wider text-neutral-700 border-b border-neutral-200 pb-1 mb-1.5">
              Site & Execution Details
            </h3>
            <p className="font-semibold text-neutral-900">
              Site Location: <span className="font-normal">{quotation.siteAddress || quotation.billingAddress || "As per order"}</span>
            </p>
            <p className="mt-1">
              <span className="font-semibold">Prepared By:</span> {quotation.employeeName || "Skyarth Sales & Technical Team"}
            </p>
            <p className="mt-1">
              <span className="font-semibold">Profile System:</span> Premium Multi-Chamber uPVC (Reinforced)
            </p>
            <p className="mt-1">
              <span className="font-semibold">Glass Spec:</span> Toughened / Insulated Clear Glass (Saint-Gobain standard)
            </p>
            <p className="mt-1">
              <span className="font-semibold">Hardware:</span> Heavy-Duty Multipoint Locking & SS Hardware
            </p>
          </div>
        </div>

        {/* Specifications Table */}
        <div className="mt-4 border border-neutral-800 rounded overflow-hidden">
          <table className="w-full text-[11px] text-left border-collapse">
            <thead>
              <tr className="bg-black text-white uppercase font-bold text-[10px] tracking-wider">
                <th className="p-2 w-8 text-center border-r border-neutral-700">#</th>
                <th className="p-2 border-r border-neutral-700">Description & Specification</th>
                <th className="p-2 w-28 border-r border-neutral-700">Dimensions / Type</th>
                <th className="p-2 w-14 text-center border-r border-neutral-700">Qty</th>
                <th className="p-2 w-14 text-center border-r border-neutral-700">Unit</th>
                <th className="p-2 w-20 text-right border-r border-neutral-700">Rate (₹)</th>
                <th className="p-2 w-16 text-center border-r border-neutral-700">Disc %</th>
                <th className="p-2 w-24 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {items.map((item: any, idx: number) => {
                const qty = Number(item.qty) || 0;
                const rate = Number(item.rate) || 0;
                const disc = Number(item.discount) || 0;
                const base = qty * rate;
                const lineTotal = base - (base * disc) / 100;
                return (
                  <tr key={idx} className={idx % 2 === 1 ? "bg-neutral-50/50" : ""}>
                    <td className="p-2 text-center font-bold text-neutral-600 border-r border-neutral-200">{idx + 1}</td>
                    <td className="p-2 border-r border-neutral-200 font-medium">
                      <div className="font-bold text-neutral-900">{item.name || item.category || "uPVC Window System"}</div>
                      <div className="text-[10px] text-neutral-600 mt-0.5 whitespace-pre-wrap">{item.description}</div>
                    </td>
                    <td className="p-2 border-r border-neutral-200 text-neutral-700 text-[10.5px]">
                      {item.dimensions || item.type || "Custom Size"}
                    </td>
                    <td className="p-2 text-center font-bold text-neutral-900 border-r border-neutral-200">{qty}</td>
                    <td className="p-2 text-center text-neutral-600 border-r border-neutral-200">{item.unit || "Sq.ft"}</td>
                    <td className="p-2 text-right font-semibold text-neutral-800 border-r border-neutral-200">
                      {inr(rate).replace("₹", "")}
                    </td>
                    <td className="p-2 text-center text-neutral-600 border-r border-neutral-200">
                      {disc > 0 ? `${disc}%` : "—"}
                    </td>
                    <td className="p-2 text-right font-bold text-neutral-950">
                      {inr(lineTotal).replace("₹", "")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Financial Totals & Words */}
        <div className="mt-3.5 grid grid-cols-2 gap-4 items-start text-[11px]">
          <div>
            <div className="border border-neutral-300 rounded p-2.5 bg-neutral-50/30">
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-600">Amount in Words:</p>
              <p className="text-xs font-extrabold text-neutral-900 mt-1 leading-snug">
                {amountInWords(totals.total)}
              </p>
            </div>

            {/* Bank Remittance Details */}
            <div className="mt-2.5 border border-neutral-300 rounded p-2.5 bg-neutral-50/30 text-[10.5px]">
              <p className="font-bold uppercase tracking-wider text-neutral-700 mb-1">Bank Remittance Details:</p>
              <p><span className="font-semibold">Bank Name:</span> HDFC Bank Ltd</p>
              <p><span className="font-semibold">Account Name:</span> SKYARTH UPVC WINDOWS LLP</p>
              <p><span className="font-semibold">Account No:</span> 50200089211045</p>
              <p><span className="font-semibold">IFSC Code:</span> HDFC0001822 (Kharadi Branch, Pune)</p>
            </div>
          </div>

          <div className="border border-neutral-300 rounded overflow-hidden text-[11px]">
            <div className="flex justify-between p-2 border-b border-neutral-200">
              <span className="text-neutral-600 font-medium">Subtotal (Gross):</span>
              <span className="font-semibold">{inr(totals.subtotal)}</span>
            </div>
            {totals.totalDiscount > 0 && (
              <div className="flex justify-between p-2 border-b border-neutral-200 text-rose-700">
                <span>Special Discount:</span>
                <span className="font-semibold">- {inr(totals.totalDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between p-2 border-b border-neutral-200 bg-neutral-50 font-semibold">
              <span>Taxable Value:</span>
              <span>{inr(totals.taxable)}</span>
            </div>
            <div className="flex justify-between p-2 border-b border-neutral-200">
              <span className="text-neutral-600">CGST (9%):</span>
              <span>{inr(totals.cgst)}</span>
            </div>
            <div className="flex justify-between p-2 border-b border-neutral-200">
              <span className="text-neutral-600">SGST (9%):</span>
              <span>{inr(totals.sgst)}</span>
            </div>
            {totals.roundOff !== 0 && (
              <div className="flex justify-between p-2 border-b border-neutral-200 text-neutral-500 text-[10px]">
                <span>Round off:</span>
                <span>{totals.roundOff > 0 ? `+${totals.roundOff}` : totals.roundOff}</span>
              </div>
            )}
            <div className="flex justify-between p-2.5 bg-black text-white font-extrabold text-sm">
              <span>Grand Total (Net Payable):</span>
              <span>{inr(totals.total)}</span>
            </div>
          </div>
        </div>

        {/* Commercial Terms & Signatures */}
        <div className="mt-4 pt-3 border-t border-neutral-300 grid grid-cols-2 gap-4 text-[10.5px] leading-relaxed">
          <div>
            <h4 className="font-bold uppercase tracking-wider text-neutral-800 mb-1">Terms & Conditions:</h4>
            <ul className="list-disc pl-4 space-y-0.5 text-neutral-600">
              <li>Prices valid for 30 days from quotation date.</li>
              <li>Payment: 50% Advance with confirmation, 40% on dispatch, 10% post-installation.</li>
              <li>Warranty: 10 Years on uPVC profiles against fading/cracking; 1 Year on moving hardware.</li>
              <li>Delivery timeframe: 15–21 working days post final site measurement confirmation.</li>
              <li>Civil masonry modifications, scaffolding, and electrical connections at client's scope.</li>
            </ul>
          </div>

          <div className="flex flex-col justify-between items-end text-right">
            <div>
              <p className="font-bold text-neutral-900 uppercase">For SKYARTH uPVC Windows LLP</p>
              <p className="text-[10px] text-neutral-500">Authorized Signatory</p>
            </div>
            <div className="pt-10">
              <div className="w-48 border-b border-neutral-800 mb-1"></div>
              <p className="text-[10px] text-neutral-500">Technical Sales / Authorised Signatory</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

QuotationPrintTemplate.displayName = "QuotationPrintTemplate";
