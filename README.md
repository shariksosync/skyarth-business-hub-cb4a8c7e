# Skyarth Business Hub

copy this repo:
https://github.com/shariksosync/skyarth-business-hub-0f4e3ab2

and complete it just do first tax invoice on priority and rest afterwards 
priority work list will be:
first do tax invoice module fully
then Inventory module fully
then rest

current status:
Your workspace ran out of credits before I could finish. The CRM pages are all written, but one small error in the styling file is stopping the preview from loading properly.

Done:
- Tax Invoices (your priority): The section opens with a list of projects. It shows summary cards for total projects, invoiced, received and outstanding, and you can search and filter. Each project has its own page showing its details and money summary, with a "+ Create New Invoice" button and every invoice for that project listed. A project can have as many invoices as you need.
- Invoice editor: Most details fill in from the project. You can pick a stage or type your own, and add, change or remove line items. It works out CGST + SGST or IGST automatically, rejects duplicate invoice numbers and dates that don't make sense, and lets you save a draft or finalize.
- Invoice details: Shows the A4 tax invoice with print, partial payments (each confirmed first), payment history, reversing a payment, and voiding. An invoice can't be voided once payments are recorded, and finalized invoices can't be edited.
- Invoice register listing all invoices, with links back to each project.
- The other pages: Dashboard, Leads, Quotations, Employees, Inventory and Settings. Settings includes uploading the logo.
- Page titles for the home page.

Not finished:
- The styling error: the styling file has one empty entry left over (named `doc-kv-wide`), so the white-and-black look won't load until it's removed. It's a one-line fix.
- Nothing has been tested yet. I haven't checked any page in the preview or confirmed the totals match.
- The logo: please still upload the SKYARTH logo, either on the Settings page or here in chat.

Once you've added credits, send "continue" and I'll fix the styling first, then test the Tax Invoices flow from start to finish.
The preview still has build errors. Ask me to fix them in a new message.



initial prompt was:

status:
Your workspace ran out of credits partway through, so the CRM isn't working yet. The preview still shows the blank starter page.

Done so far (behind the scenes, nothing you can see yet):
- Demo records: 6 employees, 12 leads, 9 quotations and 6 projects. There are 8 invoices: two projects have several separate invoices, one has a partly paid invoice, one is fully paid, one has an overdue invoice and one has no invoices yet. There are also 12 stock items with some stock history. Project values are worked out from their quotations, so the totals match.
- Calculations: line totals, discounts, tax, CGST + SGST or IGST, grand totals, partial payments, balances, payment status (Unpaid, Partially Paid, Paid, Overdue), project totals, low-stock warnings, invoice numbering and amounts in ₹.
- Shared building blocks: sidebar, top bar with search across all records, quick actions and profile menu, plus pop-up windows, confirmation boxes, sortable tables with paging, form fields, the line-item editor and the A4 quotation and tax invoice layouts.

Not done yet:
- The actual pages: Dashboard, Leads, Quotations, Employees, Inventory, Tax Invoices (project list, project workspace, invoice editor, invoice details, payments, invoice register) and Settings.
- Connecting it all to the home page, the white-and-black styling and print settings, page titles, and a check of the calculations.
- Nothing has been tested.

Two things you should know:
- Technology: this platform uses a fixed setup (TanStack Start, which is built on React, Vite and Tailwind CSS), and it can't be swapped out. I'm writing the CRM itself in plain JavaScript with React's built-in state and no extra libraries, which keeps to the spirit of your brief.
- Logo: no logo file came through with your message. Please upload the SKYARTH logo. Until then the app shows an empty box marked "Company logo — upload in Settings". I won't rebuild the logo from text.

To finish the build, add credits and send "continue", and I'll pick up from here.

initial prompt was:
LOVABLE AI MASTER PROMPT — SKYARTH uPVC WINDOWS LLP CRM

1. Project Overview

Build a professional, functional, responsive CRM and business management web application for SKYARTH uPVC WINDOWS LLP.

The application must follow standard CRM practices, focusing on functionality, operational efficiency, organized records, easy navigation, and reliable business workflows.

