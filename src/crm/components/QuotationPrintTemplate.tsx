import React, { forwardRef } from "react";
import { inr, dateFmt, formatQuotationNumber } from "../utils/format";

export interface QuotationWindowItem {
  id?: string;
  windowCode?: string;
  location?: string;
  widthMm?: number | string;
  heightMm?: number | string;
  areaSqft?: number | string;
  qty?: number;
  totalAreaSqft?: number | string;
  rate?: number;
  valueEach?: number | string;
  totalValue?: number | string;
  glassThickness?: string | number;
  glassSpec?: string;
  lockingType?: string;
  designSpecs?: string;

  // Legacy fallback support
  name?: string;
  description?: string;
  dimensions?: string;
  unit?: string;
  discount?: number;
  taxRate?: number;
}

export interface QuotationPrintTemplateProps {
  quotation: any;
  className?: string;
}

export const QuotationPrintTemplate = forwardRef<HTMLDivElement, QuotationPrintTemplateProps>(
  ({ quotation, className = "" }, ref) => {
    if (!quotation) return null;

    const rawItems: any[] = quotation.items || [];

    // Normalize items into window schedule format
    const items: QuotationWindowItem[] = rawItems.map((item, idx) => {
      const windowCode = item.windowCode || item.code || `W${idx + 1}`;
      const location = item.location || item.name || "WINDOW";
      const widthMm = Number(item.widthMm) || (item.dimensions ? parseDimension(item.dimensions, "w") : 1200);
      const heightMm = Number(item.heightMm) || (item.dimensions ? parseDimension(item.dimensions, "h") : 1200);
      
      const qty = Number(item.qty) || 1;
      const rate = Number(item.rate) || 480;

      // Area in sq.ft: either stored or computed from mm (1 m2 = 10.7639 sq.ft -> mm*mm / 92903.04)
      const computedArea = widthMm && heightMm ? Number(((widthMm * heightMm) / 92903.04).toFixed(2)) : 10;
      const areaSqft = item.areaSqft !== undefined && item.areaSqft !== "" ? Number(item.areaSqft) : computedArea;
      const totalAreaSqft = item.totalAreaSqft !== undefined && item.totalAreaSqft !== "" 
        ? Number(item.totalAreaSqft) 
        : Number((areaSqft * qty).toFixed(2));

      const valueEach = item.valueEach !== undefined && item.valueEach !== ""
        ? Number(item.valueEach)
        : Number((areaSqft * rate).toFixed(2));

      const totalValue = item.totalValue !== undefined && item.totalValue !== ""
        ? Number(item.totalValue)
        : Number((totalAreaSqft * rate).toFixed(2));

      const glassThickness = item.glassThickness || "5";
      const glassSpec = item.glassSpec || "CLEAR GLASS";
      const lockingType = item.lockingType || "TOUCHLOCK";
      const designSpecs = item.designSpecs || item.description || "3 TRACK 2 GLASS 1 MESH (99MM SECTION)";

      return {
        id: item.id || `item-${idx}`,
        windowCode,
        location,
        widthMm,
        heightMm,
        areaSqft,
        qty,
        totalAreaSqft,
        rate,
        valueEach,
        totalValue,
        glassThickness,
        glassSpec,
        lockingType,
        designSpecs,
      };
    });

    // Summary totals
    const totalUnits = items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
    const totalAreaSqft = Number(items.reduce((sum, i) => sum + (Number(i.totalAreaSqft) || 0), 0).toFixed(2));
    const totalWindowValue = Number(items.reduce((sum, i) => sum + (Number(i.totalValue) || 0), 0).toFixed(2));

    const avgRatePerSqft = totalAreaSqft > 0 ? Math.round(totalWindowValue / totalAreaSqft) : 0;

    const installRate = quotation.installationRatePerSqft !== undefined ? Number(quotation.installationRatePerSqft) : 30;
    const installationCharges = quotation.installationCharges !== undefined && quotation.installationCharges !== ""
      ? Number(quotation.installationCharges)
      : Number((installRate * totalAreaSqft).toFixed(2));

    const transportCharges = quotation.transportCharges !== undefined && quotation.transportCharges !== ""
      ? Number(quotation.transportCharges)
      : 2500.0;

    const totalProjectValue = Number((totalWindowValue + installationCharges + transportCharges).toFixed(2));
    const gstRate = quotation.taxRate !== undefined ? Number(quotation.taxRate) : 18;
    const gstAmount = Number(((totalProjectValue * gstRate) / 100).toFixed(2));
    const grandTotal = Number((totalProjectValue + gstAmount).toFixed(2));

    return (
      <div
        ref={ref}
        data-orientation="landscape"
        style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
        className={`print-area orientation-landscape w-full max-w-[1100px] mx-auto bg-white p-5 sm:p-7 text-neutral-900 font-sans border border-neutral-300 shadow-md box-border print:border-none print:shadow-none print:p-0 print:max-w-full print:!bg-white ${className}`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="w-24"></div>
          <div className="border border-neutral-950 px-8 py-1.5 bg-neutral-50/50 shadow-sm text-center">
            <h1 className="text-base sm:text-lg font-black tracking-widest text-neutral-950 uppercase">
              SKYARTH UPVC WINDOWS LLP.
            </h1>
          </div>
          <div className="w-28 text-right">
            <div className="text-lg font-black tracking-wider text-neutral-900 inline-block font-sans">
              <span className="text-amber-600 font-extrabold">SKY</span>ARTH
            </div>
          </div>
        </div>

        {/* Client & Date Metadata Boxes */}
        <div className="mt-2.5 grid grid-cols-12 gap-3 text-[11px]">
          {/* Client Details Box (Left) */}
          <div className="col-span-8 border border-neutral-950 divide-y divide-neutral-950 bg-white">
            <div className="grid grid-cols-[90px_1fr] p-1.5">
              <span className="font-bold text-neutral-900 uppercase">CLIENT</span>
              <span className="font-semibold text-neutral-950">{quotation.customerName || "Mr. Mahesh Chawla Sir"}</span>
            </div>
            <div className="grid grid-cols-[90px_1fr] p-1.5">
              <span className="font-bold text-neutral-900 uppercase">PROJECT</span>
              <span className="font-semibold text-neutral-800">{quotation.projectName || quotation.siteAddress || "PUNE"}</span>
            </div>
            <div className="grid grid-cols-[90px_1fr] p-1.5">
              <span className="font-bold text-neutral-900 uppercase">SUBJECT</span>
              <span className="font-semibold text-neutral-800">
                {quotation.subject || "Delivery Of uPVC DOORS & WINDOWS"}
              </span>
            </div>
          </div>

          {/* Date & Quote No Box (Right) */}
          <div className="col-span-4 border border-neutral-950 divide-y divide-neutral-950 bg-white flex flex-col justify-start">
            <div className="grid grid-cols-[65px_1fr] p-1.5">
              <span className="font-bold text-neutral-900 uppercase">Date</span>
              <span className="font-bold text-neutral-950 text-right">{dateFmt(quotation.date)}</span>
            </div>
            {quotation.number && (
              <div className="grid grid-cols-[65px_1fr] p-1.5">
                <span className="font-bold text-neutral-900 uppercase text-[10px]">Quote #</span>
                <span className="font-mono font-bold text-neutral-950 text-right text-[10.5px]">
                  {formatQuotationNumber(quotation.number)}
                </span>
              </div>
            )}
            {quotation.validUntil && (
              <div className="grid grid-cols-[65px_1fr] p-1.5 text-neutral-600">
                <span className="font-semibold uppercase text-[10px]">Valid</span>
                <span className="font-medium text-right text-[10px]">{dateFmt(quotation.validUntil)}</span>
              </div>
            )}
          </div>
        </div>

        {/* 14-Column Architectural Window Schedule Table */}
        <div className="mt-3.5 border border-neutral-950 overflow-x-auto">
          <table className="w-full text-[10px] text-left border-collapse min-w-[980px]">
            <thead>
              <tr className="bg-neutral-100 text-neutral-950 font-bold uppercase text-[9.5px] border-b border-neutral-950 tracking-tight text-center">
                <th className="p-1.5 border-r border-neutral-950 w-9">S. No.</th>
                <th className="p-1.5 border-r border-neutral-950 w-16">Code of Window</th>
                <th className="p-1.5 border-r border-neutral-950 text-left px-2 w-28">Location of Window</th>
                <th className="p-1.5 border-r border-neutral-950 w-16">Width in (MM)</th>
                <th className="p-1.5 border-r border-neutral-950 w-16">Height in (MM)</th>
                <th className="p-1.5 border-r border-neutral-950 w-20 leading-tight">Area per Window (sqft)</th>
                <th className="p-1.5 border-r border-neutral-950 w-12 leading-tight">Unit No.</th>
                <th className="p-1.5 border-r border-neutral-950 w-20 leading-tight">Total Area (sqft)</th>
                <th className="p-1.5 border-r border-neutral-950 w-24 text-right pr-2 leading-tight">Value of Each Window</th>
                <th className="p-1.5 border-r border-neutral-950 w-24 text-right pr-2 leading-tight">Total Value in INR</th>
                <th className="p-1.5 border-r border-neutral-950 w-16 text-right pr-1.5 leading-tight">Rate per sqft</th>
                <th className="p-1.5 border-r border-neutral-950 w-12 leading-tight">Glass (in mm)</th>
                <th className="p-1.5 border-r border-neutral-950 text-left px-1.5 w-24">Glass Specs</th>
                <th className="p-1.5 border-r border-neutral-950 text-left px-1.5 w-24">LOCKING TYPE</th>
                <th className="p-1.5 text-left px-2">DESIGN SPECIFICATIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-950">
              {items.map((it, idx) => (
                <tr key={it.id || idx} className="hover:bg-neutral-50/50">
                  <td className="p-1 text-center font-bold text-neutral-800 border-r border-neutral-950">{idx + 1}</td>
                  <td className="p-1 text-center font-mono font-bold text-neutral-900 border-r border-neutral-950">
                    {it.windowCode}
                  </td>
                  <td className="p-1 px-2 font-bold text-neutral-900 uppercase border-r border-neutral-950">
                    {it.location}
                  </td>
                  <td className="p-1 text-center font-semibold text-neutral-800 border-r border-neutral-950">
                    {it.widthMm}
                  </td>
                  <td className="p-1 text-center font-semibold text-neutral-800 border-r border-neutral-950">
                    {it.heightMm}
                  </td>
                  <td className="p-1 text-center font-bold text-neutral-900 border-r border-neutral-950">
                    {Number(it.areaSqft).toFixed(2)}
                  </td>
                  <td className="p-1 text-center font-extrabold text-neutral-950 border-r border-neutral-950">
                    {it.qty}
                  </td>
                  <td className="p-1 text-center font-bold text-neutral-900 border-r border-neutral-950">
                    {Number(it.totalAreaSqft).toFixed(2)}
                  </td>
                  <td className="p-1 text-right pr-2 font-semibold text-neutral-900 border-r border-neutral-950 font-mono">
                    {Number(it.valueEach).toFixed(2)}
                  </td>
                  <td className="p-1 text-right pr-2 font-bold text-neutral-950 border-r border-neutral-950 font-mono">
                    {Number(it.totalValue).toFixed(2)}
                  </td>
                  <td className="p-1 text-right pr-1.5 font-bold text-neutral-900 border-r border-neutral-950 font-mono">
                    {it.rate}
                  </td>
                  <td className="p-1 text-center font-semibold text-neutral-800 border-r border-neutral-950">
                    {it.glassThickness}
                  </td>
                  <td className="p-1 px-1.5 font-semibold text-neutral-800 uppercase border-r border-neutral-950 text-[9px] leading-tight">
                    {it.glassSpec}
                  </td>
                  <td className="p-1 px-1.5 font-semibold text-neutral-800 uppercase border-r border-neutral-950 text-[9px] leading-tight">
                    {it.lockingType}
                  </td>
                  <td className="p-1 px-2 font-semibold text-neutral-900 uppercase text-[9px] leading-tight">
                    {it.designSpecs}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Table Totals Row */}
            <tfoot>
              <tr className="bg-neutral-100 font-black border-t-2 border-neutral-950 text-neutral-950 text-[10px]">
                <td colSpan={6} className="p-1.5 text-right pr-3 border-r border-neutral-950 uppercase font-black">
                  Total
                </td>
                <td className="p-1.5 text-center font-black border-r border-neutral-950">
                  {totalUnits}
                </td>
                <td className="p-1.5 text-center font-black border-r border-neutral-950">
                  {totalAreaSqft.toFixed(2)}
                </td>
                <td className="p-1.5 border-r border-neutral-950"></td>
                <td className="p-1.5 text-right pr-2 font-mono font-black border-r border-neutral-950">
                  {totalWindowValue.toFixed(2)}
                </td>
                <td colSpan={5} className="p-1.5 bg-neutral-100"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 3-Box Bottom Section: Specifications, Financial Summary, Contact */}
        <div className="mt-3.5 grid grid-cols-12 gap-3 items-start text-[10.5px]">
          {/* Box 1: Technical & Commercial Specifications (Left) */}
          <div className="col-span-4 border border-neutral-950 p-2.5 bg-white space-y-1 text-neutral-900 leading-snug">
            <p><span className="font-bold">Product</span> - {quotation.productBrand || "Fenstech"}</p>
            <p><span className="font-bold">Window colour</span> - {quotation.windowColour || "White"}</p>
            <p className="font-semibold">{quotation.deliveryDays || "Delivery with in 30 days"}</p>
            <p className="text-neutral-700 italic">Quotation can be change after final measurements</p>
            <p><span className="font-bold">Mesh Type</span> - {quotation.meshType || "Nylon"}</p>
            <p><span className="font-bold">Payment</span> - {quotation.paymentTerms || "100% Advance"}</p>
            <p className="font-semibold text-neutral-950">{quotation.hardwareBrand || "Windseal / DNV Imported hardware"}</p>
            <p className="text-[9.5px] text-neutral-700 pt-0.5 border-t border-neutral-200 mt-1">
              Sticker Removing & Cleaning of Windows & Goods Charges will be Extra
            </p>
          </div>

          {/* Box 2: Summary Financial Calculation (Middle) */}
          <div className="col-span-4 border border-neutral-950 bg-white overflow-hidden">
            <div className="bg-neutral-100 border-b border-neutral-950 text-center py-1 font-bold text-[10px] tracking-wider uppercase text-neutral-950">
              SUMMARY
            </div>
            <div className="divide-y divide-neutral-300 text-[10.5px]">
              <div className="flex justify-between px-2.5 py-1">
                <span className="font-medium text-neutral-800">Total No. Of Windows / Doors</span>
                <span className="font-bold text-neutral-950">{totalUnits}</span>
              </div>
              <div className="flex justify-between px-2.5 py-1">
                <span className="font-medium text-neutral-800">Total value</span>
                <span className="font-mono font-bold text-neutral-950">{totalWindowValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-2.5 py-1">
                <span className="font-medium text-neutral-800">Per Sqft rate</span>
                <span className="font-mono font-bold text-neutral-950">{avgRatePerSqft}</span>
              </div>
              <div className="flex justify-between px-2.5 py-1">
                <span className="font-medium text-neutral-800">
                  Installation Charges <span className="font-mono text-[9.5px] text-neutral-500">({installRate})</span>
                </span>
                <span className="font-mono font-semibold text-neutral-950">{installationCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-2.5 py-1">
                <span className="font-medium text-neutral-800">Transport</span>
                <span className="font-mono font-semibold text-neutral-950">{transportCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-2.5 py-1 bg-neutral-50 font-bold border-t border-neutral-950">
                <span>Total project value</span>
                <span className="font-mono">{totalProjectValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-2.5 py-1">
                <span className="font-medium text-neutral-800">GST 18%</span>
                <span className="font-mono font-semibold text-neutral-950">{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-2.5 py-1.5 bg-neutral-950 text-white font-black text-xs">
                <span>Grand Total</span>
                <span className="font-mono">{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Box 3: Representative & Site Office (Right) */}
          <div className="col-span-4 border border-neutral-950 p-3 bg-white flex flex-col justify-between h-[190px]">
            <div>
              <p className="font-bold text-neutral-950 text-xs">{quotation.representativeName || "Mr. Swapnil Pawar"}</p>
              <p className="text-[10px] text-neutral-600 mt-1 leading-relaxed">
                {quotation.representativeAddress || "Gat NO.226, BAIF Road, Manjari Khurd, Satav wasti, Pune 412307"}
              </p>
            </div>
            <div className="pt-4 border-t border-dashed border-neutral-300 text-right">
              <p className="text-[9.5px] font-bold text-neutral-950 uppercase">Authorized Signature</p>
              <p className="text-[9px] text-neutral-500">SKYARTH UPVC WINDOWS LLP</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

QuotationPrintTemplate.displayName = "QuotationPrintTemplate";

function parseDimension(dim: string, axis: "w" | "h"): number {
  if (!dim) return 1200;
  const match = dim.match(/(\d+)\s*(?:x|X|\*)\s*(\d+)/);
  if (match) {
    const val = axis === "w" ? match[1] : match[2];
    return Number(val) || 1200;
  }
  return 1200;
}
