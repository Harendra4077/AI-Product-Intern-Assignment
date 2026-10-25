import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ClientShell } from "@/components/ClientShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { SLOTS, WEEKDAYS, availableSlots, formatDateLong, formatTime, normalizePhone, toISODate } from "@/lib/appointments";
import { createAppointment, updateAppointment, useAppointments, useMe, useNow } from "@/lib/appointments-api";

export const Route = createFileRoute("/book")({
  validateSearch: (s: Record<string, unknown>): { reschedule?: string } =>
    typeof s["reschedule"] === "string" ? { reschedule: s["reschedule"] } : {},
  head: () => ({
    meta: [
      { title: "Book a consultation — Nourish" },
      { name: "description", content: "Pick a day and a free time slot for your nutrition consultation." },
      { property: "og:title", content: "Book a consultation — Nourish" },
      { property: "og:description", content: "Pick a day and a free time slot for your nutrition consultation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Book,
});

function Book() {
  const { reschedule } = Route.useSearch();
  const navigate = useNavigate();
  const { me, setMe } = useMe();
  const { data = [] } = useAppointments();
  const now = useNow();
  const original = reschedule ? data.find((a) => a.id === reschedule) : undefined;

  const days = useMemo(() => {
    const out: Date[] = [];
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    for (let i = 0; i < 14; i++) out.push(new Date(d.getFullYear(), d.getMonth(), d.getDate() + i));
    return out;
  }, [now.toDateString()]);

  const [date, setDate] = useState(toISODate(now));
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (me) { setName(me.name); setPhone(me.phone); }
  }, [me]);

  const free = availableSlots(date, data, now, reschedule);
  useEffect(() => { if (time && !free.includes(time)) setTime(null); }, [free.join(","), time]);

  const submit = async () => {
    if (!time) { toast.error("Choose a time slot"); return; }
    setBusy(true);
    try {
      if (original) {
        await updateAppointment(original.id, { appt_date: date, appt_time: time, confirmed_at: null });
        toast.success(`Moved to ${formatDateLong(date)}, ${formatTime(time)}`);
      } else {
        const p = normalizePhone(phone);
        if (name.trim().length < 2) throw new Error("Please enter your name");
        if (!p) throw new Error("Enter a valid 10-digit mobile number");
        await createAppointment({ client_name: name.trim(), phone: p, appt_date: date, appt_time: time, source: "client" });
        setMe({ name: name.trim(), phone: p });
        toast.success("You're booked! 🌿");
      }
      navigate({ to: "/" });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ClientShell>
      <h1 className="text-3xl font-semibold">{original ? "Pick a new time" : "Book a consultation"}</h1>
      <p className="mt-1 text-muted-foreground">
        {original ? `Currently ${formatDateLong(original.appt_date)} at ${formatTime(original.appt_time)}.` : "30 minutes, in person or on call."}
      </p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Day</h2>
      <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-2">
        {days.map((d) => {
          const iso = toISODate(d);
          const n = availableSlots(iso, data, now, reschedule).length;
          const active = iso === date;
          return (
            <button
              key={iso}
              onClick={() => setDate(iso)}
              disabled={n === 0}
              className={cn(
                "flex min-w-16 flex-col items-center rounded-2xl border px-3 py-3 transition",
                active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/50",
                n === 0 && "opacity-40",
              )}
            >
              <span className="text-xs">{WEEKDAYS[d.getDay()]?.slice(0, 3)}</span>
              <span className="font-display text-2xl font-semibold">{d.getDate()}</span>
              <span className="text-[10px] opacity-75">{n === 0 ? "full" : `${n} free`}</span>
            </button>
          );
        })}
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Time · {formatDateLong(date)}</h2>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {SLOTS.map((s) => {
          const ok = free.includes(s);
          return (
            <button
              key={s}
              disabled={!ok}
              onClick={() => setTime(s)}
              className={cn(
                "rounded-xl border py-2.5 text-sm font-medium transition",
                time === s ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/50",
                !ok && "cursor-not-allowed bg-muted text-muted-foreground line-through opacity-50",
              )}
            >
              {formatTime(s)}
            </button>
          );
        })}
      </div>

      {!original && (
        <div className="mt-8 grid gap-4 rounded-3xl border bg-card p-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Your name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Riya Shah" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Mobile (WhatsApp)</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98200 11111" inputMode="tel" />
          </div>
        </div>
      )}

      <Button onClick={submit} disabled={busy || !time} size="lg" className="mt-6 w-full rounded-full">
        {time ? `${original ? "Move to" : "Book"} ${formatTime(time)}, ${formatDateLong(date)}` : "Choose a time"}
      </Button>
    </ClientShell>
  );
}