Technology restrictions are mandatory:
- React
- Vite
- Tailwind CSS
- JavaScript
- React's built-in state management using `useState`, `useEffect`, and Context API only when needed.

Do not use any other technology or library.

Do not use TypeScript, Next.js, backend frameworks, databases, Supabase, Firebase, external UI component libraries, icon libraries, chart libraries, routing libraries, form libraries, or other third-party libraries. Use native HTML elements, React, Tailwind CSS, and custom CSS/SVG icons where necessary.

Use mock data only. All application features must work on the frontend with simulated data and React state. No database, backend, API integration, or authentication service is required.

2. Company Information

Use the following company details throughout the application wherever appropriate.

- Client Name: SKYARTH
- Legal Business Name: SKYARTH UPVC WINDOWS LLP.
- Address: Office No. 113, Tower B, City Vista, Kharadi, Pune - 411014
- Phone: 9945678901
- Email: support@skyarthupvc.com

Company Description:

“Skyarth uPVC Windows LLP is working in the field of construction materials and architectural fittings. Skyarth uPVC Windows LLP is into the manufacturing, fabrication, and supply of premium unplasticized polyvinyl chloride (uPVC) doors, windows, sliding systems, and customized framing solutions for residential and commercial building projects.”

Website and other contact information should only be displayed if explicitly configured in the application. Do not invent GSTIN, PAN, bank account details, or other statutory company information.

3. Official Logo and Brand Identity

Use the uploaded SKYARTH logo as the official company logo.

The logo contains:
- SKY in deep navy blue.
- ARTH in warm metallic gold.
- “uPVC WINDOWS & DOORS” underneath in navy blue.

Logo rules:
- Use the provided logo image without modifying its artwork, typography, colors, or proportions.
- Do not recreate the logo using text.
- Do not stretch, recolor, distort, or crop it.
- Place the logo in the sidebar header and on quotation and tax invoice documents.
- Keep the logo proportionate and professional.

4. Strict UI and Typography Requirements

The entire application must use a white background with strictly black text everywhere.

This requirement is mandatory and takes priority over typical CRM color conventions.

Global visual rules

- Main background: `#FFFFFF`
- Sidebar background: `#FFFFFF`
- Main content background: `#FFFFFF`
- Cards and panels: `#FFFFFF`
- Input backgrounds: `#FFFFFF`
- Primary text: `#000000`
- Secondary text: `#000000`
- Headings: `#000000`
- Labels: `#000000`
- Placeholder text: `#000000`
- Table text: `#000000`
- Buttons and their labels: black text
- Modal text: black
- Dropdown text: black
- Form validation messages: black
- Invoice and quotation text: black
- All document table headings, totals, notes, and terms: black

Do not use gray text, colored typography, gradient text, or colored text for statuses. Do not use navy or gold text merely to match the logo.

Use the original logo's colors only within the logo artwork. If subtle borders are needed, use a light neutral border such as `#E5E5E5`. All visible text must remain `#000000`.

Use a clean, modern enterprise CRM design with:
- A fixed or collapsible left sidebar.
- A top navigation bar.
- Clear page titles and action buttons.
- White cards with subtle borders.
- Spacious layouts.
- Readable tables.
- Consistent form controls.
- Responsive desktop, tablet, and mobile layouts.
- Clear empty states and confirmation dialogs.

Use a professional sans-serif font through a system font stack. Avoid unnecessary decoration, oversized graphics, and excessive whitespace.

5. Main Application Layout

Create a persistent sidebar with the following navigation:

1. Dashboard
2. Leads
3. Quotations
4. Employees
5. Inventory
6. Tax Invoices
7. Settings

Each navigation item must open its corresponding working page.

Use simple custom inline SVG icons or text-based icons. Do not install any icon library.

The top navigation bar should include:
- Current page title or breadcrumb.
- Global search field.
- Quick action button.
- Current date.
- Company logo or compact brand mark.
- User profile menu with mock profile information.

Keep the interface simple, functional, and easy for office staff to understand.

6. Dashboard Module

