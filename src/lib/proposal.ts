export type LineItemDraft = {
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  markup: number;
  confidence: number;
};

export type LineItem = LineItemDraft & {
  id: string;
  project_id: string;
  total_price: number;
  sort_order: number;
};

export type ProjectStatus = "draft" | "processing" | "ready" | "sent";

export type Project = {
  id: string;
  title: string;
  client_name: string;
  status: ProjectStatus;
  created_at: string;
};

export const lineTotal = (item: {
  quantity: number;
  unit_cost: number;
  markup: number;
}) => item.quantity * item.unit_cost * (1 + item.markup / 100);

export const directCost = (item: { quantity: number; unit_cost: number }) =>
  item.quantity * item.unit_cost;

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

export const PROCESSING_STEPS = [
  "Parsing document structure & trade specifications...",
  "Matching unit costs against pricing matrix...",
  "Applying margin calculation...",
  "Proposal Ready!",
];

export const SAMPLE_PROJECT = {
  title: "Commercial HVAC Retrofit — Building B",
  client_name: "Halverson Property Group",
};

export function sampleHvacLineItems(markup: number, hourlyRate: number): LineItemDraft[] {
  const raw: Array<[string, string, number, string, number, number]> = [
    ["HVAC Equipment", "20-Ton Rooftop Packaged Unit, high-efficiency w/ economizer", 3, "EA", 18450, 97],
    ["HVAC Equipment", "Variable Air Volume (VAV) terminal box w/ hot water reheat", 24, "EA", 1180, 94],
    ["HVAC Equipment", "Inline exhaust fan, 1,200 CFM, belt drive", 6, "EA", 940, 91],
    ["Ductwork", "Galvanized rectangular supply duct, 26 ga., insulated", 2850, "LB", 6.4, 88],
    ["Ductwork", "Spiral round return duct, 14 in. dia.", 620, "LF", 21.5, 86],
    ["Ductwork", "Fire/smoke damper, UL 555, 24 x 18", 14, "EA", 385, 71],
    ["Controls", "DDC controller w/ BACnet integration to existing BAS", 3, "EA", 2650, 68],
    ["Controls", "Duct-mounted CO2 / temperature sensor package", 30, "EA", 214, 89],
    ["Piping", "Type L copper refrigerant line set, brazed", 480, "LF", 27.8, 82],
    ["Piping", "Hydronic reheat piping, 3/4 in., insulated", 740, "LF", 19.2, 79],
    ["Electrical", "Disconnect switch + whip, 60A / 480V, 3-phase", 9, "EA", 465, 93],
    ["Rigging", "Crane rigging & rooftop set, 4-hour minimum", 2, "DAY", 3200, 74],
    ["Labor", "Sheet metal journeyman installation labor", 460, "HR", hourlyRate, 96],
    ["Labor", "Controls technician commissioning & balancing", 96, "HR", hourlyRate * 1.15, 84],
    ["General", "Testing, air balancing report & O&M closeout documents", 1, "LS", 4850, 90],
  ];

  return raw.map(([category, description, quantity, unit, unit_cost, confidence]) => ({
    category,
    description,
    quantity,
    unit,
    unit_cost: Math.round(unit_cost * 100) / 100,
    markup,
    confidence,
  }));
}

export const SAMPLE_SCOPE_TEXT = `SECTION 23 00 00 — HVAC
Furnish and install (3) 20-ton high-efficiency rooftop packaged units with integral
economizers, (24) VAV terminal boxes with hot water reheat, associated galvanized and
spiral ductwork, DDC controls tied to the existing BAS, refrigerant and hydronic piping,
electrical disconnects, crane rigging, and full test-and-balance closeout documentation.`;
