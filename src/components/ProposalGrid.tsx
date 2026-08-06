import { AlertTriangle } from "lucide-react";
import { money, lineTotal, directCost, type LineItem } from "@/lib/proposal";
import { cn } from "@/lib/utils";

type NumericField = "quantity" | "unit_cost" | "markup";

export function ProposalGrid({
  items,
  onChange,
  onCommit,
}: {
  items: LineItem[];
  onChange: (id: string, field: NumericField, value: number) => void;
  onCommit: (id: string) => void;
}) {
  const totalCosts = items.reduce((s, i) => s + directCost(i), 0);
  const totalBid = items.reduce((s, i) => s + lineTotal(i), 0);
  const margin = totalBid - totalCosts;

  return (
    <div className="rounded-lg border border-border bg-surface shadow-panel">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-background/60 text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
              <th className="px-3 py-2.5 text-left font-semibold">Trade</th>
              <th className="px-3 py-2.5 text-left font-semibold">Item description</th>
              <th className="w-24 px-3 py-2.5 text-right font-semibold">Qty</th>
              <th className="w-16 px-3 py-2.5 text-left font-semibold">UoM</th>
              <th className="w-32 px-3 py-2.5 text-right font-semibold">Unit cost</th>
              <th className="w-24 px-3 py-2.5 text-right font-semibold">Markup</th>
              <th className="w-32 px-3 py-2.5 text-right font-semibold">Total price</th>
              <th className="w-32 px-3 py-2.5 text-right font-semibold">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const low = item.confidence < 75;
              return (
                <tr
                  key={item.id}
                  className={cn(
                    "border-b border-border/70 transition-colors last:border-b-0 hover:bg-accent/40",
                    low && "bg-warning/[0.06]",
                  )}
                >
                  <td className="px-3 py-2 text-xs font-medium whitespace-nowrap text-muted-foreground">
                    {item.category}
                  </td>
                  <td className="max-w-[420px] px-3 py-2">{item.description}</td>
                  <td className="px-1 py-1.5">
                    <NumCell
                      value={item.quantity}
                      onChange={(v) => onChange(item.id, "quantity", v)}
                      onCommit={() => onCommit(item.id)}
                    />
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{item.unit}</td>
                  <td className="px-1 py-1.5">
                    <NumCell
                      value={item.unit_cost}
                      prefix="$"
                      onChange={(v) => onChange(item.id, "unit_cost", v)}
                      onCommit={() => onCommit(item.id)}
                    />
                  </td>
                  <td className="px-1 py-1.5">
                    <NumCell
                      value={item.markup}
                      suffix="%"
                      onChange={(v) => onChange(item.id, "markup", v)}
                      onCommit={() => onCommit(item.id)}
                    />
                  </td>
                  <td className="num px-3 py-2 text-right font-semibold text-success">
                    {money(lineTotal(item))}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {low ? (
                      <span className="inline-flex items-center gap-1 rounded border border-warning/40 bg-warning/15 px-1.5 py-0.5 text-[11px] font-semibold text-warning">
                        <AlertTriangle className="h-3 w-3" />
                        {item.confidence}% review
                      </span>
                    ) : (
                      <span className="num text-xs text-muted-foreground">{item.confidence}%</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-border bg-background/50 p-4 sm:flex-row sm:items-end sm:justify-end sm:gap-10">
        <Total label="Total Direct Costs" value={money(totalCosts)} />
        <Total label="Total Estimated Margin" value={money(margin)} tone="success" />
        <Total label="Final Client Bid Price" value={money(totalBid)} tone="primary" large />
      </div>
    </div>
  );
}

function Total({
  label,
  value,
  tone,
  large,
}: {
  label: string;
  value: string;
  tone?: "success" | "primary";
  large?: boolean;
}) {
  return (
    <div className="sm:text-right">
      <div className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </div>
      <div
        className={cn(
          "num font-bold",
          large ? "text-2xl" : "text-lg",
          tone === "success" && "text-success",
          tone === "primary" && "text-primary",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function NumCell({
  value,
  onChange,
  onCommit,
  prefix,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  onCommit: () => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-end gap-0.5 text-right">
      {prefix && <span className="text-xs text-muted-foreground">{prefix}</span>}
      <input
        type="number"
        step="any"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        onBlur={onCommit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        className="cell-input text-right"
      />
      {suffix && <span className="pr-1 text-xs text-muted-foreground">{suffix}</span>}
    </div>
  );
}
