// DEMO DATA ONLY — not real company transactions.
import { docTotals, round2 } from "./utils";

export const PRODUCT_CATEGORIES = [
  "uPVC Casement Windows", "uPVC Sliding Windows", "Fixed Windows", "French Windows",
  "uPVC Sliding Doors", "Lift and Slide Doors", "Customized uPVC Doors",
  "Accessories and Hardware", "Installation and Fabrication", "Other Custom Items",
];
export const WINDOW_TYPES = ["Casement", "Sliding 2-Track", "Sliding 3-Track", "Fixed", "French", "Tilt & Turn", "Lift & Slide", "Slide & Fold", "Not Applicable"];
export const UNITS = ["Nos", "Sq.ft", "Sq.m", "Rft", "Set", "Lot", "Job", "Kg", "Mtr"];
export const LEAD_STATUSES = ["New", "Contacted", "Qualified", "Site Visit Scheduled", "Quotation Required", "Negotiation", "Converted", "Lost"];
export const LEAD_SOURCES = ["Website", "Referral", "Walk-in", "Architect", "Builder", "Social Media", "Exhibition", "Phone Inquiry", "Other"];
export const QUOTATION_STATUSES = ["Draft", "Sent", "Viewed", "Under Negotiation", "Accepted", "Rejected", "Expired"];
export const PROJECT_STATUSES = ["Planning", "In Progress", "Manufacturing", "Installation", "Completed", "On Hold"];
export const INVOICE_STAGES = ["Advance Payment", "Material Supply", "Manufacturing", "Installation", "Progress Billing", "Final Invoice", "Additional Work"];
export const PAYMENT_METHODS = ["Bank Transfer", "UPI", "Cheque", "Cash", "Other"];
export const INVENTORY_CATEGORIES = ["uPVC Profiles", "Glass", "Steel Reinforcement", "Hardware and Locks", "Rollers", "Hinges", "Handles", "Gaskets and Seals", "Fasteners", "Accessories", "Installation Materials", "Other Items"];
export const EMPLOYMENT_STATUSES = ["Active", "On Leave", "Inactive"];
export const DEPARTMENTS = ["Sales", "Projects", "Accounts", "Installation", "Production", "Administration"];

const settings = {
  companyName: "SKYARTH",
  legalName: "SKYARTH UPVC WINDOWS LLP.",
  address: "Office No. 113, Tower B, City Vista, Kharadi, Pune - 411014",
  phone: "9945678901",
  email: "support@skyarthupvc.com",
  website: "",
  gstin: "",
  pan: "",
  description:
    "Skyarth uPVC Windows LLP is working in the field of construction materials and architectural fittings. Skyarth uPVC Windows LLP is into the manufacturing, fabrication, and supply of premium unplasticized polyvinyl chloride (uPVC) doors, windows, sliding systems, and customized framing solutions for residential and commercial building projects.",
  logo: null,
  taxRates: [0, 5, 12, 18, 28],
  defaultTaxRate: 18,
  taxTreatment: "CGST_SGST",
  invoicePrefix: "SKY/INV/",
  quotationPrefix: "SKY/QT/",
  paymentTerms: "Payment due within the due period stated on the invoice. Cheques subject to realisation.",
  quotationTerms: "Prices valid until the date mentioned. Delivery and installation as per mutually agreed schedule. Taxes as applicable.",
  dueDays: 15,
  quotationValidityDays: 30,
  currency: "INR",
  defaultEmployeeId: "emp-1",
};