Create a useful business dashboard showing mock data for SKYARTH.

Summary cards

Display:
- Total Leads
- Active Leads
- Total Quotations
- Pending Quotations
- Total Projects
- Total Tax Invoices
- Pending Payments
- Total Employees

Every card must be clickable and navigate to the relevant module or filtered record list.

Additional dashboard sections

Recent Leads
- Lead ID
- Customer Name
- Project Name
- Phone
- Lead Status
- Assigned Employee

Recent Quotations
- Quotation Number
- Customer
- Project
- Date
- Total Amount
- Status

Recent Tax Invoices
- Invoice Number
- Project
- Customer
- Invoice Date
- Amount
- Payment Status

Upcoming Follow-ups
- Customer
- Follow-up Date
- Assigned Employee
- Notes

Include simple summaries calculated from the mock records. Do not use chart libraries. If a graphical summary is necessary, create it using CSS or inline SVG.

All displayed numbers must be calculated from the mock data wherever practical rather than being unrelated hardcoded figures.

7. Leads Module

Build a complete lead management system for potential residential and commercial uPVC window and door projects.

Lead list

Display a searchable, sortable, filterable table with:

- Lead ID
- Customer Name
- Company Name
- Phone Number
- Email
- Project Name
- Project Location
- Lead Source
- Assigned Employee
- Estimated Project Value
- Follow-up Date
- Lead Status
- Created Date
- Actions

Lead status options

- New
- Contacted
- Qualified
- Site Visit Scheduled
- Quotation Required
- Negotiation
- Converted
- Lost

Use black text for every status. Use simple borders or neutral outlined labels if needed.

Lead functionality

- Add a new lead.
- View complete lead details.
- Edit an existing lead.
- Delete a lead with confirmation.
- Search by customer name, phone, project, or lead ID.
- Filter by lead status, assigned employee, and date.
- Sort table columns.
- Assign leads to employees.
- Schedule follow-ups.
- Add notes and interaction history.
- Record site visit information.
- Convert a qualified lead into a project.
- Create a quotation from a lead.
- Prevent accidental duplicate creation where practical through frontend validation.

Lead form fields

Customer Name, Company Name, Phone, Email, Billing Address, Project Name, Project Site Address, City, Lead Source, Assigned Employee, Estimated Value, Follow-up Date, Requirements, Notes, and Status.

When converting a lead into a project, preserve the customer information and link the resulting project to the original lead.

8. Quotations Module

Create a professional quotation management module for uPVC windows, doors, sliding systems, and customized framing projects.

Quotation list

Display:
- Quotation Number
- Quotation Date
- Valid Until
- Customer Name
- Project Name
- Project Location
- Assigned Employee
- Subtotal
- Tax Amount
- Grand Total
- Quotation Status
- Actions

Quotation statuses

- Draft
- Sent
- Viewed
- Under Negotiation
- Accepted
- Rejected
- Expired

Create quotation workflow

Allow the user to create a quotation from:
1. A new quotation form.
2. An existing lead.
3. An existing project.

Customer and project details should automatically populate when a quotation is generated from an existing record.

Quotation document fields

Company section
- Official SKYARTH logo.
- SKYARTH UPVC WINDOWS LLP.
- Complete company address.
- Phone and email.

Customer section
- Customer Name.
- Company Name, if applicable.
- Billing Address.
- Project Site Address.
- Phone.
- Email.

Quotation information
- Quotation Number.
- Quotation Date.
- Valid Until.
- Project Name.
- Project ID, if applicable.
- Prepared By.

Dynamic quotation line items

Allow users to add unlimited line items.

Each line item must contain:
- Item Description.
- Product Category.
- Window/Door Type.
- Dimensions, if applicable.
- Quantity.
- Unit.
- Rate.
- Discount, if applicable.
- Tax Rate.
- Taxable Amount.
- Line Total.

Support common product categories such as:
- uPVC Casement Windows
- uPVC Sliding Windows
- Fixed Windows
- French Windows
- uPVC Sliding Doors
- Lift and Slide Doors
- Customized uPVC Doors
- Accessories and Hardware
- Installation and Fabrication
- Other Custom Items

