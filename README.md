# Bid-Pulse

Build a modern, high-conversion B2B micro-SaaS application called "Bid-Pulse". 

Bid-Pulse is a specialized tool for trade contractors (electrical, HVAC, plumbing, drywall) that automatically converts complex RFQ/Spec PDFs and job descriptions into itemized, professional price proposals.

### STYLING & DESIGN SYSTEM

- Theme: High-contrast, clean, industrial utilitarian aesthetic. Dark mode primary (Slate-900 background) with high-visibility accent colors (Amber-500/Emerald-500).

- Clean typography (Inter or Sans-Serif font family) with high readability, compact data grids, and crisp borders.

- Inspired by modern, fast developer and enterprise tools (e.g., Linear, Vercel).

### CORE FEATURES & USER FLOW

1. AUTHENTICATION & ONBOARDING:

   - Implement Supabase Auth (Email + Password sign-up and sign-in).

   - Upon first login, prompt the user for their Default Hourly Labor Rate ($85/hr default) and Default Profit Markup Percentage (20% default).

2. DASHBOARD / ESTIMATE WORKSPACE:

   - Header with Project Title, Client Name, and "New Proposal" button.

   - Left Sidebar: List of recent projects and status badges ("Draft", "Processing", "Ready", "Sent").

   - Main View: A clean Document Drop Zone.

3. DOCUMENT INGESTION & DEMO TRIGGER:

   - Drop Zone: "Drag & drop your RFQ PDF or Work Scope text here".

   - Include a high-visibility button: "Test with Sample Commercial HVAC RFQ" so users can immediately demo the functionality without uploading a file.

4. REAL-TIME AI PROCESSING SIMULATION / SSE BAR:

   - When a document is dropped or the demo button is clicked, show a real-time progress modal with steps:

     * Step 1: "Parsing document structure & trade specifications..."

     * Step 2: "Matching unit costs against pricing matrix..."

     * Step 3: "Applying 20% margin calculation..."

     * Step 4: "Proposal Ready!"

5. PROPOSAL REVIEW GRID (THE CORE WORKING INTERFACE):

   - Display a structured data table containing the extracted line items:

     Columns: [Category/Trade | Item Description | Quantity | Unit of Measure | Unit Cost ($) | Markup (%) | Total Price ($) | AI Confidence Score]

   - Allow inline editing of Quantity, Unit Cost, and Markup Percentage. 

   - Calculate totals dynamically at the bottom:

     * Total Direct Costs

     * Total Estimated Margin ($)

     * Final Client Bid Price ($)

   - Highlight any item with an AI Confidence Score < 75% with a subtle yellow warning badge.

6. PROPOSAL EXPORT & ACTION BAR:

   - Top right actions: 

     * "Download Formatted PDF Proposal"

     * "Send via Email"

     * "Copy Shareable Proposal Link"

   - Display a subtle ROI Badge at the top of the grid: "Estimated manual time saved: 2 hrs 15 mins."

7. DATABASE SCHEMA (SUPABASE INTEGRATION):

   - Set up tables for:

     * `profiles`: user_id, company_name, default_hourly_rate, default_markup.

     * `projects`: id, user_id, title, client_name, status, created_at.

     * `line_items`: id, project_id, category, description, quantity, unit, unit_cost, markup, total_price, confidence.

Build this as a fully functional, highly responsive React web application with interactive state so I can edit quantities, recalculate margins on the fly, and view the generated proposal.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://b-p.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cb48841f-0c7f-4bea-a6e7-df18126e4506).

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
