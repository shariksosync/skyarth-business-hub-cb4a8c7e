import { PRODUCT_CATEGORIES, UNITS, WINDOW_TYPES } from "./data";
import { inr, lineCalc, uid } from "./utils";
import { Icon } from "./ui";

export const blankItem = (taxRate = 18) => ({
  id: uid("li"), description: "", category: PRODUCT_CATEGORIES[0], type: "Casement", dimensions: "",
  qty: 1, unit: "Nos", rate: 0, discount: 0, taxRate,
});

export function LineItemsEditor({ items, onChange, taxRates, defaultTaxRate, showType = true, error }) {
  const set = (id, k, v) => onChange(items.map((it) => (it.id === id ? { ...it, [k]: v } : it)));
  const remove = (id) => onChange(items.filter((it) => it.id !== id));
  return (
    <div>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="tbl tbl-edit">
          <thead>
            <tr>
              <th>#</th><th className="min-w-52">Description</th><th className="min-w-44">Category</th>
              {showType && <th className="min-w-32">Type</th>}
              {showType && <th className="min-w-28">Dimensions</th>}
              <th>Qty</th><th>Unit</th><th>Rate (₹)</th><th>Disc %</th><th>Tax %</th>
              <th className="text-right">Taxable</th><th className="text-right">Tax</th><th className="text-right">Total</th><th />
            </tr>
          </thead>
          <tbody>
            {items.map((it, n) => {
              const c = lineCalc(it);
              return (
                <tr key={it.id}>
                  <td>{n + 1}</td>
                  <td><input className="input" value={it.description} onChange={(e) => set(it.id, "description", e.target.value)} placeholder="Item description" aria-label="Description" /></td>
                  <td>
                    <select className="input" value={it.category} onChange={(e) => set(it.id, "category", e.target.value)} aria-label="Category">
                      {PRODUCT_CATEGORIES.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </td>
                  {showType && (
                    <td>
                      <select className="input" value={it.type} onChange={(e) => set(it.id, "type", e.target.value)} aria-label="Type">
                        {WINDOW_TYPES.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </td>
                  )}
                  {showType && <td><input className="input" value={it.dimensions} onChange={(e) => set(it.id, "dimensions", e.target.value)} placeholder="W x H" aria-label="Dimensions" /></td>}
                  <td><input className="input w-20" type="number" min="0" step="any" value={it.qty} onChange={(e) => set(it.id, "qty", e.target.value)} aria-label="Quantity" /></td>
                  <td>
                    <input className="input w-20" list="units-list" value={it.unit} onChange={(e) => set(it.id, "unit", e.target.value)} aria-label="Unit" />
                  </td>
                  <td><input className="input w-28" type="number" min="0" step="any" value={it.rate} onChange={(e) => set(it.id, "rate", e.target.value)} aria-label="Rate" /></td>
                  <td><input className="input w-16" type="number" min="0" max="100" step="any" value={it.discount} onChange={(e) => set(it.id, "discount", e.target.value)} aria-label="Discount" /></td>
                  <td>
                    <select className="input w-20" value={it.taxRate} onChange={(e) => set(it.id, "taxRate", Number(e.target.value))} aria-label="Tax rate">
                      {[...new Set([...taxRates, Number(it.taxRate)])].map((r) => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </td>
                  <td className="text-right whitespace-nowrap">{inr(c.taxable)}</td>
                  <td className="text-right whitespace-nowrap">{inr(c.tax)}</td>
                  <td className="text-right whitespace-nowrap font-semibold">{inr(c.total)}</td>
                  <td><button type="button" className="btn btn-sm btn-ghost" onClick={() => remove(it.id)} aria-label="Remove line"><Icon name="x" size={14} /></button></td>
                </tr>
              );
            })}
            {items.length === 0 && <tr><td colSpan={14} className="py-6 text-center">No line items yet. Add at least one item.</td></tr>}
          </tbody>
        </table>
        <datalist id="units-list">{UNITS.map((u) => <option key={u} value={u} />)}</datalist>
      </div>
      {error && <p className="mt-2 text-sm font-semibold">⚠ {error}</p>}
      <button type="button" className="btn mt-3" onClick={() => onChange([...items, blankItem(defaultTaxRate)])}><Icon name="plus" size={16} /> Add line item</button>
    </div>
  );
}

export function TotalsBox({ t, treatment, extra }) {
  return (
    <div className="ml-auto w-full max-w-sm text-sm">
      <Row k="Gross amount" v={inr(t.gross)} />
      <Row k="Less: discount" v={`- ${inr(t.discount)}`} />
      <Row k="Taxable subtotal" v={inr(t.subtotal)} />
      {treatment === "IGST" ? <Row k="IGST" v={inr(t.igst)} /> : (<><Row k="CGST" v={inr(t.cgst)} /><Row k="SGST" v={inr(t.sgst)} /></>)}
      <Row k="Additional charges" v={inr(t.additional)} />
      <Row k="Grand Total" v={inr(t.grand)} strong />
      {extra}
    </div>
  );
}

export function Row({ k, v, strong }) {
  return (
    <div className={`flex justify-between gap-4 border-b border-border py-1.5 ${strong ? "text-base font-bold" : ""}`}>
      <span>{k}</span><span className="whitespace-nowrap">{v}</span>
    </div>
  );
}

export function validateItems(items) {
  if (!items.length) return "Add at least one line item.";
  for (const [n, it] of items.entries()) {
    if (!String(it.description).trim()) return `Line ${n + 1}: description is required.`;
    if (!(Number(it.qty) > 0)) return `Line ${n + 1}: quantity must be greater than 0.`;
    if (!(Number(it.rate) >= 0) || it.rate === "") return `Line ${n + 1}: rate must be 0 or more.`;
    const d = Number(it.discount || 0);
    if (d < 0 || d > 100) return `Line ${n + 1}: discount must be between 0 and 100%.`;
    if (!String(it.unit).trim()) return `Line ${n + 1}: unit is required.`;
  }
  return "";
}
