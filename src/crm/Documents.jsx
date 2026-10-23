import { docTotals, fmtDate, inr, invoiceSummary, lineCalc } from "./utils";
import { Logo } from "./ui";

function CompanyBlock({ s, title, flag }) {
  return (
    <div className="doc-head">
      <div>
        <Logo src={s.logo} className="doc-logo" />
        <div className="mt-2 font-bold">{s.legalName}</div>
        <div>{s.address}</div>
        <div>Phone: {s.phone} · Email: {s.email}</div>
        {s.website && <div>Website: {s.website}</div>}
        {s.gstin && <div>GSTIN: {s.gstin}</div>}
        {s.pan && <div>PAN: {s.pan}</div>}
      </div>
      <div className="text-right">
        <div className="doc-title">{title}</div>
        {flag && <div className="mt-1 inline-block border border-foreground px-2 font-bold">{flag}</div>}
      </div>
    </div>
  );
}

function ItemsTable({ items, showType }) {
  return (
    <table className="doc-table">
      <thead>
        <tr>
          <th>#</th><th>Description</th>{showType && <th>Type / Size</th>}<th>Qty</th><th>Unit</th>
          <th className="r">Rate</th><th className="r">Disc %</th><th className="r">Taxable</th><th className="r">Tax %</th><th className="r">Tax</th><th className="r">Total</th>
        </tr>
      </thead>
      <tbody>
        {items.map((it, n) => {
          const c = lineCalc(it);
          return (
            <tr key={it.id}>
              <td>{n + 1}</td>
              <td><div className="font-semibold">{it.description}</div><div>{it.category}</div></td>
              {showType && <td>{it.type !== "Not Applicable" ? it.type : ""}{it.dimensions ? <div>{it.dimensions}</div> : null}</td>}
              <td>{it.qty}</td><td>{it.unit}</td>
              <td className="r">{inr(it.rate)}</td><td className="r">{Number(it.discount || 0)}</td>
              <td className="r">{inr(c.taxable)}</td><td className="r">{it.taxRate}%</td><td className="r">{inr(c.tax)}</td><td className="r">{inr(c.total)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Totals({ t, treatment, extra }) {
  const rows = [
    ["Taxable Subtotal", inr(t.subtotal)],
    ...(treatment === "IGST" ? [["IGST", inr(t.igst)]] : [["CGST", inr(t.cgst)], ["SGST", inr(t.sgst)]]),
    ["Additional Charges", inr(t.additional)],
  ];
  return (
    <table className="doc-totals">
      <tbody>
        {rows.map(([k, v]) => <tr key={k}><td>{k}</td><td className="r">{v}</td></tr>)}
        <tr className="font-bold"><td>Grand Total</td><td className="r">{inr(t.grand)}</td></tr>
        {extra}
      </tbody>
    </table>
  );
}

export function QuotationDocument({ q, settings, employees }) {
  const t = docTotals(q.items, q.additionalCharges, q.taxTreatment);
  const prep = employees.find((e) => e.id === q.preparedBy)?.name || "";
  return (
    <div className="print-doc doc">
      <CompanyBlock s={settings} title="QUOTATION" flag={q.status === "Draft" ? "DRAFT" : ""} />
      <div className="doc-grid">
        <div className="doc-box">
          <div className="doc-label">Quotation To</div>
          <div className="font-bold">{q.customerName}</div>
          {q.companyName && <div>{q.companyName}</div>}
          <div>{q.billingAddress}</div>
          <div>Phone: {q.phone}{q.email ? ` · ${q.email}` : ""}</div>
          <div className="mt-2 doc-label">Project Site</div>
          <div>{q.siteAddress}</div>
        </div>
        <div className="doc-box">
          <table className="doc-kv"><tbody>
            <tr><td>Quotation No.</td><td>{q.number}</td></tr>
            <tr><td>Date</td><td>{fmtDate(q.date)}</td></tr>
            <tr><td>Valid Until</td><td>{fmtDate(q.validUntil)}</td></tr>
            <tr><td>Project</td><td>{q.projectName}</td></tr>
            {q.projectCode && <tr><td>Project ID</td><td>{q.projectCode}</td></tr>}
            <tr><td>Prepared By</td><td>{prep}</td></tr>
          </tbody></table>
        </div>
      </div>
      <ItemsTable items={q.items} showType />
      <div className="doc-bottom">
        <div className="doc-notes">
          {q.notes && (<><div className="doc-label">Notes</div><p>{q.notes}</p></>)}
          <div className="doc-label mt-2">Terms & Conditions</div>
          <p>{q.terms || settings.quotationTerms}</p>
          <p className="mt-1">Tax treatment: {q.taxTreatment === "IGST" ? "IGST" : "CGST + SGST"}</p>
        </div>
        <Totals t={t} treatment={q.taxTreatment} />
      </div>
      <Signature s={settings} />
    </div>
  );
}

export function InvoiceDocument({ inv, project, quotation, settings, employees }) {
  const s = invoiceSummary(inv);
  const prep = employees.find((e) => e.id === inv.preparedBy)?.name || "";
  const flag = inv.state === "Draft" ? "DRAFT" : inv.state === "Voided" ? "VOIDED" : "";
  return (
    <div className="print-doc doc">
      <CompanyBlock s={settings} title="TAX INVOICE" flag={flag} />
      <div className="doc-grid">
        <div className="doc-box">
          <div className="doc-label">Bill To</div>
          <div className="font-bold">{project.companyName || project.customerName}</div>
          {project.companyName && <div>Attn: {project.customerName}</div>}
          <div>{project.billingAddress}</div>
          <div>Phone: {project.phone}{project.email ? ` · ${project.email}` : ""}</div>
          {inv.buyerGstin && <div>GSTIN: {inv.buyerGstin}</div>}
        </div>
        <div className="doc-box">
          <div className="doc-label">Ship To / Project Site</div>
          <div className="font-bold">{project.name}</div>
          <div>{project.siteAddress}</div>
          {inv.siteContact && <div>Site contact: {inv.siteContact}</div>}
        </div>
      </div>
      <div className="doc-box mb-3">
        <table className="doc-kv doc-kv-wide"><tbody>
          <tr><td>Invoice No.</td><td>{inv.number}</td><td>Invoice Date</td><td>{fmtDate(inv.date)}</td></tr>
          <tr><td>Invoice Stage</td><td>{inv.stage}</td><td>Due Date</td><td>{fmtDate(inv.dueDate)}</td></tr>
          <tr><td>Project ID</td><td>{project.code}</td><td>Project Name</td><td>{project.name}</td></tr>
          <tr><td>Quotation No.</td><td>{quotation?.number || "—"}</td><td>Reference</td><td>{inv.reference || "—"}</td></tr>
          <tr><td>Prepared By</td><td>{prep}</td><td>Tax Treatment</td><td>{inv.taxTreatment === "IGST" ? "IGST" : "CGST + SGST"}</td></tr>
        </tbody></table>
      </div>
      <ItemsTable items={inv.items} />
      <div className="doc-bottom">
        <div className="doc-notes">
          {inv.notes && (<><div className="doc-label">Notes</div><p>{inv.notes}</p></>)}
          <div className="doc-label mt-2">Payment Terms</div>
          <p>{settings.paymentTerms}</p>
          {inv.payments.length > 0 && (
            <>
              <div className="doc-label mt-2">Payments Received</div>
              {inv.payments.map((p) => <div key={p.id}>{fmtDate(p.date)} · {p.method} · {p.ref || "—"} · {inr(p.amount)}</div>)}
            </>
          )}
        </div>
        <Totals t={s} treatment={inv.taxTreatment} extra={(
          <>
            <tr><td>Amount Paid</td><td className="r">{inr(s.paid)}</td></tr>
            <tr className="font-bold"><td>Balance Due</td><td className="r">{inr(s.balance)}</td></tr>
          </>
        )} />
      </div>
      <Signature s={settings} />
    </div>
  );
}

function Signature({ s }) {
  return (
    <div className="doc-sign">
      <div>This is a computer-generated document.</div>
      <div className="text-right">
        <div>For {s.legalName}</div>
        <div className="mt-10">Authorised Signatory</div>
      </div>
    </div>
  );
}