Allow users to add custom descriptions and units.

Automatic calculations

Calculate automatically:
- Quantity × Rate.
- Line-item discount.
- Taxable value.
- Tax amount.
- Subtotal.
- Additional charges, if applicable.
- Grand Total.

Use correct decimal calculations and display amounts consistently in INR (₹).

Tax rates must be configurable mock values. Do not assume that every product or service has the same GST treatment.

Quotation actions

- Save as Draft.
- Edit Quotation.
- Preview Quotation.
- Duplicate Quotation.
- Mark as Sent.
- Mark as Accepted.
- Mark as Rejected.
- Print Quotation.
- Create a project from an accepted quotation.
- Generate a tax invoice associated with the relevant project.
- Search and filter quotations.
- View quotation history.

Quotation document design

Create a professional A4-style print layout on a white background. Every text element in the quotation must be black.

Use thin black or neutral borders, clear column alignment, properly formatted amounts, and a clean totals section.

Hide navigation, buttons, form controls, and other application UI when printing. Use print-specific CSS such as `@media print` and A4 page settings.

Do not use decorative colored text, colored table headers, or gradient backgrounds.

9. Projects and Tax Invoices — Critical Requirement

This is the most important business workflow in the application. Implement it carefully.

The Tax Invoices module must be organized by project first, not by a single flat list of invoices.

One project may require multiple tax invoices over its lifetime. For example, a project may require an advance invoice, a manufacturing-stage invoice, an installation-stage invoice, and a final invoice.

The application must allow the user to create as many invoices as needed for a specific project, without creating duplicate projects for each invoice.

9.1 Project-wise tax invoice landing page

When the user clicks Tax Invoices in the sidebar, display a list of projects.

The page should be titled:

Tax Invoices — Projects

Show a searchable and filterable table containing:

- Project ID
- Project Name
- Customer Name
- Customer Phone
- Project Location
- Project Start Date
- Linked Quotation Number
- Project Value
- Total Invoiced Amount
- Total Amount Paid
- Outstanding Amount
- Number of Invoices
- Project Status
- Actions

Add summary cards:
- Total Projects
- Total Invoiced
- Total Received
- Total Outstanding

The totals must be calculated from the linked mock project and invoice records.

Each project row must have a clear View Invoices action. Clicking the project row should also open that project's invoice workspace.

9.2 Individual project invoice workspace

When the user clicks a project, open a dedicated project detail page.

Display:

Project header
- Project ID
- Project Name
- Customer Name
- Customer Phone
- Customer Email
- Project Site Address
- Billing Address
- Linked Quotation
- Project Value
- Project Status

Financial summary
- Project Contract Value
- Total Invoiced
- Total Paid
- Outstanding Receivables
- Remaining Uninvoiced Contract Value, where applicable

Invoice management section

Title: `Invoices for [Project Name]`

Include a prominent button:

`+ Create New Invoice`

Display every invoice linked to that project in a table with:

- Invoice Number
- Invoice Date
- Invoice Type or Stage
- Due Date
- Subtotal
- Tax Amount
- Grand Total
- Amount Paid
- Balance Due
- Payment Status
- Actions

Actions:
- View Invoice
- Edit Draft
- Record Payment
- Print Invoice
- Duplicate Draft, if needed
- Cancel or Void Invoice, subject to appropriate restrictions

The project workspace must retain all previous invoices. Creating another invoice must add a new record to the same project, not overwrite an existing invoice.

Provide a clear way to return to the project list.

9.3 Create multiple invoices for one project

When the user clicks `+ Create New Invoice`, open an invoice creation page or modal associated with the selected project.

Automatically populate:
- Project ID
- Project Name
- Customer Name
- Customer Phone
- Customer Email
- Billing Address
- Project Site Address
- Linked Quotation, when applicable

The user must be able to create an unlimited number of separate invoices for that project, subject to ordinary business validation.

Examples of invoice stages:
- Advance Payment
- Material Supply
- Manufacturing
- Installation
- Progress Billing
- Final Invoice
- Additional Work

