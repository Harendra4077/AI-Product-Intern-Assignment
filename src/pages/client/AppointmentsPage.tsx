import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppointmentCard } from '../../components/appointments/AppointmentCard';
import { AppointmentCardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { RescheduleDialog } from '../../components/appointments/RescheduleDialog';
import { useToast } from '../../components/ui/Toast';
import { getAppointmentsByPhone, cancelAppointment, confirmAttendance } from '../../services/appointments';
import type { AppointmentWithClient } from '../../types';

const DEMO_PHONE = '9820011111';

export function AppointmentsPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const qc = useQueryClient();
  const [cancelTarget, setCancelTarget] = useState<AppointmentWithClient | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<AppointmentWithClient | null>(null);

  const { data: appointments = [], isLoading, error } = useQuery({
    queryKey: ['appointments', 'client', DEMO_PHONE],
    queryFn: () => getAppointmentsByPhone(DEMO_PHONE),
    refetchInterval: 30_000,
  });

  const today = format(new Date(), 'yyyy-MM-dd');

  const upcoming = appointments.filter(
    a => a.status === 'booked' && a.appointment_date >= today
  ).sort((a, b) => {
    if (a.appointment_date !== b.appointment_date) return a.appointment_date.localeCompare(b.appointment_date);
    return a.start_time.localeCompare(b.start_time);
  });

  const past = appointments.filter(
    a => a.status !== 'booked' || a.appointment_date < today
  ).sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));

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

  if (error) {
    return (
      <ErrorState
        description="Could not load appointments. Check your connection and try again."
      />
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#26352E]">My Appointments</h1>
        <p className="text-sm text-[#788078] mt-1">Your consultations, all in one place.</p>
      </div>

      {/* Upcoming */}
      <section>
        <h2 className="text-sm font-bold text-[#788078] uppercase tracking-wider mb-3">
          Upcoming ({upcoming.length})
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <AppointmentCardSkeleton key={i} />)}
          </div>
        ) : upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming appointments"
            description="You don't have any consultations scheduled. Book one to get started."
            action={{ label: 'Book a consultation', onClick: () => navigate('/client/book') }}
          />
        ) : (
          <div className="space-y-3">
            {upcoming.map(apt => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                onReschedule={() => setRescheduleTarget(apt)}
                onCancel={() => setCancelTarget(apt)}
                onConfirm={
                  apt.attendance_confirmation === 'pending'
                    ? () => confirmMutation.mutate(apt.id)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-[#788078] uppercase tracking-wider mb-3">
            Past ({past.length})
          </h2>
          <div className="space-y-3">
            {past.map(apt => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                showActions={false}
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
        description="This will cancel your consultation and release the time slot."
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
