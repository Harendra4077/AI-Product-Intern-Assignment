import { cn } from '../../lib/utils';
import type { AppointmentStatus, AttendanceConfirmation } from '../../types';
import { getStatusLabel, getConfirmationLabel } from '../../lib/utils';

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-600 border',
        `status-${status}`,
        className
      )}
      role="status"
      aria-label={`Status: ${getStatusLabel(status)}`}
    >
      <span
        className={cn('w-1.5 h-1.5 rounded-full', {
          'bg-blue-500': status === 'booked',
          'bg-green-500': status === 'done',
          'bg-red-500': status === 'no_show',
          'bg-gray-400': status === 'cancelled',
        })}
        aria-hidden="true"
      />
      {getStatusLabel(status)}
    </span>
  );
}

interface ConfirmationBadgeProps {
  confirmation: AttendanceConfirmation;
  className?: string;
}

export function ConfirmationBadge({ confirmation, className }: ConfirmationBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-600 border',
        `confirm-${confirmation}`,
        className
      )}
      role="status"
      aria-label={`Attendance: ${getConfirmationLabel(confirmation)}`}
    >
      <span
        className={cn('w-1.5 h-1.5 rounded-full', {
          'bg-emerald-500': confirmation === 'confirmed',
          'bg-amber-500': confirmation === 'pending',
        })}
        aria-hidden="true"
      />
      {getConfirmationLabel(confirmation)}
    </span>
  );
}