These are suggestions, not rigid restrictions. Also allow a custom invoice stage or type.

Every invoice must have:
- Its own unique invoice ID.
- Its own unique invoice number.
- Its own invoice date.
- Its own due date.
- Its own line items.
- Its own tax calculations.
- Its own payment records.
- Its own payment status.
- A permanent association with the selected project.

Do not automatically combine separate invoices into one invoice. Do not replace older invoices when creating new ones.

9.4 Tax invoice form

Company details
- Official SKYARTH logo.
- SKYARTH UPVC WINDOWS LLP.
- Office No. 113, Tower B, City Vista, Kharadi, Pune - 411014.
- Phone: 9945678901.
- Email: support@skyarthupvc.com.
- GSTIN and other statutory details should be configurable and left blank until supplied.

Invoice details
- Invoice Number.
- Invoice Date.
- Due Date.
- Invoice Stage.
- Project ID.
- Project Name.
- Linked Quotation Number.
- Reference Number, if applicable.
- Prepared By.

Bill To
- Customer or Company Name.
- Billing Address.
- Phone.
- Email.
- GSTIN, if applicable and supplied.

Ship To / Project Site
- Project Name.
- Project Site Address.
- Site Contact, if applicable.

9.5 Dynamic invoice line items

Allow unlimited line items per invoice.

Each line item should contain:
- Description.
- Product/Service Category.
- Quantity.
- Unit.
- Rate.
- Discount, if applicable.
- Taxable Value.
- Applicable Tax Rate.
- Tax Amount.
- Total Amount.

Provide the same uPVC product categories available in the quotation module, while allowing custom items.

The user must be able to add, edit, and remove line items before finalizing an invoice.

9.6 Invoice calculations

Calculate automatically:
- Line-item amount.
- Discount.
- Taxable subtotal.
- Applicable tax.
- Additional charges, if applicable.
- Grand Total.
- Amount Paid.
- Balance Due.

Use INR formatting with two decimal places.

For a project with multiple invoices:

Total Invoiced = Sum of the grand totals of its valid invoices.

Total Paid = Sum of the payments recorded against its invoices.

Outstanding Amount = Sum of each valid invoice's unpaid balance.

Remaining Uninvoiced Contract Value = Project Contract Value minus Total Invoiced, where applicable.

Allow users to configure valid tax rates and whether the applicable tax treatment is CGST + SGST or IGST. Do not hardcode a universal tax treatment or invent the company's GSTIN.

The system must not silently permit accidental duplicate invoices. Validate invoice numbers, required fields, dates, line items, and invoice amounts.

9.7 Payment tracking

Allow multiple partial payments against a single invoice.

For each payment, record:
- Payment ID.
- Payment Date.
- Amount.
- Payment Method.
- Transaction Reference.
- Notes.

Payment methods can include:
- Bank Transfer
- UPI
- Cheque
- Cash
- Other

Calculate the remaining balance automatically.

Payment statuses:
- Unpaid
- Partially Paid
- Paid
- Overdue

An invoice should only be marked Paid when its outstanding balance reaches zero according to the recorded amounts.

Show payment history inside each invoice's details.

9.8 Invoice lifecycle and safeguards

Support:
- Draft
- Finalized
- Partially Paid
- Paid
- Overdue
- Cancelled or Voided, with restrictions

Only drafts should be freely editable. Once finalized, avoid allowing silent changes to issued invoice amounts or invoice numbers. Use a confirmation workflow and appropriate restrictions for cancellation or voiding.

For this mock-data application, demonstrate these safeguards in the frontend.

Use browser printing for a printable invoice document. Include a Print Invoice button and a print-friendly A4 layout.

Every invoice must remain accessible from both:
1. Its project workspace.
2. A global invoice search or invoice register.

9.9 Global invoice register

In addition to the project-wise landing page, provide a secondary option to view all invoices in one searchable register.

Include:
- Invoice Number
- Project
- Customer
- Date
- Grand Total
- Paid Amount
- Balance Due
- Payment Status

The global register must link back to the associated project and invoice details.

