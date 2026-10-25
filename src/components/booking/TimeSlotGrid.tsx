import { cn } from '../../lib/utils';
import type { TimeSlot } from '../../types';

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
  loading?: boolean;
}

export function TimeSlotGrid({
  slots,
  selectedTime,
  onSelect,
  loading = false,
}: TimeSlotGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="skeleton h-11 rounded-xl" aria-hidden="true" />
        ))}
      </div>
    );
  }

  if (!slots.length) {
    return (
      <p className="text-sm text-[#788078] text-center py-4">
        No time slots available for this date.
      </p>
    );
  }

  const availableCount = slots.filter(s => s.available).length;

  return (
    <div>
      <p className="text-xs text-[#788078] mb-3 font-medium">
        {availableCount} slot{availableCount !== 1 ? 's' : ''} available
      </p>
      <div
        className="grid grid-cols-3 gap-2"
        role="group"
        aria-label="Available time slots"
      >
        {slots.map(slot => (
          <button
            key={slot.time}
            disabled={!slot.available}
            onClick={() => slot.available && onSelect(slot.time)}
            aria-label={`${slot.label}${slot.available ? '' : ' — unavailable'}`}
            aria-pressed={selectedTime === slot.time}
            className={cn(
              'py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#718B73]',
              slot.available
                ? selectedTime === slot.time
                  ? 'bg-[#354B3C] text-white border-[#354B3C] shadow-sm'
                  : 'bg-white text-[#26352E] border-[#E8E7DF] hover:border-[#718B73] hover:bg-[#E7EDE4]'
                : 'bg-[#F8F7F2] text-[#B0B8B0] border-[#E8E7DF] cursor-not-allowed line-through opacity-60',
            )}
          >
            {slot.label}
          </button>
        ))}
      </div>
    </div>
  );
}
