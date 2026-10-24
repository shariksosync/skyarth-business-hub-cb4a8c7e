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
export const PROJECT_EXECUTION_STAGES = [
  "Advance Received",
  "Measurement Taken",
  "Production Started",
  "Material Dispatched",
  "Installation",
  "Project Completed",
];
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
  { id: "lead-1", code: "L-1001", customerName: "Rajesh Kumar", companyName: "", phone: "9876500001", email: "rajesh.kumar@example.com", billingAddress: "Flat 7, Shanti Heights, Baner, Pune 411045", projectName: "Kumar Residence", siteAddress: "Plot 22, Baner Road, Baner, Pune 411045", city: "Baner, Pune", source: "Referral", employeeId: "emp-1", value: 200000, followUpDate: "", expectedCompletionDate: "2026-08-30", requirements: "Casement and sliding windows, one French door", notes: "", status: "Converted", createdDate: "2026-07-02", projectId: "proj-1", siteVisits: [], history: [H("h-1", "2026-07-02", "Lead created"), H("h-2", "2026-07-10", "Converted to project P-2001")] },
  { id: "lead-2", code: "L-1002", customerName: "Anil Mehta", companyName: "Green Valley Developers", phone: "9876500002", email: "anil@greenvalleydev.example", billingAddress: "GV House, Wakad, Pune 411057", projectName: "Green Valley Apartments", siteAddress: "Survey No. 41, Wakad, Pune 411057", city: "Wakad, Pune", source: "Builder", employeeId: "emp-1", value: 3500000, followUpDate: "", expectedCompletionDate: "2026-09-15", requirements: "Full tower window and sliding door package", notes: "", status: "Converted", createdDate: "2026-06-18", projectId: "proj-2", siteVisits: [], history: [H("h-3", "2026-06-18", "Lead created")] },
  { id: "lead-3", code: "L-1003", customerName: "Suresh Patil", companyName: "", phone: "9876500003", email: "suresh.patil@example.com", billingAddress: "12 Karve Nagar, Pune 411052", projectName: "Patil Bungalow", siteAddress: "Lane 5, Kothrud, Pune 411038", city: "Kothrud, Pune", source: "Website", employeeId: "emp-2", value: 150000, followUpDate: "", expectedCompletionDate: "2026-07-15", requirements: "Casement & fixed windows", notes: "", status: "Converted", createdDate: "2026-05-20", projectId: "proj-3", siteVisits: [], history: [H("h-4", "2026-05-20", "Lead created")] },
  { id: "lead-4", code: "L-1004", customerName: "Kavita Rao", companyName: "Orion Infra Pvt Ltd", phone: "9876500004", email: "kavita.rao@orioninfra.example", billingAddress: "Orion Tower, Baner, Pune 411045", projectName: "Orion Office Hinjewadi", siteAddress: "Phase 2, Hinjewadi, Pune 411057", city: "Hinjewadi, Pune", source: "Architect", employeeId: "emp-2", value: 900000, followUpDate: "", expectedCompletionDate: "2026-09-30", requirements: "Office facade fixed and sliding windows", notes: "", status: "Converted", createdDate: "2026-07-25", projectId: "proj-4", siteVisits: [], history: [H("h-5", "2026-07-25", "Lead created")] },
  { id: "lead-5", code: "L-1005", customerName: "Manoj Desai", companyName: "", phone: "9876500005", email: "manoj.desai@example.com", billingAddress: "Desai Villa, ITI Road, Aundh, Pune 411007", projectName: "Desai Villa", siteAddress: "Desai Villa, ITI Road, Aundh, Pune 411007", city: "Aundh, Pune", source: "Exhibition", employeeId: "emp-1", value: 550000, followUpDate: "", expectedCompletionDate: "2026-10-15", requirements: "Lift and slide doors for living room", notes: "", status: "Converted", createdDate: "2026-08-04", projectId: "proj-5", siteVisits: [], history: [H("h-6", "2026-08-04", "Lead created")] },
  { id: "lead-6", code: "L-1006", customerName: "Farah Khan", companyName: "Sunrise Education Trust", phone: "9876500006", email: "admin@sunrisetrust.example", billingAddress: "Trust Office, Hadapsar, Pune 411028", projectName: "Sunrise School Block B", siteAddress: "Magarpatta Road, Hadapsar, Pune 411028", city: "Hadapsar, Pune", source: "Phone Inquiry", employeeId: "emp-3", value: 1500000, followUpDate: "", expectedCompletionDate: "2026-11-30", requirements: "Classroom sliding windows", notes: "", status: "Converted", createdDate: "2026-09-02", projectId: "proj-6", siteVisits: [], history: [H("h-7", "2026-09-02", "Lead created")] },
  { id: "lead-7", code: "L-1007", customerName: "Deepak Verma", companyName: "", phone: "9876500007", email: "deepak.verma@example.com", billingAddress: "B-504, Sky Towers, Viman Nagar, Pune 411014", projectName: "Verma Flat Renovation", siteAddress: "B-504, Sky Towers, Viman Nagar, Pune 411014", city: "Viman Nagar, Pune", source: "Website", employeeId: "emp-2", value: 95000, followUpDate: "2026-10-27", expectedCompletionDate: "2026-11-25", requirements: "Replace aluminium sliders with uPVC", notes: "Prefers white profiles", status: "Qualified", createdDate: "2026-10-01", projectId: "", siteVisits: [], history: [H("h-8", "2026-10-01", "Lead created"), H("h-9", "2026-10-05", "Quotation sent")] },
  { id: "lead-8", code: "L-1008", customerName: "Rohit Sharma", companyName: "Lotus Hospitality LLP", phone: "9876500008", email: "rohit@lotushotels.example", billingAddress: "Lotus Hotel, Koregaon Park, Pune 411001", projectName: "Lotus Hotel Renovation", siteAddress: "Lane 6, Koregaon Park, Pune 411001", city: "Koregaon Park, Pune", source: "Architect", employeeId: "emp-1", value: 1800000, followUpDate: "2026-10-25", expectedCompletionDate: "2026-12-10", requirements: "Acoustic casement windows for 60 rooms", notes: "Negotiating on French door rates", status: "Negotiation", createdDate: "2026-09-12", projectId: "", siteVisits: [{ id: "sv-1", date: "2026-09-20", time: "11:00", employeeId: "emp-1", observations: "60 rooms measured; heritage facade" }], history: [H("h-10", "2026-09-12", "Lead created"), H("h-11", "2026-09-20", "Site visit completed")] },
  { id: "lead-9", code: "L-1009", customerName: "Meera Iyer", companyName: "", phone: "9876500009", email: "meera.iyer@example.com", billingAddress: "Magarpatta City, Pune 411013", projectName: "Iyer Apartment", siteAddress: "Cosmos Tower, Magarpatta City, Pune 411013", city: "Magarpatta, Pune", source: "Social Media", employeeId: "emp-6", value: 120000, followUpDate: "2026-10-24", expectedCompletionDate: "2026-11-15", requirements: "Balcony sliding door", notes: "", status: "New", createdDate: "2026-10-20", projectId: "", siteVisits: [], history: [H("h-12", "2026-10-20", "Lead created")] },
  { id: "lead-10", code: "L-1010", customerName: "Kiran Bhosale", companyName: "", phone: "9876500010", email: "kiran.b@example.com", billingAddress: "Shivaji Nagar, Pune 411005", projectName: "Bhosale Farmhouse", siteAddress: "Tungarli, Lonavala 410401", city: "Lonavala", source: "Referral", employeeId: "emp-3", value: 300000, followUpDate: "2026-10-29", expectedCompletionDate: "2026-12-05", requirements: "Sliding doors & casement windows", notes: "", status: "Site Visit Scheduled", createdDate: "2026-10-08", projectId: "", siteVisits: [{ id: "sv-2", date: "2026-10-29", time: "10:30", employeeId: "emp-5", observations: "Scheduled" }], history: [H("h-13", "2026-10-08", "Lead created")] },
  { id: "lead-11", code: "L-1011", customerName: "Arjun Nair", companyName: "", phone: "9876500011", email: "arjun.nair@example.com", billingAddress: "EON Free Zone Road, Kharadi, Pune 411014", projectName: "Nair Duplex", siteAddress: "Kharadi, Pune 411014", city: "Kharadi, Pune", source: "Walk-in", employeeId: "emp-2", value: 180000, followUpDate: "2026-11-02", expectedCompletionDate: "2026-11-20", requirements: "Tilt & turn windows", notes: "", status: "Contacted", createdDate: "2026-10-14", projectId: "", siteVisits: [], history: [H("h-14", "2026-10-14", "Lead created")] },
  { id: "lead-12", code: "L-1012", customerName: "Pooja Jain", companyName: "", phone: "9876500012", email: "pooja.jain@example.com", billingAddress: "Wagholi, Pune 412207", projectName: "Jain Residence", siteAddress: "Wagholi, Pune 412207", city: "Wagholi, Pune", source: "Website", employeeId: "emp-6", value: 80000, followUpDate: "", expectedCompletionDate: "2026-10-10", requirements: "Windows for 2BHK", notes: "Went with another vendor", status: "Lost", createdDate: "2026-08-22", projectId: "", siteVisits: [], history: [H("h-15", "2026-08-22", "Lead created")] },
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
  {
    id: "q-10",
    number: "SKY/QT/2026/0010",
    customerName: "Mr. Mahesh Chawla Sir",
    projectName: "PUNE",
    customerPhone: "9822011001",
    customerEmail: "mahesh.chawla@example.com",
    customerAddress: "Pune, Maharashtra",
    siteAddress: "PUNE",
    billingAddress: "PUNE",
    date: "2026-10-15",
    validUntil: "2026-11-14",
    status: "Sent",
    subject: "Delivery Of uPVC DOORS & WINDOWS",
    productBrand: "Fenstech",
    windowColour: "White",
    deliveryDays: "Delivery with in 30 days",
    meshType: "Nylon",
    paymentTerms: "Payment - 100% Advance",
    hardwareBrand: "Windseal / DNV Imported hardware",
    installationRatePerSqft: 30,
    installationCharges: 4961.61,
    transportCharges: 2500,
    taxRate: 18,
    representativeName: "Mr. Swapnil Pawar",
    representativeAddress: "Gat NO.226, BAIF Road, Manjari Khurd, Satav wasti, Pune 412307",
    items: [
      { id: "mc-1", windowCode: "W1", location: "BEDROOM 1", widthMm: 1524, heightMm: 1402, areaSqft: 23.12, qty: 1, totalAreaSqft: 23.12, rate: 480, valueEach: 11098.18, totalValue: 11098.18, glassThickness: "5", glassSpec: "CLEAR GLASS", lockingType: "TOUCHLOCK", designSpecs: "3 TRACK 2 GLASS 1 MESH (99MM SECTION)" },
      { id: "mc-2", windowCode: "W2", location: "WASHROOM 1", widthMm: 914, heightMm: 701, areaSqft: 6.94, qty: 1, totalAreaSqft: 6.94, rate: 460, valueEach: 3190.73, totalValue: 3190.73, glassThickness: "4", glassSpec: "FROSTED GLASS", lockingType: "LOUVERS", designSpecs: "LOUVERS WITH EXHAUST FAN PROVISION" },
      { id: "mc-3", windowCode: "W3", location: "WASHROOM 2", widthMm: 914, heightMm: 701, areaSqft: 6.94, qty: 1, totalAreaSqft: 6.94, rate: 460, valueEach: 3190.73, totalValue: 3190.73, glassThickness: "4", glassSpec: "FROSTED GLASS", lockingType: "LOUVERS", designSpecs: "LOUVERS WITH EXHAUST FAN PROVISION" },
      { id: "mc-4", windowCode: "W4", location: "BEDROOM 2", widthMm: 945, heightMm: 1250, areaSqft: 12.78, qty: 1, totalAreaSqft: 12.78, rate: 480, valueEach: 6132.95, totalValue: 6132.95, glassThickness: "5", glassSpec: "CLEAR GLASS", lockingType: "TOUCHLOCK", designSpecs: "3 TRACK 2 GLASS 1 MESH (99MM SECTION)" },
      { id: "mc-5", windowCode: "W5", location: "WASHROOM 3", widthMm: 914, heightMm: 914, areaSqft: 9.05, qty: 1, totalAreaSqft: 9.05, rate: 460, valueEach: 4161.82, totalValue: 4161.82, glassThickness: "4", glassSpec: "FROSTED GLASS", lockingType: "LOUVERS", designSpecs: "LOUVERS WITH EXHAUST FAN PROVISION" },
      { id: "mc-6", windowCode: "W6", location: "BEDROOM 3", widthMm: 1250, heightMm: 1250, areaSqft: 16.90, qty: 1, totalAreaSqft: 16.90, rate: 480, valueEach: 8111.32, totalValue: 8111.32, glassThickness: "5", glassSpec: "CLEAR GLASS", lockingType: "TOUCHLOCK", designSpecs: "3 TRACK 2 GLASS 1 MESH (99MM SECTION)" },
      { id: "mc-7", windowCode: "W7", location: "BELOW STAIRS", widthMm: 671, heightMm: 853, areaSqft: 6.19, qty: 1, totalAreaSqft: 6.19, rate: 630, valueEach: 3901.25, totalValue: 3901.25, glassThickness: "5", glassSpec: "CLEAR GLASS", lockingType: "HANDLE", designSpecs: "OPENABLE WINDOW" },
      { id: "mc-8", windowCode: "W8", location: "STAIRS", widthMm: 2012, heightMm: 1189, areaSqft: 25.88, qty: 1, totalAreaSqft: 25.88, rate: 480, valueEach: 12420.31, totalValue: 12420.31, glassThickness: "5", glassSpec: "CLEAR GLASS", lockingType: "TOUCHLOCK", designSpecs: "3 TRACK 2 GLASS 1 MESH (99MM SECTION)" },
      { id: "mc-9", windowCode: "W9", location: "BEDROOM 4", widthMm: 1554, heightMm: 1433, areaSqft: 24.10, qty: 1, totalAreaSqft: 24.10, rate: 480, valueEach: 11566.24, totalValue: 11566.24, glassThickness: "5", glassSpec: "CLEAR GLASS", lockingType: "TOUCHLOCK", designSpecs: "3 TRACK 2 GLASS 1 MESH (99MM SECTION)" },
      { id: "mc-10", windowCode: "W10", location: "BEDROOM 4", widthMm: 1189, heightMm: 1158, areaSqft: 14.90, qty: 1, totalAreaSqft: 14.90, rate: 480, valueEach: 7151.09, totalValue: 7151.09, glassThickness: "5", glassSpec: "CLEAR GLASS", lockingType: "TOUCHLOCK", designSpecs: "3 TRACK 2 GLASS 1 MESH (99MM SECTION)" },
      { id: "mc-11", windowCode: "W11", location: "BEDROOM 4", widthMm: 884, heightMm: 1189, areaSqft: 11.37, qty: 1, totalAreaSqft: 11.37, rate: 480, valueEach: 5457.41, totalValue: 5457.41, glassThickness: "5", glassSpec: "CLEAR GLASS", lockingType: "TOUCHLOCK", designSpecs: "3 TRACK 2 GLASS 1 MESH (99MM SECTION)" },
      { id: "mc-12", windowCode: "W12", location: "WASHROOM 4", widthMm: 914, heightMm: 732, areaSqft: 7.24, qty: 1, totalAreaSqft: 7.24, rate: 460, valueEach: 3329.45, totalValue: 3329.45, glassThickness: "4", glassSpec: "FROSTED GLASS", lockingType: "LOUVERS", designSpecs: "LOUVERS WITH EXHAUST FAN PROVISION" },
    ],
    history: [{ id: "q10-h0", date: "2026-10-15", text: "Quotation created for Mr. Mahesh Chawla Sir" }],
  },
];
const QM = Object.fromEntries(quotations.map((q) => [q.id, q]));

