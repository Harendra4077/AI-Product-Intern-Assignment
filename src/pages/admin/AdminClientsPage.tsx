import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, User, Phone } from 'lucide-react';
import { getClientStats } from '../../services/clients';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { formatDate, formatPhone, getInitials } from '../../lib/utils';

export function AdminClientsPage() {
  const [search, setSearch] = useState('');

  const { data: clientStats = [], isLoading, error, refetch } = useQuery({
    queryKey: ['client-stats'],
    queryFn: getClientStats,
  });

  const filtered = search.trim()
    ? clientStats.filter(cs =>
        cs.client.full_name.toLowerCase().includes(search.toLowerCase()) ||
        cs.client.normalized_phone?.includes(search)
      )
    : clientStats;

  if (error) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#26352E]">Clients</h1>
        <p className="text-sm text-[#788078] mt-1">
          {filtered.length} client{filtered.length !== 1 ? 's' : ''} on record
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#788078]"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search clients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search clients"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8E7DF] text-sm text-[#26352E] placeholder:text-[#B0B8B0] focus:outline-none focus:ring-2 focus:ring-[#718B73]/30 focus:border-[#718B73] bg-white"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No clients found"
          description={search ? 'No clients match your search.' : 'Clients appear here when appointments are created.'}
          icon={<User size={28} className="text-[#718B73]" />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(cs => (
            <div key={cs.client.id} className="card p-5 space-y-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#E7EDE4] flex items-center justify-center flex-shrink-0">
                  <span className="text-base font-bold text-[#354B3C]">
                    {getInitials(cs.client.full_name)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#26352E] truncate">{cs.client.full_name}</p>
                  <p className="text-xs text-[#788078] flex items-center gap-1 mt-0.5">
                    <Phone size={10} aria-hidden="true" />
                    {cs.client.phone ? formatPhone(cs.client.phone) : 'No phone provided'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8E7DF]">
                <div className="text-center p-2 bg-[#F8F7F2] rounded-lg">
                  <p className="text-xl font-bold text-[#26352E]">{cs.totalAppointments}</p>
                  <p className="text-[10px] text-[#788078] font-medium uppercase tracking-wide">
                    Appointments
                  </p>
                </div>
                <div className="text-center p-2 bg-[#F8F7F2] rounded-lg">
                  <p className="text-sm font-bold text-[#26352E]">
                    {cs.lastAppointmentDate
                      ? formatDate(cs.lastAppointmentDate)
                      : '—'}
                  </p>
                  <p className="text-[10px] text-[#788078] font-medium uppercase tracking-wide">
                    Last visit
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
