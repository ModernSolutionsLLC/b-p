import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, FileSpreadsheet, Gauge, ShieldCheck, Timer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bid-Pulse — Turn RFQ PDFs Into Priced Trade Proposals" },
      {
        name: "description",
        content:
          "Bid-Pulse converts RFQ specs and work scopes into itemized, marked-up proposals for electrical, HVAC, plumbing and drywall contractors.",
      },
      { property: "og:title", content: "Bid-Pulse — Turn RFQ PDFs Into Priced Trade Proposals" },
      {
        property: "og:description",
        content: "Itemized takeoffs, live margin math, and client-ready proposals in minutes.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: FileSpreadsheet,
    title: "Spec-to-line-item extraction",
    body: "Drop an RFQ PDF or paste a work scope. Every trade section becomes a priced, editable row.",
  },
  {
    icon: Gauge,
    title: "Live margin engine",
    body: "Change a quantity, unit cost, or markup and direct costs, margin and bid price recalculate instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Confidence flags",
    body: "Anything the parser is under 75% sure about gets flagged so you review before it ships.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="text-sm font-bold tracking-[0.18em] uppercase">Bid-Pulse</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth" search={{ mode: "signup" }}>
                Start free
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border">
          <div className="grid-backdrop pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Built for electrical, HVAC, plumbing & drywall crews
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-6xl">
              Bid the job in minutes,
              <span className="block text-primary">not Saturday night.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              Bid-Pulse reads your RFQ specs and work scopes, builds an itemized takeoff with unit
              costs and markup, and hands you a client-ready proposal you can still edit line by
              line.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Create your account
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">Sign in to workspace</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm text-success">
              <Timer className="h-4 w-4" />
              Average manual time saved per bid: 2 hrs 15 mins
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-border bg-surface p-5 shadow-panel"
              >
                <f.icon className="h-5 w-5 text-primary" />
                <h2 className="mt-4 text-base font-semibold">{f.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-4 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} Bid-Pulse. Estimating software for trade contractors.
        </div>
      </footer>
    </div>
  );
}
