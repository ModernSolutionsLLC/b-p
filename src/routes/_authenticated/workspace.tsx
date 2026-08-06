import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Copy,
  Download,
  LogOut,
  Mail,
  Plus,
  Timer,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { DropZone } from "@/components/DropZone";
import { ProcessingModal } from "@/components/ProcessingModal";
import { ProposalGrid } from "@/components/ProposalGrid";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { buildProposalHtml, openPrintableProposal } from "@/lib/export-proposal";
import {
  PROCESSING_STEPS,
  SAMPLE_PROJECT,
  lineTotal,
  directCost,
  money,
  sampleHvacLineItems,
  type LineItem,
  type Project,
  type ProjectStatus,
} from "@/lib/proposal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/workspace")({
  head: () => ({
    meta: [
      { title: "Estimate Workspace — Bid-Pulse" },
      {
        name: "description",
        content:
          "Build, price and export itemized trade proposals from RFQ documents in the Bid-Pulse workspace.",
      },
      { property: "og:title", content: "Estimate Workspace — Bid-Pulse" },
      {
        property: "og:description",
        content: "Itemized takeoffs with live margin math and one-click proposal export.",
      },
    ],
  }),
  component: Workspace,
});

function Workspace() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(0);
  const [items, setItems] = useState<LineItem[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();
      if (error) throw error;
      if (data) return data;
      const { data: created, error: insertError } = await supabase
        .from("profiles")
        .insert({ user_id: uid })
        .select()
        .single();
      if (insertError) throw insertError;
      return created;
    },
  });

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id,title,client_name,status,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Project[];
    },
  });

  const projects = projectsQuery.data ?? [];
  const activeProject = projects.find((p) => p.id === activeId) ?? null;

  useEffect(() => {
    if (!activeId && projects.length > 0) setActiveId(projects[0]!.id);
  }, [projects, activeId]);

  const itemsQuery = useQuery({
    queryKey: ["line_items", activeId],
    enabled: !!activeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("line_items")
        .select("*")
        .eq("project_id", activeId!)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        ...row,
        quantity: Number(row.quantity),
        unit_cost: Number(row.unit_cost),
        markup: Number(row.markup),
        total_price: Number(row.total_price),
        confidence: Number(row.confidence),
      })) as LineItem[];
    },
  });

  useEffect(() => {
    if (itemsQuery.data) setItems(itemsQuery.data);
  }, [itemsQuery.data]);

  const profile = profileQuery.data;
  const needsOnboarding = !!profile && !profile.onboarded;

  const onboardMutation = useMutation({
    mutationFn: async (values: {
      company_name: string;
      default_hourly_rate: number;
      default_markup: number;
    }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ ...values, onboarded: true })
        .eq("user_id", profile!.user_id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Defaults saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createProject = useMutation({
    mutationFn: async (input: { title: string; client_name: string; status: ProjectStatus }) => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("projects")
        .insert({ ...input, user_id: auth.user!.id })
        .select()
        .single();
      if (error) throw error;
      return data as Project;
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, id) => {
      if (activeId === id) setActiveId(null);
      setItems([]);
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Proposal deleted");
    },
  });

  async function updateProjectFields(id: string, patch: Partial<Project>) {
    const { error } = await supabase.from("projects").update(patch).eq("id", id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["projects"] });
  }

  async function handleNewProposal() {
    const project = await createProject.mutateAsync({
      title: "Untitled Proposal",
      client_name: "",
      status: "draft",
    });
    await qc.invalidateQueries({ queryKey: ["projects"] });
    setActiveId(project.id);
    setItems([]);
  }

  async function handleIngest(sourceName: string) {
    if (!profile) return;
    const rate = Number(profile.default_hourly_rate) || 85;
    const markup = Number(profile.default_markup) || 20;

    let projectId = activeId;
    if (!projectId || (activeProject && items.length > 0)) {
      const project = await createProject.mutateAsync({
        title: SAMPLE_PROJECT.title,
        client_name: SAMPLE_PROJECT.client_name,
        status: "processing",
      });
      projectId = project.id;
      setActiveId(project.id);
    } else {
      await updateProjectFields(projectId, {
        title: SAMPLE_PROJECT.title,
        client_name: SAMPLE_PROJECT.client_name,
        status: "processing",
      });
    }

    setProcessing(true);
    setStep(0);
    timers.current.forEach(clearTimeout);
    timers.current = [1, 2, 3].map((i) =>
      setTimeout(() => setStep(i), i * 900 + Math.random() * 250),
    );

    const drafts = sampleHvacLineItems(markup, rate).map((d, index) => ({
      project_id: projectId!,
      ...d,
      total_price: Math.round(lineTotal(d) * 100) / 100,
      sort_order: index,
    }));

    const { error } = await supabase.from("line_items").insert(drafts);
    if (error) {
      setProcessing(false);
      toast.error(error.message);
      return;
    }

    await updateProjectFields(projectId!, { status: "ready" });
    await qc.invalidateQueries({ queryKey: ["line_items", projectId] });

    timers.current.push(
      setTimeout(() => {
        setProcessing(false);
        toast.success(`Proposal generated from ${sourceName}`);
      }, 3600),
    );
  }

  function editItem(id: string, field: "quantity" | "unit_cost" | "markup", value: number) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  }

  async function commitItem(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const { error } = await supabase
      .from("line_items")
      .update({
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        markup: item.markup,
        total_price: Math.round(lineTotal(item) * 100) / 100,
      })
      .eq("id", id);
    if (error) toast.error(error.message);
  }

  const totals = useMemo(() => {
    const costs = items.reduce((s, i) => s + directCost(i), 0);
    const bid = items.reduce((s, i) => s + lineTotal(i), 0);
    return { costs, bid, margin: bid - costs };
  }, [items]);

  function exportPdf() {
    if (!activeProject || items.length === 0) return;
    const html = buildProposalHtml({
      title: activeProject.title,
      clientName: activeProject.client_name,
      companyName: profile?.company_name ?? "Bid-Pulse",
      items,
    });
    if (openPrintableProposal(html)) {
      toast.success("Proposal opened — use Save as PDF in the print dialog");
    } else {
      toast.error("Allow pop-ups to download the proposal");
    }
  }

  function sendEmail() {
    if (!activeProject) return;
    const body = `Hi ${activeProject.client_name || "there"},%0D%0A%0D%0APlease find our proposal for ${activeProject.title}.%0D%0A%0D%0AFinal bid price: ${money(totals.bid)}%0D%0A%0D%0AView the full itemized proposal: ${shareLink()}%0D%0A%0D%0AThanks,%0D%0A${profile?.company_name ?? "Bid-Pulse"}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(`Proposal — ${activeProject.title}`)}&body=${body}`;
    if (activeProject.status !== "sent") updateProjectFields(activeProject.id, { status: "sent" });
  }

  function shareLink() {
    return `${window.location.origin}/workspace?proposal=${activeId}`;
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareLink());
      toast.success("Shareable proposal link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <OnboardingDialog
        open={needsOnboarding}
        saving={onboardMutation.isPending}
        onSave={(v) => onboardMutation.mutate(v)}
      />
      <ProcessingModal open={processing} steps={PROCESSING_STEPS} activeStep={step} />

      {/* Sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-all lg:flex",
          sidebarOpen ? "w-72" : "w-0 overflow-hidden",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <Activity className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold tracking-[0.18em] uppercase">Bid-Pulse</span>
        </div>
        <div className="p-3">
          <Button className="w-full" onClick={handleNewProposal}>
            <Plus className="h-4 w-4" />
            New Proposal
          </Button>
        </div>
        <div className="px-4 pt-2 pb-1 text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          Recent projects
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          {projects.length === 0 && (
            <p className="px-2 py-3 text-xs text-muted-foreground">
              No proposals yet. Drop an RFQ to get started.
            </p>
          )}
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveId(p.id)}
              className={cn(
                "group w-full rounded-md border border-transparent px-3 py-2 text-left transition-colors hover:bg-sidebar-accent",
                activeId === p.id && "border-sidebar-border bg-sidebar-accent",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="line-clamp-2 text-sm font-medium">{p.title}</span>
                <StatusBadge status={p.status} />
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="truncate text-xs text-muted-foreground">
                  {p.client_name || "No client set"}
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Delete proposal"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteProject.mutate(p.id);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && deleteProject.mutate(p.id)}
                  className="opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-3 text-xs text-muted-foreground">
          <div className="truncate">{profile?.company_name || "Your company"}</div>
          <div className="num mt-0.5">
            ${Number(profile?.default_hourly_rate ?? 85)}/hr · {Number(profile?.default_markup ?? 20)}
            % markup
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </Button>

            <div className="min-w-0 flex-1">
              <Input
                value={activeProject?.title ?? ""}
                placeholder="Project title"
                disabled={!activeProject}
                maxLength={120}
                onChange={(e) =>
                  qc.setQueryData(["projects"], (old: Project[] | undefined) =>
                    (old ?? []).map((p) =>
                      p.id === activeId ? { ...p, title: e.target.value } : p,
                    ),
                  )
                }
                onBlur={(e) =>
                  activeProject && updateProjectFields(activeProject.id, { title: e.target.value })
                }
                className="h-8 border-transparent bg-transparent px-2 text-base font-semibold hover:border-border focus-visible:border-primary"
              />
              <Input
                value={activeProject?.client_name ?? ""}
                placeholder="Client name"
                disabled={!activeProject}
                maxLength={120}
                onChange={(e) =>
                  qc.setQueryData(["projects"], (old: Project[] | undefined) =>
                    (old ?? []).map((p) =>
                      p.id === activeId ? { ...p, client_name: e.target.value } : p,
                    ),
                  )
                }
                onBlur={(e) =>
                  activeProject &&
                  updateProjectFields(activeProject.id, { client_name: e.target.value })
                }
                className="h-7 border-transparent bg-transparent px-2 text-xs text-muted-foreground hover:border-border focus-visible:border-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" disabled={items.length === 0} onClick={exportPdf}>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download Formatted PDF Proposal</span>
                <span className="sm:hidden">PDF</span>
              </Button>
              <Button variant="outline" size="sm" disabled={items.length === 0} onClick={sendEmail}>
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Send via Email</span>
              </Button>
              <Button variant="outline" size="sm" disabled={!activeId} onClick={copyLink}>
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Copy Shareable Link</span>
              </Button>
              <Button size="sm" onClick={handleNewProposal}>
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Proposal</span>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Sign out" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {items.length === 0 ? (
            <DropZone onIngest={handleIngest} disabled={processing || !profile} />
          ) : (
            <div className="space-y-4 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-medium text-success">
                  <Timer className="h-3.5 w-3.5" />
                  Estimated manual time saved: 2 hrs 15 mins
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {activeProject && <StatusBadge status={activeProject.status} />}
                  <span className="num">{items.length} line items</span>
                </div>
              </div>

              <ProposalGrid items={items} onChange={editItem} onCommit={commitItem} />

              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setItems([]);
                    setActiveId(null);
                  }}
                >
                  Start a new takeoff
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