const employees = [
  { id: "emp-1", code: "E-101", name: "Rahul Deshmukh", designation: "Sales Manager", department: "Sales & Marketing", phone: "9822011001", altPhone: "9822099001", email: "rahul.d@skyarthupvc.com", joiningDate: "2021-04-12", address: "Kharadi, Pune", status: "Active", salary: 720000, employmentType: "Full Time", bankAccount: "5020008921101", ifsc: "HDFC0001234", emergencyName: "Pooja Deshmukh", emergencyContact: "9822099901" },
  { id: "emp-2", code: "E-102", name: "Sneha Kulkarni", designation: "Senior Estimator", department: "Design & Estimating", phone: "9822011002", altPhone: "9822099002", email: "sneha.k@skyarthupvc.com", joiningDate: "2022-07-01", address: "Viman Nagar, Pune", status: "Active", salary: 540000, employmentType: "Full Time", bankAccount: "5020008921102", ifsc: "HDFC0001234", emergencyName: "Mahesh Kulkarni", emergencyContact: "9822099902" },
  { id: "emp-3", code: "E-103", name: "Amit Joshi", designation: "Fabrication Supervisor", department: "Production & Fabrication", phone: "9822011003", altPhone: "9822099003", email: "amit.j@skyarthupvc.com", joiningDate: "2020-11-16", address: "Hadapsar, Pune", status: "Active", salary: 600000, employmentType: "Full Time", bankAccount: "5020008921103", ifsc: "HDFC0001234", emergencyName: "Kavita Joshi", emergencyContact: "9822099903" },
  { id: "emp-4", code: "E-104", name: "Priya Shinde", designation: "Accounts Executive", department: "Accounts & Finance", phone: "9822011004", altPhone: "9822099004", email: "priya.s@skyarthupvc.com", joiningDate: "2023-01-09", address: "Wagholi, Pune", status: "Active", salary: 420000, employmentType: "Full Time", bankAccount: "5020008921104", ifsc: "HDFC0001234", emergencyName: "Sanjay Shinde", emergencyContact: "9822099904" },
  { id: "emp-5", code: "E-105", name: "Vikram Pawar", designation: "Site Installation Supervisor", department: "Site Installation", phone: "9822011005", altPhone: "9822099005", email: "vikram.p@skyarthupvc.com", joiningDate: "2021-09-20", address: "Chandan Nagar, Pune", status: "Active", salary: 480000, employmentType: "Full Time", bankAccount: "5020008921105", ifsc: "HDFC0001234", emergencyName: "Sunita Pawar", emergencyContact: "9822099905" },
  { id: "emp-6", code: "E-106", name: "Neha Gaikwad", designation: "Sales Executive", department: "Sales & Marketing", phone: "9822011006", altPhone: "9822099006", email: "neha.g@skyarthupvc.com", joiningDate: "2024-03-04", address: "Kalyani Nagar, Pune", status: "On Leave", salary: 380000, employmentType: "Full Time", bankAccount: "5020008921106", ifsc: "HDFC0001234", emergencyName: "Anand Gaikwad", emergencyContact: "9822099906" },
];

const H = (id, date, text) => ({ id, date, text, type: "Note" });

