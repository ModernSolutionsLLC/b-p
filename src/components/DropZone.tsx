import { useRef, useState } from "react";
import { FileUp, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { SAMPLE_SCOPE_TEXT } from "@/lib/proposal";

export function DropZone({
  onIngest,
  disabled,
}: {
  onIngest: (source: string) => void;
  disabled?: boolean;
}) {
  const [dragging, setDragging] = useState(false);
  const [scope, setScope] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-16">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          onIngest(file ? file.name : "Dropped work scope");
        }}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface/60 px-6 py-14 text-center transition-colors",
          dragging && "border-primary bg-primary/10",
        )}
      >
        <div className="grid-backdrop pointer-events-none absolute inset-0 rounded-xl opacity-30" />
        <div className="relative flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background">
            <FileUp className="h-5 w-5 text-primary" />
          </div>
          <h2 className="mt-5 text-lg font-semibold">
            Drag &amp; drop your RFQ PDF or Work Scope text here
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Bid-Pulse reads spec sections, builds an itemized takeoff and applies your default
            labor rate and markup.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="outline" disabled={disabled} onClick={() => inputRef.current?.click()}>
              <FileText className="h-4 w-4" />
              Browse files
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onIngest(file.name);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-primary/40 bg-primary/10 p-5 shadow-glow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              No file handy? Run the live demo.
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Loads a 15-line commercial HVAC retrofit RFQ with real unit costs.
            </p>
          </div>
          <Button
            size="lg"
            disabled={disabled}
            onClick={() => onIngest("Sample_Commercial_HVAC_RFQ.pdf")}
          >
            Test with Sample Commercial HVAC RFQ
          </Button>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold">Or paste a work scope</h3>
        <Textarea
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          placeholder={SAMPLE_SCOPE_TEXT}
          rows={5}
          className="mt-3 resize-none bg-background font-mono text-xs"
        />
        <div className="mt-3 flex justify-end">
          <Button
            variant="secondary"
            disabled={disabled || scope.trim().length < 20}
            onClick={() => onIngest("Pasted work scope")}
          >
            Generate proposal from text
          </Button>
        </div>
      </div>
    </div>
  );
}