The primary workflow, however, must always begin with the project list.

9.10 Mock data scenarios

Seed the application with realistic demo data.

Include at least:
- 6 projects.
- 3 or more customers.
- Multiple quotations.
- At least 2 projects that have multiple separate invoices.
- One project with an advance invoice and a later progress invoice.
- One project with a partially paid invoice.
- One project with a fully paid invoice.
- One project with an outstanding invoice.
- One project with no invoices yet.

Make sure all invoice numbers are unique, all invoices link to valid projects, and the project-level financial summaries agree with the underlying invoice and payment records.

These records are for demonstration only and must not be represented as real company transactions.

10. Employees Module

Build an employee management page.

Employee list

Include:
- Employee ID
- Employee Name
- Designation
- Department
- Phone
- Email
- Joining Date
- Employment Status
- Assigned Leads
- Assigned Projects
- Actions

Employee functionality

- Add employee.
- Edit employee.
- View employee profile.
- Delete employee with confirmation.
- Search and filter.
- Assign leads and projects.
- View assigned work.
- Track follow-up responsibilities.

Employee form fields:
- Employee Name
- Employee ID
- Designation
- Department
- Phone
- Email
- Joining Date
- Address, if required
- Employment Status

Use mock employee data only. Do not implement payroll, biometric attendance, or sensitive employee monitoring unless explicitly requested.

11. Inventory Module

Create an inventory management module suitable for a uPVC doors and windows business.

Inventory list

Display:
- Item Code
- Item Name
- Category
- Description
- Unit
- Available Stock
- Reserved Stock
- Available to Use
- Purchase Rate
- Selling Rate
- Reorder Level
- Stock Status
- Actions

Suggested categories:
- uPVC Profiles
- Glass
- Steel Reinforcement
- Hardware and Locks
- Rollers
- Hinges
- Handles
- Gaskets and Seals
- Fasteners
- Accessories
- Installation Materials
- Other Items

Inventory functionality

- Add inventory item.
- Edit item.
- View item details.
- Update stock quantity.
- Record stock received.
- Record stock issued.
- Record stock adjustments.
- Search, sort, and filter.
- Identify low-stock items.
- Show stock movement history.
- Assign inventory consumption to a project when applicable.

Use mock data and frontend state only.

All stock changes must update the displayed quantity and relevant stock history consistently. Use confirmation dialogs for destructive actions and validation to prevent accidental negative quantities.

Do not introduce purchase order or supplier management as separate major modules.

12. Settings Module

Provide basic frontend settings for:
- Company Information.
- Company Logo.
- Contact Information.
- Tax Configuration.
- Invoice Number Prefix.
- Quotation Number Prefix.
- Default Payment Terms.
- Default Invoice Due Period.
- Currency: INR.
- Employee Assignment Defaults.

Use editable form fields and Save/Cancel actions.

The saved settings should update the application state and relevant document previews.

Do not create backend persistence. Settings changes may be kept in React state for the current session. If useful, explain that refreshing the browser resets mock data unless a simple browser-based persistence mechanism is explicitly implemented using built-in browser APIs.

Do not use a database or external storage service.

13. Global Search, Filters, and Tables

Implement reusable patterns across the application using React components.

Every main listing page should provide:
- Search.
- Filters.
- Sortable column headings.
- Pagination or a manageable page-size selector.
- Row actions.
- Empty states.
- Loading-style placeholders only where useful for the demo.
- Clear validation feedback.
- Responsive behavior.

Global search should search relevant mock records across leads, quotations, employees, projects, and invoices.

Use consistent date and currency formatting throughout the application.

Ensure that filtering, searching, and sorting actually operate on the displayed data. Do not build decorative or non-functional controls.

14. Functional Requirements

This must be a working frontend prototype, not just a visual dashboard.