const leads = [
  { id: "lead-1", code: "L-1001", customerName: "Rajesh Kumar", companyName: "", phone: "9876500001", email: "rajesh.kumar@example.com", billingAddress: "Flat 7, Shanti Heights, Baner, Pune 411045", projectName: "Kumar Residence", siteAddress: "Plot 22, Baner Road, Baner, Pune 411045", city: "Baner, Pune", source: "Referral", employeeId: "emp-1", value: 200000, followUpDate: "", requirements: "Casement and sliding windows, one French door", notes: "", status: "Converted", createdDate: "2026-07-02", projectId: "proj-1", siteVisits: [], history: [H("h-1", "2026-07-02", "Lead created"), H("h-2", "2026-07-10", "Converted to project P-2001")] },
  { id: "lead-2", code: "L-1002", customerName: "Anil Mehta", companyName: "Green Valley Developers", phone: "9876500002", email: "anil@greenvalleydev.example", billingAddress: "GV House, Wakad, Pune 411057", projectName: "Green Valley Apartments", siteAddress: "Survey No. 41, Wakad, Pune 411057", city: "Wakad, Pune", source: "Builder", employeeId: "emp-1", value: 3500000, followUpDate: "", requirements: "Full tower window and sliding door package", notes: "", status: "Converted", createdDate: "2026-06-18", projectId: "proj-2", siteVisits: [], history: [H("h-3", "2026-06-18", "Lead created")] },
  { id: "lead-3", code: "L-1003", customerName: "Suresh Patil", companyName: "", phone: "9876500003", email: "suresh.patil@example.com", billingAddress: "12 Karve Nagar, Pune 411052", projectName: "Patil Bungalow", siteAddress: "Lane 5, Kothrud, Pune 411038", city: "Kothrud, Pune", source: "Website", employeeId: "emp-2", value: 150000, followUpDate: "", requirements: "Casement & fixed windows", notes: "", status: "Converted", createdDate: "2026-05-20", projectId: "proj-3", siteVisits: [], history: [H("h-4", "2026-05-20", "Lead created")] },
  { id: "lead-4", code: "L-1004", customerName: "Kavita Rao", companyName: "Orion Infra Pvt Ltd", phone: "9876500004", email: "kavita.rao@orioninfra.example", billingAddress: "Orion Tower, Baner, Pune 411045", projectName: "Orion Office Hinjewadi", siteAddress: "Phase 2, Hinjewadi, Pune 411057", city: "Hinjewadi, Pune", source: "Architect", employeeId: "emp-2", value: 900000, followUpDate: "", requirements: "Office facade fixed and sliding windows", notes: "", status: "Converted", createdDate: "2026-07-25", projectId: "proj-4", siteVisits: [], history: [H("h-5", "2026-07-25", "Lead created")] },
  { id: "lead-5", code: "L-1005", customerName: "Manoj Desai", companyName: "", phone: "9876500005", email: "manoj.desai@example.com", billingAddress: "Desai Villa, ITI Road, Aundh, Pune 411007", projectName: "Desai Villa", siteAddress: "Desai Villa, ITI Road, Aundh, Pune 411007", city: "Aundh, Pune", source: "Exhibition", employeeId: "emp-1", value: 550000, followUpDate: "", requirements: "Lift and slide doors for living room", notes: "", status: "Converted", createdDate: "2026-08-04", projectId: "proj-5", siteVisits: [], history: [H("h-6", "2026-08-04", "Lead created")] },
  { id: "lead-6", code: "L-1006", customerName: "Farah Khan", companyName: "Sunrise Education Trust", phone: "9876500006", email: "admin@sunrisetrust.example", billingAddress: "Trust Office, Hadapsar, Pune 411028", projectName: "Sunrise School Block B", siteAddress: "Magarpatta Road, Hadapsar, Pune 411028", city: "Hadapsar, Pune", source: "Phone Inquiry", employeeId: "emp-3", value: 1500000, followUpDate: "", requirements: "Classroom sliding windows", notes: "", status: "Converted", createdDate: "2026-09-02", projectId: "proj-6", siteVisits: [], history: [H("h-7", "2026-09-02", "Lead created")] },
  { id: "lead-7", code: "L-1007", customerName: "Deepak Verma", companyName: "", phone: "9876500007", email: "deepak.verma@example.com", billingAddress: "B-504, Sky Towers, Viman Nagar, Pune 411014", projectName: "Verma Flat Renovation", siteAddress: "B-504, Sky Towers, Viman Nagar, Pune 411014", city: "Viman Nagar, Pune", source: "Website", employeeId: "emp-2", value: 95000, followUpDate: "2026-10-27", requirements: "Replace aluminium sliders with uPVC", notes: "Prefers white profiles", status: "Qualified", createdDate: "2026-10-01", projectId: "", siteVisits: [], history: [H("h-8", "2026-10-01", "Lead created"), H("h-9", "2026-10-05", "Quotation sent")] },
  { id: "lead-8", code: "L-1008", customerName: "Rohit Sharma", companyName: "Lotus Hospitality LLP", phone: "9876500008", email: "rohit@lotushotels.example", billingAddress: "Lotus Hotel, Koregaon Park, Pune 411001", projectName: "Lotus Hotel Renovation", siteAddress: "Lane 6, Koregaon Park, Pune 411001", city: "Koregaon Park, Pune", source: "Architect", employeeId: "emp-1", value: 1800000, followUpDate: "2026-10-25", requirements: "Acoustic casement windows for 60 rooms", notes: "Negotiating on French door rates", status: "Negotiation", createdDate: "2026-09-12", projectId: "", siteVisits: [{ id: "sv-1", date: "2026-09-20", time: "11:00", employeeId: "emp-1", observations: "60 rooms measured; heritage facade" }], history: [H("h-10", "2026-09-12", "Lead created"), H("h-11", "2026-09-20", "Site visit completed")] },
  { id: "lead-9", code: "L-1009", customerName: "Meera Iyer", companyName: "", phone: "9876500009", email: "meera.iyer@example.com", billingAddress: "Magarpatta City, Pune 411013", projectName: "Iyer Apartment", siteAddress: "Cosmos Tower, Magarpatta City, Pune 411013", city: "Magarpatta, Pune", source: "Social Media", employeeId: "emp-6", value: 120000, followUpDate: "2026-10-24", requirements: "Balcony sliding door", notes: "", status: "New", createdDate: "2026-10-20", projectId: "", siteVisits: [], history: [H("h-12", "2026-10-20", "Lead created")] },
  { id: "lead-10", code: "L-1010", customerName: "Kiran Bhosale", companyName: "", phone: "9876500010", email: "kiran.b@example.com", billingAddress: "Shivaji Nagar, Pune 411005", projectName: "Bhosale Farmhouse", siteAddress: "Tungarli, Lonavala 410401", city: "Lonavala", source: "Referral", employeeId: "emp-3", value: 300000, followUpDate: "2026-10-29", requirements: "Sliding doors & casement windows", notes: "", status: "Site Visit Scheduled", createdDate: "2026-10-08", projectId: "", siteVisits: [{ id: "sv-2", date: "2026-10-29", time: "10:30", employeeId: "emp-5", observations: "Scheduled" }], history: [H("h-13", "2026-10-08", "Lead created")] },
  { id: "lead-11", code: "L-1011", customerName: "Arjun Nair", companyName: "", phone: "9876500011", email: "arjun.nair@example.com", billingAddress: "EON Free Zone Road, Kharadi, Pune 411014", projectName: "Nair Duplex", siteAddress: "Kharadi, Pune 411014", city: "Kharadi, Pune", source: "Walk-in", employeeId: "emp-2", value: 180000, followUpDate: "2026-11-02", requirements: "Tilt & turn windows", notes: "", status: "Contacted", createdDate: "2026-10-14", projectId: "", siteVisits: [], history: [H("h-14", "2026-10-14", "Lead created")] },
  { id: "lead-12", code: "L-1012", customerName: "Pooja Jain", companyName: "", phone: "9876500012", email: "pooja.jain@example.com", billingAddress: "Wagholi, Pune 412207", projectName: "Jain Residence", siteAddress: "Wagholi, Pune 412207", city: "Wagholi, Pune", source: "Website", employeeId: "emp-6", value: 80000, followUpDate: "", requirements: "Windows for 2BHK", notes: "Went with another vendor", status: "Lost", createdDate: "2026-08-22", projectId: "", siteVisits: [], history: [H("h-15", "2026-08-22", "Lead created")] },
];

