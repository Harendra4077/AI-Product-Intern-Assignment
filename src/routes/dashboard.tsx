import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, Leaf, MessageCircle, Plus } from "lucide-react";
import { StatusBadge, STATUS_CLASS } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  SLOTS, STATUS_LABEL, DASHBOARD_STATUSES, apptDateTime, availableSlots, formatDateLong, formatPhone, formatTime,
  noShowCount, normalizePhone, toISODate, whatsappReminderLink, type Appointment, type Status,
} from "@/lib/appointments";
import { createAppointment, updateAppointment, useAppointments, useNow } from "@/lib/appointments-api";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Practice dashboard — Nourish" },
      { name: "description", content: "Every consultation, status and reminder in one place." },
      { property: "og:title", content: "Practice dashboard — Nourish" },
      { property: "og:description", content: "Every consultation, status and reminder in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data = [], isLoading } = useAppointments();
  const now = useNow();
  const [todayOnly, setTodayOnly] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const today = toISODate(now);

  const rows = data
    .filter((a) => (todayOnly ? a.appt_date === today : true))
    .filter((a) => (showCancelled ? true : a.status !== "cancelled"))
    .sort((a, b) => +apptDateTime(b) - +apptDateTime(a));

  const todays = data.filter((a) => a.appt_date === today && a.status !== "cancelled");
  const unconfirmed = data.filter((a) => a.status === "booked" && apptDateTime(a) > now && !a.confirmed_at);
  const finished = data.filter((a) => a.status === "done" || a.status === "no_show");
  const rate = finished.length ? Math.round((100 * finished.filter((a) => a.status === "no_show").length) / finished.length) : 0;

  const setStatus = async (a: Appointment, s: Status) => {
    try {
      await updateAppointment(a.id, { status: s });
      toast.success(`${a.client_name}: ${STATUS_LABEL[s]}`);
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <div className="min-h-screen bg-muted/50">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-2xl bg-primary text-primary-foreground"><Leaf className="size-5" /></span>
            <div>
              <p className="font-display text-lg font-semibold leading-tight">Nourish practice</p>
              <p className="text-xs text-muted-foreground">{formatDateLong(today)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden text-sm text-muted-foreground underline sm:inline">Client app</Link>
            <AddDialog all={data} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Today" value={todays.length} />
          <Stat label="Upcoming, not confirmed" value={unconfirmed.length} tone={unconfirmed.length ? "warn" : undefined} />
          <Stat label="Total booked" value={data.filter((a) => a.status === "booked").length} />
          <Stat label="No-show rate" value={`${rate}%`} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Button variant={todayOnly ? "default" : "outline"} className="rounded-full" onClick={() => setTodayOnly(true)}>Today only</Button>
          <Button variant={!todayOnly ? "default" : "outline"} className="rounded-full" onClick={() => setTodayOnly(false)}>All</Button>
          <label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} /> Show cancelled
          </label>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border bg-card">
          <div className="hidden grid-cols-[1.5fr_1fr_1.4fr_0.8fr_1fr_1.2fr] gap-3 border-b px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
            <span>Client</span><span>Phone</span><span>Date</span><span>Time</span><span>Status</span><span>No-show guard</span>
          </div>
          {isLoading && <p className="p-6 text-muted-foreground">Loading…</p>}
          {!isLoading && rows.length === 0 && <p className="p-6 text-muted-foreground">No appointments {todayOnly ? "today" : "yet"}.</p>}
          {rows.map((a) => {
            const misses = noShowCount(data, a.phone);
            const upcoming = a.status === "booked" && apptDateTime(a) > now;
            const wa = whatsappReminderLink(a, typeof window !== "undefined" ? window.location.origin : "");
            return (
              <div key={a.id} className="grid gap-2 border-b px-5 py-4 last:border-0 md:grid-cols-[1.5fr_1fr_1.4fr_0.8fr_1fr_1.2fr] md:items-center md:gap-3">
                <div>
                  <p className="font-semibold">{a.client_name}</p>
                  {misses > 0 && (
                    <p className="flex items-center gap-1 text-xs text-status-noshow"><AlertTriangle className="size-3" /> {misses} past no-show{misses > 1 ? "s" : ""}</p>
                  )}
                </div>
                <span className={cn("text-sm", !a.phone && "text-muted-foreground italic")}>{a.phone ? formatPhone(a.phone) : "No phone"}</span>
                <span className="text-sm">{formatDateLong(a.appt_date)}</span>
                <span className="text-sm font-medium">{formatTime(a.appt_time)}</span>
                <div>
                    <Select value={a.status} onValueChange={(v) => setStatus(a, v as Status)}>
                      <SelectTrigger className={cn("h-8 w-32 rounded-full border text-xs font-semibold", STATUS_CLASS[a.status])}>
                        {STATUS_LABEL[a.status]}
                      </SelectTrigger>
                      <SelectContent>
                        {DASHBOARD_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}><StatusBadge status={s} /></SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {upcoming && a.confirmed_at && <span className="flex items-center gap-1 text-status-done"><CheckCircle2 className="size-4" /> Confirmed</span>}
                  {upcoming && !a.confirmed_at && (wa ? (
                    <Button asChild size="sm" variant="outline" className="rounded-full">
                      <a href={wa} target="_blank" rel="noreferrer"><MessageCircle /> Send reminder</a>
                    </Button>
                  ) : <span className="text-xs text-muted-foreground">Not confirmed · no phone</span>)}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: "warn" | undefined }) {
  return (
    <div className={cn("rounded-2xl border bg-card p-4", tone === "warn" && "border-status-noshow/40 bg-status-noshow-soft")}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}

function AddDialog({ all }: { all: Appointment[] }) {
  const now = useNow();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(toISODate(now));
  const [time, setTime] = useState("");
  const free = availableSlots(date, all, new Date(0));

  const save = async () => {
    if (name.trim().length < 2) { toast.error("Enter the client's name"); return; }
    if (phone && !normalizePhone(phone)) { toast.error("Phone must be 10 digits (or leave blank)"); return; }
    if (!time) { toast.error("Pick a free time"); return; }
    try {
      await createAppointment({ client_name: name.trim(), phone: normalizePhone(phone), appt_date: date, appt_time: time, source: "dashboard" });
      toast.success("Appointment added");
      setOpen(false); setName(""); setPhone(""); setTime("");
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="rounded-full"><Plus /> Add appointment</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add appointment</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2"><Label>Client name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid gap-2"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98200 11111" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2"><Label>Date</Label><Input type="date" value={date} onChange={(e) => { setDate(e.target.value); setTime(""); }} /></div>
            <div className="grid gap-2">
              <Label>Time</Label>
              <select value={time} onChange={(e) => setTime(e.target.value)} className="h-9 rounded-md border bg-transparent px-3 text-sm">
                <option value="">Choose…</option>
                {SLOTS.map((s) => <option key={s} value={s} disabled={!free.includes(s)}>{formatTime(s)}{free.includes(s) ? "" : " (taken)"}</option>)}
              </select>
            </div>
          </div>
          <Button onClick={save} className="rounded-full">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
