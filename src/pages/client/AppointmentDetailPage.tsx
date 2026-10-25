import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Phone,
  User,
  Bell,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { StatusBadge, ConfirmationBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/Dialog';
import { RescheduleDialog } from '../../components/appointments/RescheduleDialog';
import { ErrorState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { useToast } from '../../components/ui/Toast';
import { getAppointmentById, cancelAppointment, confirmAttendance } from '../../services/appointments';
import { formatDateLong, formatTime, formatPhone, getTimeUntilAppointment } from '../../lib/utils';

export function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const qc = useQueryClient();
  const [showCancel, setShowCancel] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);

  const { data: appointment, isLoading, error } = useQuery({
    queryKey: ['appointment', id],
    queryFn: () => getAppointmentById(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelAppointment(id!),
    onSuccess: () => {
      success('Appointment cancelled.');
      qc.invalidateQueries({ queryKey: ['appointment', id] });
      qc.invalidateQueries({ queryKey: ['appointments'] });
      navigate('/client/appointments');
    },
    onError: (err: Error) => toastError(err.message),
  });

  const confirmMutation = useMutation({
    mutationFn: () => confirmAttendance(id!),
    onSuccess: () => {
      success("Confirmed! We'll see you there 🌿");
      qc.invalidateQueries({ queryKey: ['appointment', id] });
    },
    onError: (err: Error) => toastError(err.message),
  });

  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  if (isLoading || !appointment) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  const isUpcoming = appointment.status === 'booked';
  const timeUntil = isUpcoming
    ? getTimeUntilAppointment(appointment.appointment_date, appointment.start_time)
    : null;

  return (
    <div className="animate-fade-in space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-semibold text-[#788078] hover:text-[#26352E] transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Back
      </button>

      <h1 className="text-xl font-bold text-[#26352E]">Appointment details</h1>

      {/* Status card */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <StatusBadge status={appointment.status} />
          <ConfirmationBadge confirmation={appointment.attendance_confirmation} />
        </div>

        {timeUntil && (
          <div className="flex items-center gap-2 p-3 bg-[#E7EDE4] rounded-xl">
            <Bell size={16} className="text-[#718B73]" aria-hidden="true" />
            <p className="text-sm font-semibold text-[#354B3C]">{timeUntil}</p>
          </div>
        )}

        <div className="space-y-3">
          <InfoRow icon={Calendar} label="Date" value={formatDateLong(appointment.appointment_date)} />
          <InfoRow icon={Clock} label="Time" value={formatTime(appointment.start_time)} />
          <InfoRow
            icon={User}
            label="Client"
            value={appointment.clients?.full_name ?? 'Unknown'}
          />
          {appointment.clients?.phone && (
            <InfoRow
              icon={Phone}
              label="Phone"
              value={formatPhone(appointment.clients.phone)}
            />
          )}
        </div>
      </div>

      {/* Nutritionist card */}
      <div className="card p-5">
        <p className="text-xs font-bold text-[#788078] uppercase tracking-wider mb-3">
          Your Nutritionist
        </p>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#E7EDE4] flex items-center justify-center">
            <span className="text-base font-bold text-[#354B3C]">PS</span>
          </div>
          <div>
            <p className="font-bold text-[#26352E]">
              {appointment.nutritionists?.full_name ?? 'Dr. Priya Sharma'}
            </p>
            <p className="text-sm text-[#788078]">Certified Nutritionist</p>
          </div>
        </div>
      </div>

      {/* Attendance confirmation */}
      {isUpcoming && appointment.attendance_confirmation === 'pending' && (
        <div className="card p-5 border-amber-200 bg-[#FFFBEB] animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-[#C38C43] flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-[#26352E]">Are you still able to make it?</p>
              <p className="text-xs text-[#788078] mt-1 mb-3">
                Confirming helps your nutritionist prepare for you.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => confirmMutation.mutate()}
                  loading={confirmMutation.isPending}
                  className="flex-1"
                >
                  <CheckCircle2 size={14} aria-hidden="true" />
                  Yes, I'll be there
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowReschedule(true)}
                  className="flex-1"
                >
                  Reschedule
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isUpcoming && appointment.attendance_confirmation === 'confirmed' && (
        <div className="card p-4 border-emerald-200 bg-[#ECFDF5] animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#065F46]" aria-hidden="true" />
            <p className="text-sm font-semibold text-[#065F46]">
              You've confirmed your attendance
            </p>
          </div>
        </div>
      )}

      {/* Notes */}
      {appointment.notes && (
        <div className="card p-5">
          <p className="text-xs font-bold text-[#788078] uppercase tracking-wider mb-2">Notes</p>
          <p className="text-sm text-[#26352E]">{appointment.notes}</p>
        </div>
      )}

      {/* Actions */}
      {isUpcoming && (
        <div className="flex gap-3 pb-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowReschedule(true)}
            className="flex-1"
          >
            Reschedule
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={() => setShowCancel(true)}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Dialogs */}
      <ConfirmDialog
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={() => cancelMutation.mutate()}
        title="Cancel this appointment?"
        description="This action will cancel your consultation and release the time slot."
        confirmLabel="Yes, cancel it"
        loading={cancelMutation.isPending}
      />

      {showReschedule && (
        <RescheduleDialog
          open={showReschedule}
          onClose={() => setShowReschedule(false)}
          appointment={appointment}
        />
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#F8F7F2] flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-[#718B73]" aria-hidden="true" />
      </div>
      <div>
        <p className="text-xs text-[#788078] font-medium">{label}</p>
        <p className="text-sm font-semibold text-[#26352E] mt-0.5">{value}</p>
      </div>
    </div>
  );
}