const P = (
  id, code, leadId, quotationId, startDate, status, employeeId, siteContact,
  workOrderNo = "", workOrderDate = "", targetCompletionDate = "", currentStage = "Advance Received",
  stages = [], phases = [], communications = []
) => {
  const l = L[leadId] || {};
  const q = QM[quotationId];
  const targetDate = targetCompletionDate || l.expectedCompletionDate || "2026-11-30";
  const defaultStages = PROJECT_EXECUTION_STAGES.map((stg, idx) => {
    let sStatus = "Pending";
    let completedDate = "";
    if (stg === "Advance Received") {
      sStatus = "Completed";
      completedDate = startDate;
    } else if (currentStage === stg) {
      sStatus = "In Progress";
    } else if (PROJECT_EXECUTION_STAGES.indexOf(currentStage) > idx) {
      sStatus = "Completed";
      completedDate = startDate;
    }
    return {
      stageName: stg,
      targetDate: targetDate,
      completedDate,
      status: sStatus,
      supervisorId: employeeId,
      notes: "",
    };
  });

  return {
    id, code, name: l.projectName || "Unnamed Project", leadId, quotationId,
    customerName: l.customerName || "", companyName: l.companyName || "", phone: l.phone || "", email: l.email || "",
    billingAddress: l.billingAddress || "", siteAddress: l.siteAddress || "", city: l.city || "", siteContact,
    startDate, status, employeeId,
    workOrderNo: workOrderNo || `WO/${code}/2026`,
    workOrderDate: workOrderDate || startDate,
    targetCompletionDate: targetDate,
    currentStage: currentStage || "Advance Received",
    stages: stages.length ? stages : defaultStages,
    phases: phases || [],
    communications: communications || [],
    value: q ? docTotals(q.items, q.additionalCharges, q.taxTreatment).grand : l.value || 0,
    notes: "",
  };
};

