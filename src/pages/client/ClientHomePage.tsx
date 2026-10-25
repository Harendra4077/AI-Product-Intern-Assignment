import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, ArrowRight, Leaf } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { AppointmentCard } from '../../components/appointments/AppointmentCard';
import { AppointmentCardSkeleton } from '../../components/ui/Skeleton';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { RescheduleDialog } from '../../components/appointments/RescheduleDialog';
import { useToast } from '../../components/ui/Toast';
import { getAppointmentsByPhone, cancelAppointment, confirmAttendance } from '../../services/appointments';
import type { AppointmentWithClient } from '../../types';

// Demo: use Riya Shah's phone as the "logged-in" client
const DEMO_PHONE = '9820011111';
const DEMO_NAME = 'Riya';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function ClientHomePage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const qc = useQueryClient();
  const [cancelTarget, setCancelTarget] = useState<AppointmentWithClient | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<AppointmentWithClient | null>(null);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', 'client', DEMO_PHONE],
    queryFn: () => getAppointmentsByPhone(DEMO_PHONE),
    refetchInterval: 30_000,
  });

  const upcoming = appointments.filter(a =>
    a.status === 'booked' &&
    a.appointment_date >= format(new Date(), 'yyyy-MM-dd')
  ).sort((a, b) => {
    if (a.appointment_date !== b.appointment_date) return a.appointment_date.localeCompare(b.appointment_date);
    return a.start_time.localeCompare(b.start_time);
  });

  const recent = appointments.filter(a => a.status !== 'booked').slice(0, 3);
  const next = upcoming[0] ?? null;

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelAppointment(id),
    onSuccess: () => {
      success('Appointment cancelled.');
      qc.invalidateQueries({ queryKey: ['appointments', 'client', DEMO_PHONE] });
      setCancelTarget(null);
    },
    onError: (err: Error) => toastError(err.message),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => confirmAttendance(id),
    onSuccess: () => {
      success("Great! We'll see you there 🌿");
      qc.invalidateQueries({ queryKey: ['appointments', 'client', DEMO_PHONE] });
    },
    onError: (err: Error) => toastError(err.message),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero section */}
      <section className="pt-4">
        <p className="text-sm text-[#788078] font-medium">
          {getGreeting()}, <span className="text-[#26352E] font-bold">{DEMO_NAME}</span> 👋
        </p>
        <h1 className="text-2xl font-bold text-[#26352E] mt-1 leading-tight">
          Your wellness journey,<br />
          <span className="font-serif text-[#354B3C] italic">one step at a time.</span>
        </h1>
        <p className="text-sm text-[#788078] mt-2">
          Small steps today. Healthier habits tomorrow.
        </p>
      </section>

      {/* Next appointment */}
      <section>
        <h2 className="text-sm font-bold text-[#788078] uppercase tracking-wider mb-3">
          Next Consultation
        </h2>
        {isLoading ? (
          <AppointmentCardSkeleton />
        ) : next ? (
          <AppointmentCard
            appointment={next}
            onReschedule={() => setRescheduleTarget(next)}
            onCancel={() => setCancelTarget(next)}
            onConfirm={
              next.attendance_confirmation === 'pending'
                ? () => confirmMutation.mutate(next.id)
                : undefined
            }
          />
        ) : (
          <div className="card p-6 text-center bg-gradient-to-br from-[#E7EDE4] to-[#F0E9DD]">
            <div className="w-12 h-12 rounded-2xl bg-white/70 flex items-center justify-center mx-auto mb-3">
              <Leaf size={22} className="text-[#718B73]" aria-hidden="true" />
            </div>
            <h3 className="font-bold text-[#26352E] mb-1">Your next step starts here.</h3>
            <p className="text-sm text-[#788078] mb-4">
              Book a consultation and begin your wellness journey.
            </p>
            <Button
              onClick={() => navigate('/client/book')}
              variant="primary"
              size="md"
            >
              Book a consultation
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </div>
        )}
      </section>

      {/* Quick booking CTA */}
      {next && (
        <section>
          <button
            onClick={() => navigate('/client/book')}
            className="w-full card p-4 flex items-center justify-between hover:border-[#718B73] transition-colors group"
            aria-label="Book a new consultation"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E7EDE4] flex items-center justify-center">
                <Sparkles size={18} className="text-[#718B73]" aria-hidden="true" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[#26352E]">Book another consultation</p>
                <p className="text-xs text-[#788078]">Schedule a new appointment</p>
              </div>
            </div>
            <ArrowRight
              size={18}
              className="text-[#788078] group-hover:translate-x-1 transition-transform"
              aria-hidden="true"
            />
          </button>
        </section>
      )}

      {/* Upcoming list */}
      {upcoming.length > 1 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#788078] uppercase tracking-wider">
              Upcoming
            </h2>
            <button
              onClick={() => navigate('/client/appointments')}
              className="text-xs text-[#718B73] font-semibold hover:text-[#354B3C] transition-colors"
            >
              See all
            </button>
          </div>
          <div className="space-y-3">
            {upcoming.slice(1).map(apt => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onReschedule={() => setRescheduleTarget(apt)}
                onCancel={() => setCancelTarget(apt)}
                showActions
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent history */}
      {recent.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-[#788078] uppercase tracking-wider mb-3">
            Recent history
          </h2>
          <div className="space-y-2">
            {recent.map(apt => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                showActions={false}
                compact
              />
            ))}
          </div>
        </section>
      )}

      {/* Dialogs */}
      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => cancelTarget && cancelMutation.mutate(cancelTarget.id)}
        title="Cancel appointment?"
        description="This will cancel your consultation and release the time slot. Are you sure?"
        confirmLabel="Yes, cancel"
        loading={cancelMutation.isPending}
      />

      {rescheduleTarget && (
        <RescheduleDialog
          open={!!rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          appointment={rescheduleTarget}
        />
      )}
    </div>
  );
}
