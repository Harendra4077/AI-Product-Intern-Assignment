import { Phone, Calendar, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import { formatDate, formatTime } from '../../lib/utils';
import { getAppointmentsByPhone } from '../../services/appointments';

const DEMO_PHONE = '9820011111';
const DEMO_NAME = 'Riya Shah';
const DEMO_PHONE_DISPLAY = '98200 11111';

export function ProfilePage() {
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments', 'client', DEMO_PHONE],
    queryFn: () => getAppointmentsByPhone(DEMO_PHONE),
  });

  const total = appointments.length;
  const done = appointments.filter(a => a.status === 'done').length;
  const noShows = appointments.filter(a => a.status === 'no_show').length;

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-xl font-bold text-[#26352E]">Profile</h1>

      {/* Avatar card */}
      <div className="card p-6 flex flex-col items-center text-center gap-3">
        <div className="w-20 h-20 rounded-2xl bg-[#E7EDE4] flex items-center justify-center">
          <span className="text-3xl font-bold text-[#354B3C]">RS</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#26352E]">{DEMO_NAME}</h2>
          <p className="text-sm text-[#788078] flex items-center justify-center gap-1.5 mt-1">
            <Phone size={13} aria-hidden="true" />
            {DEMO_PHONE_DISPLAY}
          </p>
        </div>
        <div className="w-full grid grid-cols-3 gap-3 mt-2">
          <StatCell label="Total" value={total} loading={isLoading} />
          <StatCell label="Completed" value={done} loading={isLoading} />
          <StatCell label="No-shows" value={noShows} loading={isLoading} />
        </div>
      </div>

      {/* Note about demo */}
      <div className="p-4 bg-[#F0E9DD] rounded-xl border border-[#E0D4C5]">
        <p className="text-xs text-[#788078] leading-relaxed">
          <strong className="text-[#26352E]">Demo mode:</strong> Profile data is pre-loaded for Riya Shah. In production, clients would sign in to see their own data.
        </p>
      </div>

      {/* Appointment history */}
      <section>
        <h2 className="text-sm font-bold text-[#788078] uppercase tracking-wider mb-3">
          Appointment history
        </h2>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
          </div>
        ) : appointments.length === 0 ? (
          <p className="text-sm text-[#788078] text-center py-8">No appointments yet.</p>
        ) : (
          <div className="space-y-2">
            {appointments
              .sort((a, b) => b.appointment_date.localeCompare(a.appointment_date))
              .map(apt => (
                <div key={apt.id} className="card p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#E7EDE4] flex items-center justify-center flex-shrink-0">
                      <Calendar size={14} className="text-[#718B73]" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#26352E] truncate">
                        {formatDate(apt.appointment_date)}
                      </p>
                      <p className="text-xs text-[#788078] flex items-center gap-1">
                        <Clock size={10} aria-hidden="true" />
                        {formatTime(apt.start_time)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={apt.status} />
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCell({
  label,
  value,
  loading,
}: {
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <div className="bg-[#F8F7F2] rounded-xl p-3 text-center">
      {loading ? (
        <Skeleton className="h-6 w-8 mx-auto mb-1" />
      ) : (
        <p className="text-xl font-bold text-[#26352E]">{value}</p>
      )}
      <p className="text-xs text-[#788078] font-medium">{label}</p>
    </div>
  );
}
