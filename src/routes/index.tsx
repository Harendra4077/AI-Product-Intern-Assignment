import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarCheck, CalendarPlus, CheckCircle2, Clock, Droplets, Salad } from "lucide-react";
import { toast } from "sonner";
import { ClientShell } from "@/components/ClientShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apptDateTime, formatDateLong, formatTime, normalizePhone } from "@/lib/appointments";
import { updateAppointment, useAppointments, useMe, useNow } from "@/lib/appointments-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nourish — Your next nutrition consultation" },
      { name: "description", content: "See your next consultation, confirm you're coming, or book a new one." },
      { property: "og:title", content: "Nourish — Your next nutrition consultation" },
      { property: "og:description", content: "See your next consultation, confirm you're coming, or book a new one." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function greeting(now: Date) {
  const h = now.getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

function Home() {
  const { me, setMe, ready } = useMe();
  const { data = [] } = useAppointments();
  const now = useNow();
  const [phoneInput, setPhoneInput] = useState("");

  const mine = me ? data.filter((a) => a.phone === me.phone) : [];
  const next = mine
    .filter((a) => a.status === "booked" && apptDateTime(a) > now)
    .sort((a, b) => +apptDateTime(a) - +apptDateTime(b))[0];
  const hoursAway = next ? (+apptDateTime(next) - +now) / 36e5 : 0;

  const findMe = () => {
    const p = normalizePhone(phoneInput);
    if (!p) { toast.error("Enter a 10-digit mobile number"); return; }
    const match = data.find((a) => a.phone === p);
    if (!match) { toast.error("No bookings found for that number yet"); return; }
    setMe({ name: match.client_name, phone: p });
  };

  const confirm = async () => {
    if (!next) return;
    await updateAppointment(next.id, { confirmed_at: new Date().toISOString() });
    toast.success("Thanks! Your nutritionist knows you're coming.");
  };

  return (
    <ClientShell>
      <p className="text-sm text-muted-foreground">{greeting(now)}{me ? "," : ""}</p>
      <h1 className="mt-1 text-4xl font-semibold">{me ? me.name.split(" ")[0] : "Welcome"} 🌿</h1>

      {ready && me && next && (
        <section className="mt-6 overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-lg">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Your next consultation</p>
          <h2 className="mt-3 text-3xl font-semibold">{formatDateLong(next.appt_date)}</h2>
          <p className="mt-1 flex items-center gap-2 text-lg opacity-90">
            <Clock className="size-4" /> {formatTime(next.appt_time)} · 30 min
          </p>
          <div className="mt-6 rounded-2xl bg-primary-foreground/10 p-4">
            {next.confirmed_at ? (
              <p className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="size-5" /> You've confirmed — see you then!
              </p>
            ) : (
              <>
                <p className="text-sm opacity-90">
                  {hoursAway < 48 ? "It's coming up soon. " : ""}Let your nutritionist know you'll be there — or move it if plans changed.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={confirm} variant="secondary" className="rounded-full">
                    <CalendarCheck /> I'll be there
                  </Button>
                  <Button asChild variant="ghost" className="rounded-full hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    <Link to="/book" search={{ reschedule: next.id }}>Reschedule</Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {ready && (!me || !next) && (
        <section className="mt-6 rounded-3xl border bg-card p-6">
          <h2 className="text-2xl font-semibold">{me ? "Nothing booked right now" : "Ready for your next step?"}</h2>
          <p className="mt-2 text-muted-foreground">Pick a time that suits you — it takes under a minute.</p>
          <Button asChild size="lg" className="mt-5 rounded-full">
            <Link to="/book"><CalendarPlus /> Book a consultation</Link>
          </Button>
        </section>
      )}

      {ready && !me && (
        <section className="mt-4 rounded-3xl bg-muted p-6">
          <h3 className="text-lg font-semibold">Already booked?</h3>
          <p className="mt-1 text-sm text-muted-foreground">Enter your mobile number to see your appointments.</p>
          <div className="mt-3 flex gap-2">
            <Input value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} placeholder="98200 11111" inputMode="tel" className="rounded-full bg-card" />
            <Button onClick={findMe} variant="outline" className="rounded-full">Find me</Button>
          </div>
        </section>
      )}

      <section className="mt-8 grid gap-3 sm:grid-cols-2">
        <Tip icon={Droplets} title="Hydrate first" body="A glass of water before each meal helps you notice real hunger." />
        <Tip icon={Salad} title="Half a plate of colour" body="Fill half your plate with vegetables — simple and it adds up." />
      </section>

      {me && (
        <p className="mt-10 text-center text-xs text-muted-foreground">
          Not {me.name}? <button className="underline" onClick={() => setMe(null)}>Switch</button>
        </p>
      )}
    </ClientShell>
  );
}

function Tip({ icon: Icon, title, body }: { icon: typeof Droplets; title: string; body: string }) {
  return (
    <div className="rounded-3xl border bg-card p-5">
      <span className="grid size-10 place-items-center rounded-2xl bg-accent text-accent-foreground"><Icon className="size-5" /></span>
      <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
