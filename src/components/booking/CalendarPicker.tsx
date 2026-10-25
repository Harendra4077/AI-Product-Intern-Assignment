import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isPast,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CalendarPickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  disabledDates?: string[]; // YYYY-MM-DD
  minDate?: Date;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarPicker({
  selectedDate,
  onDateSelect,
  disabledDates = [],
  minDate = new Date(),
}: CalendarPickerProps) {
  const [viewDate, setViewDate] = useState(selectedDate ?? new Date());

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const isDisabled = (date: Date): boolean => {
    if (isPast(date) && !isToday(date)) return true;
    const iso = format(date, 'yyyy-MM-dd');
    if (disabledDates.includes(iso)) return true;
    // minDate check (time-based)
    const compareMin = new Date(minDate);
    compareMin.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < compareMin;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E8E7DF] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E7DF]">
        <button
          onClick={() => setViewDate(v => subMonths(v, 1))}
          aria-label="Previous month"
          className="p-2 rounded-lg hover:bg-[#F8F7F2] transition-colors text-[#788078] hover:text-[#26352E]"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <span className="font-bold text-[#26352E] text-sm">
          {format(viewDate, 'MMMM yyyy')}
        </span>
        <button
          onClick={() => setViewDate(v => addMonths(v, 1))}
          aria-label="Next month"
          className="p-2 rounded-lg hover:bg-[#F8F7F2] transition-colors text-[#788078] hover:text-[#26352E]"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map(day => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-[#788078] py-1"
              aria-hidden="true"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Calendar">
          {days.map(day => {
            const disabled = isDisabled(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const today = isToday(day);
            const inMonth = isSameMonth(day, viewDate);

            return (
              <div key={day.toISOString()} role="gridcell">
                <button
                  onClick={() => !disabled && onDateSelect(day)}
                  disabled={disabled}
                  aria-label={format(day, 'EEEE, d MMMM yyyy')}
                  aria-pressed={!!isSelected}
                  aria-disabled={disabled}
                  className={cn(
                    'w-full aspect-square rounded-xl text-sm font-medium transition-all duration-150',
                    'flex items-center justify-center',
                    !inMonth && 'opacity-30',
                    disabled && 'cursor-not-allowed opacity-30',
                    !disabled && !isSelected && 'hover:bg-[#E7EDE4] hover:text-[#26352E]',
                    today && !isSelected && 'bg-[#F0E9DD] text-[#354B3C] font-bold',
                    isSelected && 'bg-[#354B3C] text-white font-bold shadow-sm',
                    !disabled && !isSelected && !today && 'text-[#26352E]',
                  )}
                >
                  {format(day, 'd')}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
