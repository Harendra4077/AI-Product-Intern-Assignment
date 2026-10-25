import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameDay,
  addDays,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAppointmentsWithClients } from '../../services/appointments';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatTime } from '../../lib/utils';
import { cn } from '../../lib/utils';
import type { AppointmentWithClient } from '../../types';

type CalView = 'month' | 'week';

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function AdminCalendarPage() {
  const [viewDate, setViewDate] = useState(new Date());
  const [calView, setCalView] = useState<CalView>('month');
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const { data: appointments = [] } = useQuery({
    queryKey: ['appointments', 'admin'],
    queryFn: () => getAppointmentsWithClients(),
    refetchInterval: 60_000,
  });

  // Group appointments by date
  const byDate = appointments.reduce<Record<string, AppointmentWithClient[]>>((acc, apt) => {
    if (!acc[apt.appointment_date]) acc[apt.appointment_date] = [];
    acc[apt.appointment_date].push(apt);
    return acc;
  }, {});

  const selectedDateStr = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : null;
  const selectedAppts = selectedDateStr ? (byDate[selectedDateStr] ?? []) : [];

  // Month view days
  const monthDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewDate)),
    end: endOfWeek(endOfMonth(viewDate)),
  });

  // Week view days
  const weekStart = startOfWeek(viewDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const displayDays = calView === 'month' ? monthDays : weekDays;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#26352E]">Calendar</h1>
          <p className="text-sm text-[#788078] mt-1">Visual overview of appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-[#E8E7DF] overflow-hidden">
            {(['month', 'week'] as CalView[]).map(v => (
              <button
                key={v}
                onClick={() => setCalView(v)}
                aria-pressed={calView === v}
                className={cn(
                  'px-4 py-2 text-sm font-semibold capitalize transition-colors',
                  calView === v
                    ? 'bg-[#354B3C] text-white'
                    : 'bg-white text-[#788078] hover:bg-[#F8F7F2]'
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={() =>
              setViewDate(v =>
                calView === 'month' ? subMonths(v, 1) : addDays(v, -7)
              )
            }
            aria-label="Previous"
            className="p-2 rounded-lg border border-[#E8E7DF] hover:bg-[#F8F7F2] transition-colors text-[#788078]"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            onClick={() => setViewDate(new Date())}
            className="px-3 py-2 text-sm font-semibold text-[#718B73] border border-[#E8E7DF] rounded-lg hover:bg-[#E7EDE4] transition-colors"
          >
            Today
          </button>
          <button
            onClick={() =>
              setViewDate(v =>
                calView === 'month' ? addMonths(v, 1) : addDays(v, 7)
              )
            }
            aria-label="Next"
            className="p-2 rounded-lg border border-[#E8E7DF] hover:bg-[#F8F7F2] transition-colors text-[#788078]"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Month label */}
      <h2 className="text-lg font-bold text-[#26352E]">
        {calView === 'month'
          ? format(viewDate, 'MMMM yyyy')
          : `Week of ${format(weekStart, 'dd MMM yyyy')}`}
      </h2>

      <div className="flex gap-6">
        {/* Calendar grid */}
        <div className="card flex-1 overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-[#E8E7DF]">
            {WEEKDAYS_SHORT.map(d => (
              <div
                key={d}
                className="text-center text-xs font-bold text-[#788078] py-3"
                aria-hidden="true"
              >
                {d}
              </div>
            ))}
          </div>
          {/* Days */}
          <div className="grid grid-cols-7" role="grid" aria-label="Calendar">
            {displayDays.map(day => {
              const iso = format(day, 'yyyy-MM-dd');
              const dayAppts = byDate[iso] ?? [];
              const isCurrentMonth = calView === 'week' || isSameMonth(day, viewDate);
              const today = isToday(day);
              const isSelected = selectedDay && isSameDay(day, selectedDay);

              return (
                <div
                  key={iso}
                  role="gridcell"
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    'border-b border-r border-[#E8E7DF] p-2 min-h-[80px] cursor-pointer transition-colors',
                    isSelected && 'bg-[#E7EDE4]',
                    !isSelected && 'hover:bg-[#F8F7F2]',
                    !isCurrentMonth && 'opacity-40'
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex w-7 h-7 rounded-full items-center justify-center text-sm font-semibold mb-1',
                      today && 'bg-[#354B3C] text-white',
                      !today && 'text-[#26352E]'
                    )}
                    aria-label={format(day, 'EEEE, d MMMM')}
                  >
                    {format(day, 'd')}
                  </span>
                  {/* Appointment dots/pills */}
                  <div className="space-y-0.5">
                    {dayAppts.slice(0, 3).map(apt => (
                      <div
                        key={apt.id}
                        className={cn(
                          'text-[10px] font-semibold truncate rounded px-1 py-0.5',
                          apt.status === 'booked' && 'bg-blue-100 text-blue-700',
                          apt.status === 'done' && 'bg-green-100 text-green-700',
                          apt.status === 'no_show' && 'bg-red-100 text-red-600',
                          apt.status === 'cancelled' && 'bg-gray-100 text-gray-500 line-through',
                        )}
                        title={`${apt.clients?.full_name} at ${formatTime(apt.start_time)}`}
                      >
                        {formatTime(apt.start_time)} {apt.clients?.full_name?.split(' ')[0]}
                      </div>
                    ))}
                    {dayAppts.length > 3 && (
                      <p className="text-[10px] text-[#788078] font-medium">
                        +{dayAppts.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day detail panel */}
        {selectedDay && (
          <div className="w-72 card p-4 space-y-4 animate-slide-up self-start">
            <h3 className="font-bold text-[#26352E] text-sm">
              {format(selectedDay, 'EEEE, dd MMM')}
            </h3>
            {selectedAppts.length === 0 ? (
              <p className="text-sm text-[#788078]">No appointments on this day.</p>
            ) : (
              <div className="space-y-3">
                {selectedAppts
                  .sort((a, b) => a.start_time.localeCompare(b.start_time))
                  .map(apt => (
                    <div key={apt.id} className="flex items-start gap-2 p-3 bg-[#F8F7F2] rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#26352E] truncate">
                          {apt.clients?.full_name}
                        </p>
                        <p className="text-xs text-[#788078]">{formatTime(apt.start_time)}</p>
                      </div>
                      <StatusBadge status={apt.status} />
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
