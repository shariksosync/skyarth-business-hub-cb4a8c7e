import { createFileRoute } from "@tanstack/react-router";
// @ts-expect-error plain JavaScript CRM module
import App from "../crm/App.jsx";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SKYARTH CRM — Leads, Quotations & Tax Invoices" },
      { name: "description", content: "Business management for SKYARTH UPVC WINDOWS LLP: leads, quotations, project-wise tax invoices, inventory and employees." },
      { property: "og:title", content: "SKYARTH CRM" },
      { property: "og:description", content: "Leads, quotations, project-wise tax invoices and inventory for SKYARTH uPVC Windows LLP." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: App,
});
