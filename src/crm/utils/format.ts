export const inr = (n: number) =>
  "₹" + (Number.isFinite(n) ? n : 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const dateFmt = (d?: string) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

export const dateTimeFmt = (d?: string | Date) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const relativeTimeFmt = (d?: string | Date) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const diffMs = Date.now() - dt.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

export const todayISO = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatQuotationNumber = (num?: string) => {
  if (!num) return "SKY/QT/0000";
  return num.toUpperCase();
};

export const getQuotationFileName = (number: string, customerName: string) => {
  const cleanNum = (number || "QTN").replace(/[^a-zA-Z0-9_-]/g, "_");
  const cleanName = (customerName || "Customer").replace(/[^a-zA-Z0-9_-]/g, "_");
  return `Quotation_${cleanNum}_${cleanName}.pdf`;
};

export type LineItemCalc = {
  qty: number;
  rate: number;
  discount?: number;
  taxRate?: number;
};

export const computeTotals = (items: LineItemCalc[] = [], isQuotation: boolean = true) => {
  let subtotal = 0;
  let totalDiscount = 0;
  let taxable = 0;
  let totalTax = 0;

  for (const item of items) {
    const qty = Number(item.qty) || 0;
    const rate = Number(item.rate) || 0;
    const discountPct = Number(item.discount) || 0;
    const taxRate = Number(item.taxRate) || 0;

    const base = qty * rate;
    const discountAmt = base * (discountPct / 100);
    const lineTaxable = base - discountAmt;
    const taxAmt = lineTaxable * (taxRate / 100);

    subtotal += base;
    totalDiscount += discountAmt;
    taxable += lineTaxable;
    totalTax += taxAmt;
  }

  const cgst = totalTax / 2;
  const sgst = totalTax / 2;
  const unroundedTotal = taxable + totalTax;
  const total = Math.round(unroundedTotal);
  const roundOff = Number((total - unroundedTotal).toFixed(2));

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalDiscount: Math.round(totalDiscount * 100) / 100,
    taxable: Math.round(taxable * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    igst: Math.round(totalTax * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    roundOff,
    total,
  };
};

const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function numToWordsUnderThousand(n: number): string {
  let str = "";
  if (n >= 100) {
    str += ones[Math.floor(n / 100)] + " Hundred ";
    n %= 100;
  }
  if (n >= 20) {
    str += tens[Math.floor(n / 10)] + " ";
    n %= 10;
  }
  if (n > 0) {
    str += ones[n] + " ";
  }
  return str.trim();
}

export function amountInWords(amount: number): string {
  const num = Math.round(Math.abs(amount));
  if (num === 0) return "Rupees Zero Only";

  let n = num;
  let words = "";

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const remaining = n;

  if (crore > 0) words += numToWordsUnderThousand(crore) + " Crore ";
  if (lakh > 0) words += numToWordsUnderThousand(lakh) + " Lakh ";
  if (thousand > 0) words += numToWordsUnderThousand(thousand) + " Thousand ";
  if (remaining > 0) words += numToWordsUnderThousand(remaining) + " ";

  return ("Rupees " + words.trim() + " Only").replace(/\s+/g, " ");
}

export const downloadDocumentFile = (doc: any, empName?: string) => {
  const fileName = doc.name || "document.pdf";
  const blob = new Blob([`Mock document content for ${doc.name} (Employee: ${empName || "Staff"})`], {
    type: "text/plain",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};