Implement real interactions for:
- Navigation between modules.
- Opening and closing modals.
- Creating records.
- Editing records.
- Deleting records with confirmation.
- Search and filtering.
- Sorting.
- Dynamic quotation line items.
- Dynamic invoice line items.
- Automatic totals and tax calculations.
- Project creation and lead conversion.
- Quotation-to-project association.
- Project-wise invoice creation.
- Multiple invoices per project.
- Payment recording.
- Payment balance updates.
- Invoice and quotation previews.
- Browser printing.
- Settings changes.
- Form validation.
- Empty states and success/error feedback.

Use controlled React forms and reusable functions for calculations.

Use stable unique IDs for all mock records. Never rely on array indexes as record IDs.

Use confirmation dialogs before destructive or financially significant actions.

All derived financial totals must update when their underlying records change.

Do not display success messages for actions that did not actually complete in the frontend.

15. React and Tailwind CSS Architecture

Use React with Vite and Tailwind CSS only.

Organize the project into clear, maintainable components.

Suggested structure:

- `src/App.jsx`
- `src/main.jsx`
- `src/index.css`
- `src/components/Sidebar.jsx`
- `src/components/Topbar.jsx`
- `src/components/StatCard.jsx`
- `src/components/DataTable.jsx`
- `src/components/Modal.jsx`
- `src/components/FormField.jsx`
- `src/components/ConfirmDialog.jsx`
- `src/components/InvoiceDocument.jsx`
- `src/components/QuotationDocument.jsx`
- `src/pages/Dashboard.jsx`
- `src/pages/Leads.jsx`
- `src/pages/Quotations.jsx`
- `src/pages/Employees.jsx`
- `src/pages/Inventory.jsx`
- `src/pages/TaxInvoices.jsx`
- `src/pages/ProjectInvoiceWorkspace.jsx`
- `src/pages/InvoiceDetails.jsx`
- `src/pages/Settings.jsx`
- `src/data/mockData.js`
- `src/utils/calculations.js`
- `src/utils/formatters.js`

This is a suggested organization, not a requirement to create unnecessary files.

Use conditional rendering and React state for navigation instead of adding a routing library.

Keep data structures and calculation functions separate from the UI where practical.

Use Tailwind utility classes and custom CSS for responsive layouts and print styles.

Do not add dependencies to `package.json` beyond the minimum required React, Vite, and Tailwind CSS setup. Use a Tailwind-compatible configuration appropriate to the project's installed version.

16. Final UI Quality Checklist

Before considering the application complete, verify all of the following:

- The official SKYARTH logo is used without modification.
- The overall interface is white.
- Every visible text element is strictly black.
- There are no gray, navy, gold, blue, green, or red text elements.
- There is no unnecessary use of colored backgrounds.
- Every module is accessible through the sidebar.
- Tables and forms are consistent.
- The application works on desktop and mobile.
- Leads can be created and converted into projects.
- Quotations can be created and printed.
- Projects can exist independently of invoices.
- A single project can contain multiple invoices.
- Creating a second invoice does not overwrite the first.
- Project financial summaries reflect their linked invoices and payments.
- Partial payments are calculated correctly.
- The global invoice register links to the correct project.
- Tax invoices and quotations print as professional A4 documents.
- The invoice and quotation printouts contain only black text.
- Mock records have valid relationships and consistent financial totals.
- All primary buttons and controls perform their advertised actions.
- No database, backend, or external library is introduced.
- The application starts successfully using the Vite development server.

17. Final Instruction to Lovable AI

Build the complete SKYARTH CRM as a functional, modular React + Vite + Tailwind CSS application using mock data only.

Priority 1: Correct business workflows and reliable functionality.

Priority 2: Project-wise tax invoice organization with unlimited separate invoices per project, independent invoice records, partial payments, and accurate financial summaries.

Priority 3: Professional quotation and tax invoice generation with print-ready A4 layouts.

Priority 4: Strict white UI with every visible text element in pure black (`#000000`), including all headings, labels, tables, form controls, quotation documents, and tax invoice documents.

Do not stop after generating the dashboard or a static UI. Complete all six business modules, project-level invoice workflows, calculations, record relationships, mock data, and interactive actions. Keep the code clean and maintainable, and do not introduce any additional technology or third-party library.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/90427089-98b0-4cd6-a393-d0bce8b7f2ce).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
