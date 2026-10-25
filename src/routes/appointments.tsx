import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { ClientShell } from "@/components/ClientShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apptDateTime, formatDateLong, formatTime, type Appointment } from "@/lib/appointments";
import { updateAppointment, useAppointments, useMe, useNow } from "@/lib/appointments-api";

export const Route = createFileRoute("/appointments")({
  head: () => ({
    meta: [
      { title: "My visits — Nourish" },
      { name: "description", content: "Your upcoming and past nutrition consultations." },
      { property: "og:title", content: "My visits — Nourish" },
      { property: "og:description", content: "Your upcoming and past nutrition consultations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyAppointments,
});

function MyAppointments() {
  const { me, ready } = useMe();
  const { data = [] } = useAppointments();
  const now = useNow();
  const mine = me ? data.filter((a) => a.phone === me.phone) : [];
  const upcoming = mine.filter((a) => a.status === "booked" && apptDateTime(a) > now);
  const past = mine
    .filter((a) => !upcoming.includes(a))
    .sort((a, b) => +apptDateTime(b) - +apptDateTime(a));

  if (ready && !me) {
    return (
      <ClientShell>
        <h1 className="text-3xl font-semibold">My visits</h1>
        <p className="mt-2 text-muted-foreground">Book a consultation or find your bookings from the home screen.</p>
        <Button asChild className="mt-5 rounded-full"><Link to="/">Go home</Link></Button>
      </ClientShell>
    );
  }

  return (
    <ClientShell>
      <h1 className="text-3xl font-semibold">My visits</h1>
      <h2 className="mt-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Upcoming</h2>
      <div className="mt-3 grid gap-3">
        {upcoming.length === 0 && (
          <div className="rounded-3xl border border-dashed p-6 text-center text-muted-foreground">
            Nothing coming up. <Link to="/book" className="font-medium text-primary underline">Book one</Link>
          </div>
        )}
        {upcoming.map((a) => <UpcomingCard key={a.id} a={a} />)}
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Past</h2>
      <div className="mt-3 grid gap-2">
        {past.length === 0 && <p className="text-sm text-muted-foreground">No past visits yet.</p>}
        {past.map((a) => (
          <div key={a.id} className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3">
            <div>
              <p className="font-medium">{formatDateLong(a.appt_date)}</p>
              <p className="text-sm text-muted-foreground">{formatTime(a.appt_time)}</p>
            </div>
            <StatusBadge status={a.status === "booked" ? "booked" : a.status} />
          </div>
        ))}
      </div>
    </ClientShell>
  );
}

function UpcomingCard({ a }: { a: Appointment }) {
  const cancel = async () => {
    await updateAppointment(a.id, { status: "cancelled" });
    toast.success("Cancelled — the slot is free for someone else. Thank you!");
  };
  const confirm = async () => {
    await updateAppointment(a.id, { confirmed_at: new Date().toISOString() });
    toast.success("Confirmed. See you then!");
  };
  return (
    <div className="rounded-3xl border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl font-semibold">{formatDateLong(a.appt_date)}</p>
          <p className="text-muted-foreground">{formatTime(a.appt_time)}</p>
        </div>
        {a.confirmed_at ? (
          <span className="flex items-center gap-1 text-sm font-medium text-status-done"><CheckCircle2 className="size-4" /> Confirmed</span>
        ) : (
          <Button size="sm" variant="secondary" className="rounded-full" onClick={confirm}>I'll be there</Button>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link to="/book" search={{ reschedule: a.id }}>Reschedule</Link>
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="rounded-full text-destructive hover:text-destructive">Cancel</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel this consultation?</AlertDialogTitle>
              <AlertDialogDescription>Rather move it? Rescheduling keeps your plan on track.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep it</AlertDialogCancel>
              <AlertDialogAction onClick={cancel}>Yes, cancel</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