const it = (id, description, category, type, dimensions, qty, unit, rate, discount = 0, taxRate = 18) =>
  ({ id, description, category, type, dimensions, qty, unit, rate, discount, taxRate });

const custFrom = (l) => ({
  leadId: l.id, customerName: l.customerName, companyName: l.companyName, phone: l.phone, email: l.email,
  billingAddress: l.billingAddress, siteAddress: l.siteAddress, location: l.city, projectName: l.projectName,
});

const Q = (id, number, lead, date, validUntil, status, projectId, employeeId, items, history = []) => ({
  id, number, date, validUntil, status, projectId, employeeId, preparedBy: employeeId, items,
  additionalCharges: 0, taxTreatment: "CGST_SGST", notes: "", terms: settings.quotationTerms,
  ...custFrom(lead), history: [{ id: `${id}-h0`, date, text: "Quotation created" }, ...history],
});

const L = Object.fromEntries(leads.map((l) => [l.id, l]));

const quotations = [
  Q("q-1", "SKY/QT/0001", L["lead-1"], "2026-07-05", "2026-08-04", "Accepted", "proj-1", "emp-1", [
    it("q1-1", "uPVC casement windows with 5mm clear glass, white profile", "uPVC Casement Windows", "Casement", "4 ft x 5 ft (4 nos)", 80, "Sq.ft", 650, 5),
    it("q1-2", "2-track sliding windows with mesh shutter", "uPVC Sliding Windows", "Sliding 2-Track", "6 ft x 5 ft (3 nos)", 90, "Sq.ft", 580, 5),
    it("q1-3", "French door with multipoint locking", "French Windows", "French", "6 ft x 7 ft", 1, "Nos", 48000),
    it("q1-4", "Installation and fabrication", "Installation and Fabrication", "Not Applicable", "", 1, "Job", 25000),
  ], [{ id: "q1-h1", date: "2026-07-09", text: "Marked as Accepted" }]),
  Q("q-2", "SKY/QT/0002", L["lead-2"], "2026-06-25", "2026-07-25", "Accepted", "proj-2", "emp-1", [
    it("q2-1", "3-track sliding windows, 6mm toughened glass", "uPVC Sliding Windows", "Sliding 3-Track", "Various", 1200, "Sq.ft", 520, 8),
    it("q2-2", "Casement windows for bedrooms", "uPVC Casement Windows", "Casement", "Various", 800, "Sq.ft", 610, 8),
    it("q2-3", "Balcony sliding doors", "uPVC Sliding Doors", "Sliding 2-Track", "8 ft x 7 ft", 48, "Nos", 32000, 10),
    it("q2-4", "Hardware package (handles, locks, rollers)", "Accessories and Hardware", "Not Applicable", "", 1, "Lot", 180000),
    it("q2-5", "Installation for 48 units", "Installation and Fabrication", "Not Applicable", "", 1, "Job", 220000),
  ]),
  Q("q-3", "SKY/QT/0003", L["lead-3"], "2026-05-28", "2026-06-27", "Accepted", "proj-3", "emp-2", [
    it("q3-1", "Casement windows, white profile", "uPVC Casement Windows", "Casement", "Various", 150, "Sq.ft", 640),
    it("q3-2", "Fixed glass windows for staircase", "Fixed Windows", "Fixed", "Various", 60, "Sq.ft", 420),
    it("q3-3", "Installation", "Installation and Fabrication", "Not Applicable", "", 1, "Job", 18000),
  ]),
  Q("q-4", "SKY/QT/0004", L["lead-4"], "2026-08-02", "2026-09-01", "Accepted", "proj-4", "emp-2", [
    it("q4-1", "Fixed facade glazing windows", "Fixed Windows", "Fixed", "Various", 900, "Sq.ft", 450),
    it("q4-2", "Sliding windows for cabins", "uPVC Sliding Windows", "Sliding 2-Track", "Various", 600, "Sq.ft", 540),
    it("q4-3", "Hardware and locks", "Accessories and Hardware", "Not Applicable", "", 1, "Lot", 65000),
  ]),
  Q("q-5", "SKY/QT/0005", L["lead-5"], "2026-08-10", "2026-09-09", "Accepted", "proj-5", "emp-1", [
    it("q5-1", "Lift and slide door, laminated golden oak", "Lift and Slide Doors", "Lift & Slide", "12 ft x 8 ft", 2, "Nos", 185000, 5),
    it("q5-2", "Casement windows", "uPVC Casement Windows", "Casement", "Various", 120, "Sq.ft", 680),
    it("q5-3", "Installation", "Installation and Fabrication", "Not Applicable", "", 1, "Job", 30000),
  ]),
  Q("q-6", "SKY/QT/0006", L["lead-6"], "2026-09-10", "2026-10-10", "Accepted", "proj-6", "emp-3", [
    it("q6-1", "Classroom sliding windows", "uPVC Sliding Windows", "Sliding 2-Track", "Various", 2400, "Sq.ft", 495, 10),
    it("q6-2", "Installation", "Installation and Fabrication", "Not Applicable", "", 1, "Job", 140000),
  ]),
  Q("q-7", "SKY/QT/0007", L["lead-8"], "2026-09-28", "2026-10-28", "Under Negotiation", "", "emp-1", [
    it("q7-1", "Acoustic casement windows, double glazed", "uPVC Casement Windows", "Casement", "Various", 1500, "Sq.ft", 600),
    it("q7-2", "French doors for suites", "French Windows", "French", "6 ft x 7 ft", 20, "Nos", 45000),
  ]),
  Q("q-8", "SKY/QT/0008", L["lead-7"], "2026-10-05", "2026-11-04", "Sent", "", "emp-2", [
    it("q8-1", "2-track sliding windows", "uPVC Sliding Windows", "Sliding 2-Track", "Various", 140, "Sq.ft", 560),
    it("q8-2", "Mosquito mesh sets", "Accessories and Hardware", "Not Applicable", "", 6, "Set", 2500, 0, 12),
  ]),
  Q("q-9", "SKY/QT/0009", L["lead-10"], "2026-10-18", "2026-11-17", "Draft", "", "emp-3", [
    it("q9-1", "Sliding doors", "uPVC Sliding Doors", "Sliding 2-Track", "8 ft x 7 ft", 3, "Nos", 52000),
    it("q9-2", "Casement windows", "uPVC Casement Windows", "Casement", "Various", 200, "Sq.ft", 660),
  ]),
];
const QM = Object.fromEntries(quotations.map((q) => [q.id, q]));

