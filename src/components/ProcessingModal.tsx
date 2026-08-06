import { Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ProcessingModal({
  open,
  steps,
  activeStep,
}: {
  open: boolean;
  steps: string[];
  activeStep: number;
}) {
  const pct = Math.min(100, Math.round(((activeStep + 1) / steps.length) * 100));

  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="border-border bg-surface sm:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-base">Generating your proposal</DialogTitle>
        </DialogHeader>

        <Progress value={pct} className="h-1.5" />

        <ul className="mt-2 space-y-3">
          {steps.map((step, i) => {
            const done = i < activeStep;
            const active = i === activeStep;
            return (
              <li
                key={step}
                className={cn(
                  "flex items-start gap-3 text-sm transition-opacity",
                  done && "text-success",
                  active && "text-foreground",
                  !done && !active && "text-muted-foreground opacity-50",
                )}
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                  {done ? (
                    <Check className="h-4 w-4" />
                  ) : active ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </span>
                <span className="num">{step}</span>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
