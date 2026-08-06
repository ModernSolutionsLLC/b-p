import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OnboardingDialog({
  open,
  saving,
  onSave,
}: {
  open: boolean;
  saving: boolean;
  onSave: (values: {
    company_name: string;
    default_hourly_rate: number;
    default_markup: number;
  }) => void;
}) {
  const [company, setCompany] = useState("");
  const [rate, setRate] = useState("85");
  const [markup, setMarkup] = useState("20");

  return (
    <Dialog open={open}>
      <DialogContent
        className="border-border bg-surface [&>button]:hidden sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Set your estimating defaults</DialogTitle>
          <DialogDescription>
            These pre-fill every proposal. You can override any line item later.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              company_name: company.trim().slice(0, 100),
              default_hourly_rate: Math.max(1, Number(rate) || 85),
              default_markup: Math.max(0, Number(markup) || 20),
            });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="company">Company name</Label>
            <Input
              id="company"
              value={company}
              maxLength={100}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Ridgeline Mechanical LLC"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="rate">Default hourly labor rate ($)</Label>
              <Input
                id="rate"
                type="number"
                min={1}
                step="any"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="markup">Default profit markup (%)</Label>
              <Input
                id="markup"
                type="number"
                min={0}
                step="any"
                value={markup}
                onChange={(e) => setMarkup(e.target.value)}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Start estimating
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
