import { Calendar, Clock, ChevronRight, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn, formatDate, formatTime, isAppointmentToday, getTimeUntilAppointment, getInitials } from '../../lib/utils';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import type { AppointmentWithClient } from '../../types';

interface AppointmentCardProps {
  appointment: AppointmentWithClient;
  onReschedule?: () => void;
  onCancel?: () => void;
  onConfirm?: () => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export function AppointmentCard({
  appointment,
  onReschedule,
  onCancel,
  onConfirm,
  showActions = true,
  compact = false,
  className,
}: AppointmentCardProps) {
  const navigate = useNavigate();
  const isUpcoming = appointment.status === 'booked';
  const isToday = isAppointmentToday(appointment.appointment_date);
  const timeUntil = isUpcoming ? getTimeUntilAppointment(appointment.appointment_date, appointment.start_time) : null;
  const initials = getInitials(appointment.nutritionists?.full_name ?? 'Dr');

  return (
    <div
      className={cn(
        'card p-4 animate-fade-in transition-all duration-200',
        isToday && isUpcoming && 'border-[#718B73] shadow-[0_0_0_2px_rgba(113,139,115,0.15)]',
        className
      )}
    >
      {/* Today indicator */}
      {isToday && isUpcoming && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="w-2 h-2 bg-[#718B73] rounded-full animate-pulse-soft" aria-hidden="true" />
          <span className="text-xs font-bold text-[#718B73] uppercase tracking-wide">Today</span>
        </div>
      )}

      <div className={cn('flex items-start gap-3', compact && 'items-center')}>
        {/* Avatar */}
        {!compact && (
          <div className="w-10 h-10 rounded-xl bg-[#E7EDE4] flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-[#354B3C]" aria-hidden="true">
              {initials}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <p className="font-bold text-[#26352E] text-sm leading-tight">
                {appointment.nutritionists?.full_name ?? 'Nutritionist'}
              </p>
              {!compact && (
                <p className="text-xs text-[#788078] mt-0.5">Nutrition Consultation</p>
              )}
            </div>
            <StatusBadge status={appointment.status} />
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#788078]">
            <span className="flex items-center gap-1">
              <Calendar size={11} aria-hidden="true" />
              {formatDate(appointment.appointment_date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} aria-hidden="true" />
              {formatTime(appointment.start_time)}
            </span>
          </div>

          {timeUntil && !compact && (
            <p className="mt-2 text-xs font-semibold text-[#718B73] flex items-center gap-1">
              <Bell size={11} aria-hidden="true" />
              {timeUntil}
            </p>
          )}

          {/* Attendance confirmation for upcoming */}
          {isUpcoming && appointment.attendance_confirmation === 'pending' && !compact && onConfirm && (
            <div className="mt-3 p-3 bg-[#FFFBEB] rounded-xl border border-amber-100">
              <p className="text-xs text-[#92400E] font-medium mb-2">
                Are you still able to make it?
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={onConfirm} className="flex-1 text-xs">
                  Yes, I'll be there
                </Button>
                {onReschedule && (
                  <Button size="sm" variant="ghost" onClick={onReschedule} className="flex-1 text-xs">
                    Reschedule
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && isUpcoming && !compact && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-[#E8E7DF]">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/client/appointments/${appointment.id}`)}
            className="flex-1"
          >
            View
            <ChevronRight size={14} aria-hidden="true" />
          </Button>
          {onReschedule && (
            <Button size="sm" variant="outline" onClick={onReschedule} className="flex-1">
              Reschedule
            </Button>
          )}
          {onCancel && (
            <Button size="sm" variant="danger" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