const P = (id, code, leadId, quotationId, startDate, status, employeeId, siteContact) => {
  const l = L[leadId];
  const q = QM[quotationId];
  return {
    id, code, name: l.projectName, leadId, quotationId,
    customerName: l.customerName, companyName: l.companyName, phone: l.phone, email: l.email,
    billingAddress: l.billingAddress, siteAddress: l.siteAddress, city: l.city, siteContact,
    startDate, status, employeeId,
    value: q ? docTotals(q.items, q.additionalCharges, q.taxTreatment).grand : l.value,
    notes: "",
  };
};

const projects = [
  P("proj-1", "P-2001", "lead-1", "q-1", "2026-07-12", "Installation", "emp-3", "Rajesh Kumar"),
  P("proj-2", "P-2002", "lead-2", "q-2", "2026-07-01", "Manufacturing", "emp-3", "Site office — 9876511111"),
  P("proj-3", "P-2003", "lead-3", "q-3", "2026-06-02", "Completed", "emp-5", "Suresh Patil"),
  P("proj-4", "P-2004", "lead-4", "q-4", "2026-08-10", "In Progress", "emp-3", "Facility manager"),
  P("proj-5", "P-2005", "lead-5", "q-5", "2026-08-20", "Manufacturing", "emp-5", "Manoj Desai"),
  P("proj-6", "P-2006", "lead-6", "q-6", "2026-10-05", "Planning", "emp-3", "Farah Khan"),
];
const PM = Object.fromEntries(projects.map((p) => [p.id, p]));

