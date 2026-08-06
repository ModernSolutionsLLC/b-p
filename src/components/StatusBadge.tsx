import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/proposal";

const STYLES: Record<ProjectStatus, string> = {
  draft: "border-border-strong bg-muted text-muted-foreground",
  processing: "border-primary/40 bg-primary/15 text-primary",
  ready: "border-success/40 bg-success/15 text-success",
  sent: "border-chart-3/40 bg-chart-3/15 text-chart-3",
};

export function StatusBadge({
  status,
  className,
}: {
  status: ProjectStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
        STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