const projects = [
  P(
    "proj-1", "P-2001", "lead-1", "q-1", "2026-07-12", "Installation", "emp-3", "Rajesh Kumar",
    "WO/KR/2026/041", "2026-07-10", "2026-08-30", "Installation",
    [
      { stageName: "Advance Received", targetDate: "2026-07-12", completedDate: "2026-07-12", status: "Completed", supervisorId: "emp-4", notes: "30% mobilization advance received via NEFT-778812." },
      { stageName: "Measurement Taken", targetDate: "2026-07-16", completedDate: "2026-07-15", status: "Completed", supervisorId: "emp-3", notes: "All window openings verified on-site by Amit Joshi. Sill height: 900mm." },
      { stageName: "Production Started", targetDate: "2026-07-25", completedDate: "2026-07-22", status: "Completed", supervisorId: "emp-3", notes: "Profiles cut & welded; multi-point locks fitted." },
      { stageName: "Material Dispatched", targetDate: "2026-08-05", completedDate: "2026-08-02", status: "Completed", supervisorId: "emp-5", notes: "Dispatched 7 window sets via Tempo MH-12-AB-1234." },
      { stageName: "Installation", targetDate: "2026-08-20", completedDate: "", status: "In Progress", supervisorId: "emp-5", notes: "Subframe anchored; PU foam & weather silicone sealing underway." },
      { stageName: "Project Completed", targetDate: "2026-08-30", completedDate: "", status: "Pending", supervisorId: "emp-3", notes: "Final cleaning, hardware alignment, and warranty handover pending." },
    ],
    [
      {
        id: "ph-2001-1",
        name: "Phase 1: Ground Floor (Living & Kitchen)",
        scope: "4 Casement Windows, 1 French Door (105 sq.ft)",
        targetDate: "2026-08-15",
        activeStage: "Installation",
        civilReadiness: "100% Ready (Civil plastering & sill stone fixed)",
        measurementStatus: "Completed on 15 Jul 2026",
        productionStatus: "Fabricated and quality certified",
        dispatchStatus: "Dispatched on 02 Aug 2026 (Challan #CH-882)",
        installationStatus: "In Progress (Glazing & silicon sealing)",
        unitsCount: 5,
        notes: "French door frame anchored with heavy-duty fasteners."
      },
      {
        id: "ph-2001-2",
        name: "Phase 2: 1st Floor (Bedrooms & Balcony)",
        scope: "3 Sliding 2-Track Windows (90 sq.ft)",
        targetDate: "2026-08-28",
        activeStage: "Material Dispatched",
        civilReadiness: "Plastering completed; openings cleared",
        measurementStatus: "Completed on 15 Jul 2026",
        productionStatus: "Completed at factory",
        dispatchStatus: "Dispatched on 02 Aug 2026",
        installationStatus: "Scheduled after Ground Floor silicone cure",
        unitsCount: 3,
        notes: "Mesh shutters packed with protective film."
      }
    ],
    [
      {
        id: "comm-1",
        date: "2026-08-02T11:30:00Z",
        channel: "WhatsApp",
        recipient: "9876500001 (Rajesh Kumar)",
        subject: "Material Dispatched Update",
        message: "Dear Rajesh Kumar, Material for Phase 1 & 2 of Kumar Residence has been dispatched from our factory. Our installation supervisor Vikram Pawar will reach site tomorrow morning. Target completion: 30 Aug 2026."
      }
    ]
  ),
  P(
    "proj-2", "P-2002", "lead-2", "q-2", "2026-07-01", "Manufacturing", "emp-3", "Site office — 9876511111",
    "GVD/WO/2026/0118", "2026-06-28", "2026-12-31", "Installation",
    [
      { stageName: "Advance Received", targetDate: "2026-07-02", completedDate: "2026-07-02", status: "Completed", supervisorId: "emp-4", notes: "25% mobilization advance received via RTGS-1001 & CHQ-004512." },
      { stageName: "Measurement Taken", targetDate: "2026-07-10", completedDate: "2026-07-06", status: "Completed", supervisorId: "emp-3", notes: "Floors 1 & 2 measured. 24 openings verified. Remaining floors awaiting civil handover." },
      { stageName: "Production Started", targetDate: "2026-07-20", completedDate: "2026-07-12", status: "Completed", supervisorId: "emp-3", notes: "Batch 1 (Floors 1 & 2) fabricated; Batch 2 (Floors 3 & 4) cutting started." },
      { stageName: "Material Dispatched", targetDate: "2026-08-01", completedDate: "2026-07-24", status: "Completed", supervisorId: "emp-5", notes: "48 window/door units for Floors 1 & 2 dispatched under Challan #CH-991." },
      { stageName: "Installation", targetDate: "2026-09-15", completedDate: "", status: "In Progress", supervisorId: "emp-5", notes: "Floors 1 & 2 installation underway. Tower crane utilized for upper floor staging." },
      { stageName: "Project Completed", targetDate: "2026-12-31", completedDate: "", status: "Pending", supervisorId: "emp-3", notes: "Entire 11-floor tower final handover targeted for end of year." },
    ],
    [
      {
        id: "ph-2002-1",
        name: "Phase 1: 1st & 2nd Floor (Civil Ready)",
        scope: "8 Flats (24 Sliding 3-Track Windows, 8 Casement, 4 Balcony Sliders)",
        targetDate: "2026-08-25",
        activeStage: "Installation",
        civilReadiness: "100% Ready (Civil plastering & sill stone fixed)",
        measurementStatus: "Completed on 06 Jul 2026",
        productionStatus: "100% Fabricated at factory",
        dispatchStatus: "Dispatched on 24 Jul 2026 (Challan #CH-991)",
        installationStatus: "In Progress (Outer frames fixed, sash alignment ongoing)",
        unitsCount: 48,
        notes: "Civil team cleared scaffolding on eastern elevation."
      },
      {
        id: "ph-2002-2",
        name: "Phase 2: 3rd & 4th Floor (Plastering Ongoing)",
        scope: "8 Flats (24 Sliding 3-Track Windows, 8 Casement, 4 Balcony Sliders)",
        targetDate: "2026-09-30",
        activeStage: "Production Started",
        civilReadiness: "Internal plastering ready; window openings released for measurement",
        measurementStatus: "Completed on 30 Jul 2026 by Amit Joshi",
        productionStatus: "In Progress (Extrusion cutting & steel insertion in factory)",
        dispatchStatus: "Scheduled for 20 Aug 2026",
        installationStatus: "Pending Dispatch",
        unitsCount: 48,
        notes: "Production prioritized for early dispatch."
      },
      {
        id: "ph-2002-3",
        name: "Phase 3: 5th to 7th Floor (Brickwork Stage)",
        scope: "12 Flats (36 Sliding Windows, 12 Casement, 6 Balcony Sliders)",
        targetDate: "2026-11-15",
        activeStage: "Advance Received",
        civilReadiness: "Brickwork ongoing; civil team casting lintels",
        measurementStatus: "Pending Civil Handover",
        productionStatus: "Scheduled post measurement",
        dispatchStatus: "Pending",
        installationStatus: "Pending",
        unitsCount: 72,
        notes: "Site engineer committed measurement release by 25 Aug 2026."
      },
      {
        id: "ph-2002-4",
        name: "Phase 4: 8th to 11th Floor (Top Floors)",
        scope: "16 Flats (48 Sliding Windows, 16 Casement, 8 Balcony Sliders)",
        targetDate: "2026-12-31",
        activeStage: "Advance Received",
        civilReadiness: "Slab casting in progress",
        measurementStatus: "Planned for October 2026",
        productionStatus: "Planned",
        dispatchStatus: "Planned",
        installationStatus: "Planned",
        unitsCount: 96,
        notes: "Final phase of 11-floor building contract."
      }
    ],
    [
      {
        id: "comm-2",
        date: "2026-07-24T14:15:00Z",
        channel: "WhatsApp",
        recipient: "9876500002 (Anil Mehta)",
        subject: "Phase 1 Dispatched - Green Valley Apartments",
        message: "Dear Anil Mehta, We are pleased to inform you that Phase 1 (1st & 2nd Floor - 48 units) has been dispatched to Green Valley Apartments site. Team Vikram Pawar has mobilized for fixing. Target completion for Phase 1: 25 Aug 2026."
      }
    ]
  ),
  P(
    "proj-3", "P-2003", "lead-3", "q-3", "2026-06-02", "Completed", "emp-5", "Suresh Patil",
    "SP/WO/2026/019", "2026-06-01", "2026-07-15", "Project Completed",
    [
      { stageName: "Advance Received", targetDate: "2026-06-02", completedDate: "2026-06-02", status: "Completed", supervisorId: "emp-4", notes: "100% payment settled." },
      { stageName: "Measurement Taken", targetDate: "2026-06-06", completedDate: "2026-06-05", status: "Completed", supervisorId: "emp-5", notes: "Site verified." },
      { stageName: "Production Started", targetDate: "2026-06-15", completedDate: "2026-06-12", status: "Completed", supervisorId: "emp-3", notes: "Fabricated." },
      { stageName: "Material Dispatched", targetDate: "2026-06-25", completedDate: "2026-06-22", status: "Completed", supervisorId: "emp-5", notes: "Delivered to Kothrud site." },
      { stageName: "Installation", targetDate: "2026-07-05", completedDate: "2026-07-02", status: "Completed", supervisorId: "emp-5", notes: "Installation & silicon completed." },
      { stageName: "Project Completed", targetDate: "2026-07-15", completedDate: "2026-07-10", status: "Completed", supervisorId: "emp-5", notes: "Site handed over to Suresh Patil with warranty certificate." },
    ],
    [
      {
        id: "ph-2003-1",
        name: "Full Bungalow Window Package",
        scope: "Casement & Fixed Windows (Entire Bungalow)",
        targetDate: "2026-07-10",
        activeStage: "Project Completed",
        civilReadiness: "100% Ready",
        measurementStatus: "Completed",
        productionStatus: "Completed",
        dispatchStatus: "Completed",
        installationStatus: "Completed",
        unitsCount: 14,
        notes: "Handed over with 10-year uPVC warranty."
      }
    ]
  ),
  P(
    "proj-4", "P-2004", "lead-4", "q-4", "2026-08-10", "In Progress", "emp-3", "Facility manager",
    "OIP/WO/2026/077", "2026-08-08", "2026-09-30", "Production Started",
    [
      { stageName: "Advance Received", targetDate: "2026-08-10", completedDate: "2026-08-10", status: "Completed", supervisorId: "emp-4", notes: "50% advance billed under SKY/INV/0007." },
      { stageName: "Measurement Taken", targetDate: "2026-08-15", completedDate: "2026-08-14", status: "Completed", supervisorId: "emp-3", notes: "Office facade openings measured." },
      { stageName: "Production Started", targetDate: "2026-08-25", completedDate: "2026-08-22", status: "In Progress", supervisorId: "emp-3", notes: "Commercial heavy-duty profile extrusion cut." },
      { stageName: "Material Dispatched", targetDate: "2026-09-10", completedDate: "", status: "Pending", supervisorId: "emp-5", notes: "" },
      { stageName: "Installation", targetDate: "2026-09-22", completedDate: "", status: "Pending", supervisorId: "emp-5", notes: "" },
      { stageName: "Project Completed", targetDate: "2026-09-30", completedDate: "", status: "Pending", supervisorId: "emp-3", notes: "" },
    ],
    [
      {
        id: "ph-2004-1",
        name: "Phase 1: Ground Floor Reception & Conference Hall",
        scope: "Large span Fixed & Sliding Facade (320 sq.ft)",
        targetDate: "2026-09-15",
        activeStage: "Production Started",
        civilReadiness: "Steel framing ready",
        measurementStatus: "Completed",
        productionStatus: "In Progress",
        dispatchStatus: "Scheduled for 05 Sep 2026",
        installationStatus: "Pending",
        unitsCount: 12,
        notes: "Toughened acoustic DGU glass specified."
      }
    ]
  ),
  P(
    "proj-5", "P-2005", "lead-5", "q-5", "2026-08-20", "Manufacturing", "emp-5", "Manoj Desai",
    "MD/WO/2026/054", "2026-08-18", "2026-10-15", "Production Started",
    [
      { stageName: "Advance Received", targetDate: "2026-08-22", completedDate: "2026-08-22", status: "Completed", supervisorId: "emp-4", notes: "Advance ₹1,50,000 received via CHQ-118822." },
      { stageName: "Measurement Taken", targetDate: "2026-08-28", completedDate: "2026-08-27", status: "Completed", supervisorId: "emp-5", notes: "Living room sliding door threshold verified." },
      { stageName: "Production Started", targetDate: "2026-09-10", completedDate: "2026-09-08", status: "In Progress", supervisorId: "emp-3", notes: "Lift and slide heavy roller mechanism being assembled." },
      { stageName: "Material Dispatched", targetDate: "2026-09-25", completedDate: "", status: "Pending", supervisorId: "emp-5", notes: "" },
      { stageName: "Installation", targetDate: "2026-10-05", completedDate: "", status: "Pending", supervisorId: "emp-5", notes: "" },
      { stageName: "Project Completed", targetDate: "2026-10-15", completedDate: "", status: "Pending", supervisorId: "emp-5", notes: "" },
    ],
    [
      {
        id: "ph-2005-1",
        name: "Phase 1: Premium Living Room Lift & Slide",
        scope: "Heavy 3-Panel Lift & Slide Door with DGU Glass",
        targetDate: "2026-10-10",
        activeStage: "Production Started",
        civilReadiness: "Granite sill completed",
        measurementStatus: "Completed",
        productionStatus: "In Progress",
        dispatchStatus: "Pending",
        installationStatus: "Pending",
        unitsCount: 3,
        notes: "Imported German hardware fitted."
      }
    ]
  ),
  P(
    "proj-6", "P-2006", "lead-6", "q-6", "2026-10-05", "Planning", "emp-3", "Farah Khan",
    "SET/WO/2026/102", "2026-10-02", "2026-11-30", "Measurement Taken",
    [
      { stageName: "Advance Received", targetDate: "2026-10-05", completedDate: "2026-10-05", status: "Completed", supervisorId: "emp-4", notes: "Order confirmed with Purchase Order." },
      { stageName: "Measurement Taken", targetDate: "2026-10-15", completedDate: "2026-10-14", status: "Completed", supervisorId: "emp-3", notes: "18 classroom window openings measured." },
      { stageName: "Production Started", targetDate: "2026-10-25", completedDate: "", status: "Pending", supervisorId: "emp-3", notes: "Awaiting profile shipment from warehouse." },
      { stageName: "Material Dispatched", targetDate: "2026-11-10", completedDate: "", status: "Pending", supervisorId: "emp-5", notes: "" },
      { stageName: "Installation", targetDate: "2026-11-20", completedDate: "", status: "Pending", supervisorId: "emp-5", notes: "" },
      { stageName: "Project Completed", targetDate: "2026-11-30", completedDate: "", status: "Pending", supervisorId: "emp-3", notes: "" },
    ],
    [
      {
        id: "ph-2006-1",
        name: "Phase 1: Ground Floor Classrooms (101 to 108)",
        scope: "16 Sliding 2-Track Windows with Safety Grills",
        targetDate: "2026-11-15",
        activeStage: "Measurement Taken",
        civilReadiness: "Classrooms ready for window fixing",
        measurementStatus: "Completed on 14 Oct 2026",
        productionStatus: "Scheduled for next production cycle",
        dispatchStatus: "Pending",
        installationStatus: "Pending",
        unitsCount: 16,
        notes: "Child safety lock mechanisms to be installed."
      }
    ]
  ),
];
const PM = Object.fromEntries(projects.map((p) => [p.id, p]));

