import { useQuery } from '@tanstack/react-query';
import { Calendar, CheckCircle, TrendingUp, UserX, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { StatCardSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/EmptyState';
import { StatusBadge, ConfirmationBadge } from '../../components/ui/StatusBadge';
import { getDashboardStats, getTodayAppointments } from '../../services/appointments';
import { formatTime, formatPhone } from '../../lib/utils';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const today = format(new Date(), 'EEEE, dd MMMM yyyy');

  const { data: stats, isLoading: loadingStats, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30_000,
  });

  const { data: todayAppts = [], isLoading: loadingToday } = useQuery({
    queryKey: ['today-appointments'],
    queryFn: getTodayAppointments,
    refetchInterval: 30_000,
  });

  if (statsError) return <ErrorState onRetry={() => window.location.reload()} />;

  const STAT_CARDS = [
    {
      label: 'Total appointments',
      value: stats?.total ?? 0,
      icon: Calendar,
      color: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      label: "Today's appointments",
      value: stats?.today ?? 0,
      icon: TrendingUp,
      color: 'bg-[#E7EDE4]',
      iconColor: 'text-[#718B73]',
    },
    {
      label: 'Completed',
      value: stats?.completed ?? 0,
      icon: CheckCircle,
      color: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
    },
    {
      label: 'No-shows',
      value: stats?.noShows ?? 0,
      icon: UserX,
      color: 'bg-red-50',
      iconColor: 'text-red-400',
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[#26352E]">{greeting()}, Dr. Priya 👋</h1>
        <p className="text-sm text-[#788078] mt-1">
          Here's what's happening with your consultations. · {today}
        </p>
      </div>

      {/* Stats grid */}
      <section aria-label="Summary statistics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingStats
            ? [1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)
            : STAT_CARDS.map(card => (
                <div key={card.label} className="card p-5 space-y-3">
                  <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center`}>
                    <card.icon size={20} className={card.iconColor} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#26352E]">{card.value}</p>
                    <p className="text-xs text-[#788078] font-medium mt-0.5">{card.label}</p>
                  </div>
                </div>
              ))}
        </div>
      </section>

      {/* Pending confirmations alert */}
      {(stats?.pendingConfirmation ?? 0) > 0 && (
        <div className="flex items-start gap-3 p-4 bg-[#FFFBEB] border border-amber-200 rounded-xl animate-fade-in">
          <Bell size={18} className="text-[#C38C43] flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-[#26352E]">
              {stats!.pendingConfirmation} upcoming appointment{stats!.pendingConfirmation > 1 ? 's' : ''} awaiting confirmation
            </p>
            <p className="text-xs text-[#788078] mt-0.5">
              Clients haven't confirmed attendance yet. Check the appointments list.
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/appointments')}
            className="ml-auto text-xs font-semibold text-[#C38C43] hover:text-[#a57835] transition-colors whitespace-nowrap"
          >
            View →
          </button>
        </div>
      )}

      {/* Today's appointments */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#26352E]">Today's consultations</h2>
          <button
            onClick={() => navigate('/admin/appointments')}
            className="text-sm text-[#718B73] font-semibold hover:text-[#354B3C] transition-colors"
          >
            See all →
          </button>
        </div>

        {loadingToday ? (
          <div className="space-y-3">
            {[1, 2].map(i => <StatCardSkeleton key={i} />)}
          </div>
        ) : todayAppts.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-[#788078] text-sm">No consultations scheduled for today.</p>
            <p className="text-[#B0B8B0] text-xs mt-1">Enjoy your day! ☀️</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full" aria-label="Today's appointments">
              <thead>
                <tr className="border-b border-[#E8E7DF]">
                  <th className="text-left text-xs font-bold text-[#788078] uppercase tracking-wider px-5 py-3.5">
                    Client
                  </th>
                  <th className="text-left text-xs font-bold text-[#788078] uppercase tracking-wider px-4 py-3.5 hidden sm:table-cell">
                    Phone
                  </th>
                  <th className="text-left text-xs font-bold text-[#788078] uppercase tracking-wider px-4 py-3.5">
                    Time
                  </th>
                  <th className="text-left text-xs font-bold text-[#788078] uppercase tracking-wider px-4 py-3.5">
                    Status
                  </th>
                  <th className="text-left text-xs font-bold text-[#788078] uppercase tracking-wider px-4 py-3.5 hidden md:table-cell">
                    Confirmed
                  </th>
                </tr>
              </thead>
              <tbody>
                {todayAppts.map((apt, i) => (
                  <tr
                    key={apt.id}
                    className={`border-b border-[#E8E7DF] last:border-0 hover:bg-[#F8F7F2] transition-colors cursor-pointer ${i % 2 === 0 ? '' : 'bg-[#FAFAF8]'}`}
                    onClick={() => navigate('/admin/appointments')}
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-[#26352E]">
                        {apt.clients?.full_name ?? 'Unknown'}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <p className="text-sm text-[#788078]">
                        {apt.clients?.phone ? formatPhone(apt.clients.phone) : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-[#26352E]">
                        {formatTime(apt.start_time)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={apt.status} />
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <ConfirmationBadge confirmation={apt.attendance_confirmation} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