const subtotalOf = (qid) => { const q = QM[qid]; return docTotals(q.items).subtotal; };
const stageItem = (id, qid, pct, label) =>
  it(id, `${label} — ${Math.round(pct * 100)}% against ${QM[qid].number}`, "Other Custom Items", "Not Applicable", "", 1, "Lot", round2(subtotalOf(qid) * pct));

const INV = (id, number, projectId, date, dueDate, stage, items, payments = [], state = "Finalized") => ({
  id, number, projectId, quotationId: PM[projectId].quotationId, date, dueDate, stage, reference: "",
  preparedBy: "emp-4", taxTreatment: "CGST_SGST", buyerGstin: "", siteContact: PM[projectId].siteContact,
  items, additionalCharges: 0, notes: "", state, voidReason: "", payments,
  history: [{ id: `${id}-h0`, date, text: state === "Draft" ? "Draft created" : "Invoice finalized" }],
});
const full = (items) => docTotals(items).grand;
const pay = (id, date, amount, method, ref) => ({ id, date, amount: round2(amount), method, ref, notes: "" });

const i1 = [stageItem("i1-1", "q-1", 0.3, "Advance Payment")];
const i2 = [stageItem("i2-1", "q-1", 0.4, "Progress Billing")];
const i3 = [stageItem("i3-1", "q-2", 0.25, "Advance Payment")];
const i4 = [stageItem("i4-1", "q-2", 0.35, "Manufacturing stage")];
const i5 = [stageItem("i5-1", "q-2", 0.25, "Installation stage")];
const i6 = QM["q-3"].items.map((x, n) => ({ ...x, id: `i6-${n}` }));
const i7 = [stageItem("i7-1", "q-4", 0.5, "Material Supply")];
const i8 = [stageItem("i8-1", "q-5", 0.4, "Advance Payment")];