const subtotalOf = (qid) => { const q = QM[qid]; return docTotals(q.items).subtotal; };
const stageItem = (id, qid, pct, label) =>
  it(id, `${label} — ${Math.round(pct * 100)}% against ${QM[qid].number}`, "Other Custom Items", "Not Applicable", "", 1, "Lot", round2(subtotalOf(qid) * pct));

const INV = (id, number, projectId, date, dueDate, stage, items, payments = [], state = "Finalized") => ({
  id, number, projectId, quotationId: PM[projectId]?.quotationId, date, dueDate, stage, reference: "",
  workOrderNo: PM[projectId]?.workOrderNo || "",
  workOrderDate: PM[projectId]?.workOrderDate || "",
  preparedBy: "emp-4", taxTreatment: "CGST_SGST", buyerGstin: "", siteContact: PM[projectId]?.siteContact,
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
  { id: "item-1", code: "PRF-001", name: "Sliding frame profile 60mm", category: "uPVC Profiles", description: "White uPVC 2-track frame, 6m length", unit: "Mtr", stock: 1800, reserved: 400, purchaseRate: 210, reorderLevel: 500 },
  { id: "item-2", code: "PRF-002", name: "Casement sash profile", category: "uPVC Profiles", description: "White uPVC sash, 6m length", unit: "Mtr", stock: 950, reserved: 300, purchaseRate: 230, reorderLevel: 400 },
  { id: "item-3", code: "GLS-005", name: "5mm clear float glass", category: "Glass", description: "Clear float glass sheets", unit: "Sq.ft", stock: 2600, reserved: 900, purchaseRate: 55, reorderLevel: 800 },
  { id: "item-4", code: "GLS-006", name: "6mm toughened glass", category: "Glass", description: "Toughened glass for doors", unit: "Sq.ft", stock: 700, reserved: 450, purchaseRate: 95, reorderLevel: 400 },
  { id: "item-5", code: "STL-001", name: "GI steel reinforcement 1.2mm", category: "Steel Reinforcement", description: "Galvanised steel insert", unit: "Mtr", stock: 1400, reserved: 200, purchaseRate: 70, reorderLevel: 300 },
  { id: "item-6", code: "HDL-010", name: "Multipoint lock set", category: "Hardware and Locks", description: "For French & casement doors", unit: "Set", stock: 35, reserved: 20, purchaseRate: 1800, reorderLevel: 20 },
  { id: "item-7", code: "ROL-003", name: "Tandem roller (sliding)", category: "Rollers", description: "Heavy duty steel bearing roller", unit: "Nos", stock: 420, reserved: 96, purchaseRate: 140, reorderLevel: 150 },
  { id: "item-8", code: "HNG-002", name: "Friction stay hinge 12\"", category: "Hinges", description: "SS 304 friction stay", unit: "Nos", stock: 60, reserved: 10, purchaseRate: 260, reorderLevel: 80 },
  { id: "item-9", code: "HND-004", name: "Espagnolette handle", category: "Handles", description: "White casement handle", unit: "Nos", stock: 210, reserved: 40, purchaseRate: 180, reorderLevel: 60 },
  { id: "item-10", code: "GSK-001", name: "EPDM gasket", category: "Gaskets and Seals", description: "Glazing gasket roll", unit: "Mtr", stock: 3000, reserved: 500, purchaseRate: 14, reorderLevel: 1000 },
  { id: "item-11", code: "FST-008", name: "Frame fixing screws 100mm", category: "Fasteners", description: "With anchor fasteners (box of 100)", unit: "Set", stock: 8, reserved: 8, purchaseRate: 450, reorderLevel: 10 },
  { id: "item-12", code: "INS-002", name: "Silicone sealant (clear)", category: "Installation Materials", description: "300ml cartridge", unit: "Nos", stock: 140, reserved: 30, purchaseRate: 210, reorderLevel: 50 },
];

const movements = [
  { id: "mv-1", itemId: "item-1", date: "2026-10-02", type: "Received", qty: 600, projectId: "", reference: "GRN-221", notes: "Supplier delivery (Fenstech uPVC extrusion lot)", balanceAfter: 1800 },
  { id: "mv-2", itemId: "item-1", date: "2026-10-04", type: "Reserved", qty: 400, projectId: "proj-2", reference: "QT-0002", notes: "Reserved for Green Valley Apartments tower B", balanceAfter: 1800 },
  { id: "mv-3", itemId: "item-3", date: "2026-10-07", type: "Issued", qty: 300, projectId: "proj-1", reference: "ISS-118", notes: "Issued to fabrication shop for Kumar Residence", balanceAfter: 2600 },
  { id: "mv-4", itemId: "item-11", date: "2026-10-15", type: "Adjustment", qty: -2, projectId: "", reference: "AUD-03", notes: "Damaged box write-off during warehouse audit", balanceAfter: 8 },
  { id: "mv-5", itemId: "item-2", date: "2026-10-16", type: "Received", qty: 350, projectId: "", reference: "GRN-229", notes: "Profile batch arrival from Pune depot", balanceAfter: 950 },
  { id: "mv-6", itemId: "item-4", date: "2026-10-18", type: "Issued", qty: 150, projectId: "proj-4", reference: "ISS-124", notes: "Issued for Orion Hinjewadi facade glass", balanceAfter: 700 },
  { id: "mv-7", itemId: "item-6", date: "2026-10-20", type: "Reserved", qty: 20, projectId: "proj-5", reference: "QT-0005", notes: "Reserved for Desai Villa lift & slide doors", balanceAfter: 35 },
  { id: "mv-8", itemId: "item-10", date: "2026-10-22", type: "Received", qty: 1000, projectId: "", reference: "GRN-235", notes: "EPDM glazing rubber gasket roll stock arrival", balanceAfter: 3000 },
  { id: "mv-9", itemId: "item-7", date: "2026-10-23", type: "Issued", qty: 48, projectId: "proj-2", reference: "ISS-130", notes: "Tandem sliding rollers for Tower B windows", balanceAfter: 420 },
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

const receipts = [
  {
    id: "rec-1",
    number: "SKY/REC/2026/0001",
    date: "2026-07-15",
    projectId: "proj-1",
    invoiceId: "inv-1",
    invoiceNumber: "SKY/INV/0001",
    customerName: "Rajesh Kumar",
    companyName: "",
    amount: full(i1),
    method: "Bank Transfer",
    reference: "NEFT-778812",
    notes: "Advance payment received for Kumar Residence",
    status: "Cleared",
  },
  {
    id: "rec-2",
    number: "SKY/REC/2026/0002",
    date: "2026-07-08",
    projectId: "proj-2",
    invoiceId: "inv-3",
    invoiceNumber: "SKY/INV/0003",
    customerName: "Anil Mehta",
    companyName: "Green Valley Developers",
    amount: round2(full(i3) * 0.6),
    method: "Bank Transfer",
    reference: "RTGS-1001",
    notes: "First installment of advance payment for Green Valley Apartments",
    status: "Cleared",
  },
  {
    id: "rec-3",
    number: "SKY/REC/2026/0003",
    date: "2026-07-10",
    projectId: "proj-3",
    invoiceId: "inv-6",
    invoiceNumber: "SKY/INV/0006",
    customerName: "Suresh Patil",
    companyName: "",
    amount: full(i6),
    method: "Bank Transfer",
    reference: "NEFT-90021",
    notes: "Full settlement for Patil Bungalow windows",
    status: "Cleared",
  },
  {
    id: "rec-4",
    number: "SKY/REC/2026/0004",
    date: "2026-07-16",
    projectId: "proj-2",
    invoiceId: "inv-3",
    invoiceNumber: "SKY/INV/0003",
    customerName: "Anil Mehta",
    companyName: "Green Valley Developers",
    amount: round2(full(i3) - round2(full(i3) * 0.6)),
    method: "Cheque",
    reference: "CHQ-004512",
    notes: "Second installment of advance payment",
    status: "Cleared",
  },
  {
    id: "rec-5",
    number: "SKY/REC/2026/0005",
    date: "2026-08-25",
    projectId: "proj-5",
    invoiceId: "inv-8",
    invoiceNumber: "SKY/INV/0008",
    customerName: "Manoj Desai",
    companyName: "",
    amount: 150000,
    method: "Cheque",
    reference: "CHQ-118822",
    notes: "Part advance received for Desai Villa lift & slide systems",
    status: "Cleared",
  },
  {
    id: "rec-6",
    number: "SKY/REC/2026/0006",
    date: "2026-10-18",
    projectId: "proj-1",
    invoiceId: "inv-2",
    invoiceNumber: "SKY/INV/0002",
    customerName: "Rajesh Kumar",
    companyName: "",
    amount: round2(full(i2) / 2),
    method: "UPI",
    reference: "UPI-55123",
    notes: "50% part payment against Progress Billing invoice",
    status: "Cleared",
  },
];

export const seed = { settings, employees, leads, quotations, projects, invoices, inventory, movements, documents, receipts };

