import { money, lineTotal, directCost, type LineItem } from "@/lib/proposal";

export function buildProposalHtml(opts: {
  title: string;
  clientName: string;
  companyName: string;
  items: LineItem[];
}) {
  const costs = opts.items.reduce((s, i) => s + directCost(i), 0);
  const bid = opts.items.reduce((s, i) => s + lineTotal(i), 0);
  const rows = opts.items
    .map(
      (i) => `<tr>
        <td>${escapeHtml(i.category)}</td>
        <td>${escapeHtml(i.description)}</td>
        <td class="n">${i.quantity}</td>
        <td>${escapeHtml(i.unit)}</td>
        <td class="n">${money(i.unit_cost)}</td>
        <td class="n">${i.markup}%</td>
        <td class="n b">${money(lineTotal(i))}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(opts.title)} — Proposal</title>
  <style>
    *{box-sizing:border-box}
    body{font-family:Inter,Helvetica,Arial,sans-serif;color:#0f172a;margin:40px;font-size:12px}
    h1{font-size:22px;margin:0 0 4px}
    .muted{color:#64748b}
    .head{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0f172a;padding-bottom:14px;margin-bottom:20px}
    .brand{font-weight:800;letter-spacing:.18em;text-transform:uppercase;font-size:12px}
    table{width:100%;border-collapse:collapse;margin-top:8px}
    th{background:#f1f5f9;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.06em;padding:8px;border-bottom:1px solid #cbd5e1}
    td{padding:8px;border-bottom:1px solid #e2e8f0;vertical-align:top}
    .n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
    .b{font-weight:600}
    .totals{margin-top:24px;margin-left:auto;width:320px}
    .totals div{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #e2e8f0}
    .totals .final{border-bottom:none;border-top:2px solid #0f172a;font-size:16px;font-weight:800;margin-top:4px;padding-top:10px}
    footer{margin-top:36px;font-size:10px;color:#64748b}
    @media print{body{margin:16mm}}
  </style></head><body>
  <div class="head">
    <div>
      <h1>${escapeHtml(opts.title)}</h1>
      <div class="muted">Prepared for ${escapeHtml(opts.clientName || "Client")}</div>
      <div class="muted">${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}</div>
    </div>
    <div style="text-align:right">
      <div class="brand">${escapeHtml(opts.companyName || "Bid-Pulse")}</div>
      <div class="muted">Itemized Price Proposal</div>
    </div>
  </div>
  <table>
    <thead><tr><th>Trade</th><th>Description</th><th class="n">Qty</th><th>UoM</th><th class="n">Unit Cost</th><th class="n">Markup</th><th class="n">Total</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div><span>Total Direct Costs</span><span class="n">${money(costs)}</span></div>
    <div><span>Total Estimated Margin</span><span class="n">${money(bid - costs)}</span></div>
    <div class="final"><span>Final Bid Price</span><span class="n">${money(bid)}</span></div>
  </div>
  <footer>Proposal valid for 30 days. Pricing excludes permits, bonds and unforeseen field conditions unless noted above.</footer>
  </body></html>`;
}

export function openPrintableProposal(html: string) {
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) return false;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 350);
  return true;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