const invoices = [
  INV("inv-1", "SKY/INV/0001", "proj-1", "2026-07-12", "2026-07-27", "Advance Payment", i1, [pay("pay-1", "2026-07-15", full(i1), "Bank Transfer", "NEFT-778812")]),
  INV("inv-2", "SKY/INV/0002", "proj-1", "2026-10-15", "2026-11-05", "Progress Billing", i2, [pay("pay-2", "2026-10-18", round2(full(i2) / 2), "UPI", "UPI-55123")]),
  INV("inv-3", "SKY/INV/0003", "proj-2", "2026-07-02", "2026-07-17", "Advance Payment", i3, [pay("pay-3", "2026-07-08", round2(full(i3) * 0.6), "Bank Transfer", "RTGS-1001"), pay("pay-4", "2026-07-16", round2(full(i3) - round2(full(i3) * 0.6)), "Cheque", "CHQ-004512")]),
  INV("inv-4", "SKY/INV/0004", "proj-2", "2026-09-20", "2026-10-05", "Manufacturing", i4),
  INV("inv-5", "SKY/INV/0005", "proj-2", "2026-10-21", "2026-11-05", "Installation", i5, [], "Draft"),
  INV("inv-6", "SKY/INV/0006", "proj-3", "2026-06-30", "2026-07-15", "Final Invoice", i6, [pay("pay-5", "2026-07-10", full(i6), "Bank Transfer", "NEFT-90021")]),
  INV("inv-7", "SKY/INV/0007", "proj-4", "2026-10-12", "2026-11-12", "Material Supply", i7),
  INV("inv-8", "SKY/INV/0008", "proj-5", "2026-08-22", "2026-11-30", "Advance Payment", i8, [pay("pay-6", "2026-08-25", 150000, "Cheque", "CHQ-118822")]),
];

const inventory = [
  { id: "item-1", code: "PRF-001", name: "Sliding frame profile 60mm", category: "uPVC Profiles", description: "White uPVC 2-track frame, 6m length", unit: "Mtr", stock: 1800, reserved: 400, purchaseRate: 210, sellingRate: 290, reorderLevel: 500 },
  { id: "item-2", code: "PRF-002", name: "Casement sash profile", category: "uPVC Profiles", description: "White uPVC sash, 6m length", unit: "Mtr", stock: 950, reserved: 300, purchaseRate: 230, sellingRate: 320, reorderLevel: 400 },
  { id: "item-3", code: "GLS-005", name: "5mm clear float glass", category: "Glass", description: "Clear float glass sheets", unit: "Sq.ft", stock: 2600, reserved: 900, purchaseRate: 55, sellingRate: 80, reorderLevel: 800 },
  { id: "item-4", code: "GLS-006", name: "6mm toughened glass", category: "Glass", description: "Toughened glass for doors", unit: "Sq.ft", stock: 700, reserved: 450, purchaseRate: 95, sellingRate: 140, reorderLevel: 400 },
  { id: "item-5", code: "STL-001", name: "GI steel reinforcement 1.2mm", category: "Steel Reinforcement", description: "Galvanised steel insert", unit: "Mtr", stock: 1400, reserved: 200, purchaseRate: 70, sellingRate: 100, reorderLevel: 300 },
  { id: "item-6", code: "HDL-010", name: "Multipoint lock set", category: "Hardware and Locks", description: "For French & casement doors", unit: "Set", stock: 35, reserved: 20, purchaseRate: 1800, sellingRate: 2600, reorderLevel: 20 },
  { id: "item-7", code: "ROL-003", name: "Tandem roller (sliding)", category: "Rollers", description: "Heavy duty steel bearing roller", unit: "Nos", stock: 420, reserved: 96, purchaseRate: 140, sellingRate: 220, reorderLevel: 150 },
  { id: "item-8", code: "HNG-002", name: "Friction stay hinge 12\"", category: "Hinges", description: "SS 304 friction stay", unit: "Nos", stock: 60, reserved: 10, purchaseRate: 260, sellingRate: 380, reorderLevel: 80 },
  { id: "item-9", code: "HND-004", name: "Espagnolette handle", category: "Handles", description: "White casement handle", unit: "Nos", stock: 210, reserved: 40, purchaseRate: 180, sellingRate: 280, reorderLevel: 60 },
  { id: "item-10", code: "GSK-001", name: "EPDM gasket", category: "Gaskets and Seals", description: "Glazing gasket roll", unit: "Mtr", stock: 3000, reserved: 500, purchaseRate: 14, sellingRate: 22, reorderLevel: 1000 },
  { id: "item-11", code: "FST-008", name: "Frame fixing screws 100mm", category: "Fasteners", description: "With anchor fasteners (box of 100)", unit: "Set", stock: 8, reserved: 8, purchaseRate: 450, sellingRate: 650, reorderLevel: 10 },
  { id: "item-12", code: "INS-002", name: "Silicone sealant (clear)", category: "Installation Materials", description: "300ml cartridge", unit: "Nos", stock: 140, reserved: 30, purchaseRate: 210, sellingRate: 290, reorderLevel: 50 },
];

const movements = [
  { id: "mv-1", itemId: "item-1", date: "2026-10-02", type: "Received", qty: 600, projectId: "", reference: "GRN-221", notes: "Supplier delivery", balanceAfter: 1800 },
  { id: "mv-2", itemId: "item-1", date: "2026-10-04", type: "Reserved", qty: 400, projectId: "proj-2", reference: "", notes: "Reserved for tower B", balanceAfter: 1800 },
  { id: "mv-3", itemId: "item-3", date: "2026-10-07", type: "Issued", qty: 300, projectId: "proj-1", reference: "ISS-118", notes: "Issued to fabrication", balanceAfter: 2600 },
  { id: "mv-4", itemId: "item-11", date: "2026-10-15", type: "Adjustment", qty: -2, projectId: "", reference: "AUD-03", notes: "Damaged boxes", balanceAfter: 8 },
];

const documents = [
  { id: "doc-1", employeeId: "emp-1", name: "rahul-aadhaar-front.pdf", type: "Aadhaar Card", uploadedDate: "2026-04-12", status: "Verified", size: "245 KB" },
  { id: "doc-2", employeeId: "emp-1", name: "rahul-pan-card.pdf", type: "PAN Card", uploadedDate: "2026-04-12", status: "Verified", size: "185 KB" },
  { id: "doc-3", employeeId: "emp-1", name: "rahul-appointment-letter.pdf", type: "Offer / Appointment Letter", uploadedDate: "2021-04-10", status: "Verified", size: "320 KB" },
  { id: "doc-4", employeeId: "emp-2", name: "sneha-aadhaar-card.pdf", type: "Aadhaar Card", uploadedDate: "2026-07-01", status: "Verified", size: "210 KB" },
  { id: "doc-5", employeeId: "emp-2", name: "sneha-pan-card.pdf", type: "PAN Card", uploadedDate: "2026-07-01", status: "Verified", size: "190 KB" },
  { id: "doc-6", employeeId: "emp-2", name: "sneha-nda-contract.pdf", type: "NDA Letter", uploadedDate: "2022-07-01", status: "Verified", size: "275 KB" },
  { id: "doc-7", employeeId: "emp-3", name: "amit-aadhaar.pdf", type: "Aadhaar Card", uploadedDate: "2026-11-16", status: "Verified", size: "260 KB" },
  { id: "doc-8", employeeId: "emp-3", name: "amit-fabrication-certificate.pdf", type: "Educational Certificate", uploadedDate: "2020-11-16", status: "Verified", size: "340 KB" },
  { id: "doc-9", employeeId: "emp-4", name: "priya-aadhaar-card.pdf", type: "Aadhaar Card", uploadedDate: "2026-01-09", status: "Verified", size: "230 KB" },
  { id: "doc-10", employeeId: "emp-4", name: "priya-pan-card.pdf", type: "PAN Card", uploadedDate: "2026-01-09", status: "Verified", size: "195 KB" },
  { id: "doc-11", employeeId: "emp-5", name: "vikram-aadhaar-card.pdf", type: "Aadhaar Card", uploadedDate: "2026-09-20", status: "Verified", size: "215 KB" },
  { id: "doc-12", employeeId: "emp-5", name: "vikram-installation-experience.pdf", type: "Experience Certificate", uploadedDate: "2021-09-20", status: "Pending", size: "410 KB" },
  { id: "doc-13", employeeId: "emp-6", name: "neha-aadhaar-card.pdf", type: "Aadhaar Card", uploadedDate: "2026-03-04", status: "Verified", size: "225 KB" },
  { id: "doc-14", employeeId: "emp-6", name: "neha-pan-card.pdf", type: "PAN Card", uploadedDate: "2026-03-04", status: "Pending", size: "180 KB" },
];

export const seed = { settings, employees, leads, quotations, projects, invoices, inventory, movements, documents };

