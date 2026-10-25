import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  X,
  MoreHorizontal,
  Check,
  UserX,
  Ban,
} from 'lucide-react';
import { StatusBadge, ConfirmationBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/FormFields';
import { Dialog } from '../../components/ui/Dialog';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import {
  getAppointmentsWithClients,
  updateAppointmentStatus,
  createAppointmentWithClient,
} from '../../services/appointments';
import { formatDate, formatTime, formatPhone, todayISO } from '../../lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { manualAppointmentSchema, type ManualAppointmentFormValues } from '../../schemas';
import type { AppointmentWithClient, AppointmentStatus } from '../../types';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'booked', label: 'Booked' },
  { value: 'done', label: 'Completed' },
  { value: 'no_show', label: 'No-show' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function AdminAppointmentsPage() {
  const { success, error: toastError } = useToast();
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [todayOnly, setTodayOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const effectiveDate = todayOnly ? todayISO() : dateFilter || undefined;

  const { data: appointments = [], isLoading, error, refetch } = useQuery({
    queryKey: ['appointments', 'admin', statusFilter, effectiveDate],
    queryFn: () =>
      getAppointmentsWithClients({
        status: (statusFilter as AppointmentStatus) || undefined,
        date: effectiveDate,
      }),
    refetchInterval: 30_000,
  });

  // Client-side search
  const filtered = search.trim()
    ? appointments.filter(a => {
        const term = search.toLowerCase();
        return (
          a.clients?.full_name?.toLowerCase().includes(term) ||
          a.clients?.normalized_phone?.includes(term) ||
          a.clients?.phone?.includes(term)
        );
      })
    : appointments;

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
      updateAppointmentStatus(id, status),
    onSuccess: () => {
      success('Status updated.');
      qc.invalidateQueries({ queryKey: ['appointments'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['today-appointments'] });
      setActiveMenu(null);
    },
    onError: (err: Error) => toastError(err.message),
  });

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setDateFilter('');
    setTodayOnly(false);
  };

  const hasFilters = search || statusFilter || dateFilter || todayOnly;

  if (error) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#26352E]">Appointments</h1>
          <p className="text-sm text-[#788078] mt-1">
            {filtered.length} appointment{filtered.length !== 1 ? 's' : ''}
            {hasFilters ? ' (filtered)' : ''}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          id="add-appointment-btn"
        >
          <Plus size={16} aria-hidden="true" />
          Add appointment
        </Button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex-1 min-w-48 relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#788078]"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search by name or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search appointments"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8E7DF] text-sm text-[#26352E] placeholder:text-[#B0B8B0] focus:outline-none focus:ring-2 focus:ring-[#718B73]/30 focus:border-[#718B73] bg-white"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className="px-3 py-2.5 rounded-xl border border-[#E8E7DF] text-sm text-[#26352E] bg-white focus:outline-none focus:ring-2 focus:ring-[#718B73]/30"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Date filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={e => {
              setDateFilter(e.target.value);
              setTodayOnly(false);
            }}
            aria-label="Filter by date"
            className="px-3 py-2.5 rounded-xl border border-[#E8E7DF] text-sm text-[#26352E] bg-white focus:outline-none focus:ring-2 focus:ring-[#718B73]/30"
          />

          {/* Today toggle */}
          <button
            onClick={() => {
              setTodayOnly(v => !v);
              setDateFilter('');
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
              todayOnly
                ? 'bg-[#354B3C] text-white border-[#354B3C]'
                : 'bg-white text-[#788078] border-[#E8E7DF] hover:border-[#718B73]'
            }`}
            aria-pressed={todayOnly}
          >
            Today
          </button>

          {/* Clear filters */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              aria-label="Clear all filters"
              className="px-3 py-2.5 rounded-xl border border-[#E8E7DF] text-sm text-[#788078] hover:text-[#26352E] bg-white transition-colors flex items-center gap-1.5"
            >
              <X size={14} aria-hidden="true" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" aria-label="Appointments table">
            <thead>
              <tr className="border-b border-[#E8E7DF] bg-[#FAFAFA]">
                {['Client', 'Phone', 'Date', 'Time', 'Status', 'Confirmed', 'Actions'].map(h => (
                  <th
                    key={h}
                    scope="col"
                    className="text-left text-xs font-bold text-[#788078] uppercase tracking-wider px-4 py-3.5 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} cols={7} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#788078] text-sm">
                    {hasFilters
                      ? 'No appointments match your filters.'
                      : 'No appointments found.'}
                  </td>
                </tr>
              ) : (
                filtered.map(apt => (
                  <AppointmentRow
                    key={apt.id}
                    apt={apt}
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                    onStatusChange={(status) =>
                      statusMutation.mutate({ id: apt.id, status })
                    }
                    isUpdating={statusMutation.isPending}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Appointment Modal */}
      <AddAppointmentModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}

// ---- Appointment Row ----

interface RowProps {
  apt: AppointmentWithClient;
  activeMenu: string | null;
  setActiveMenu: (id: string | null) => void;
  onStatusChange: (status: AppointmentStatus) => void;
  isUpdating: boolean;
}

function AppointmentRow({ apt, activeMenu, setActiveMenu, onStatusChange, isUpdating }: RowProps) {
  const menuOpen = activeMenu === apt.id;

  const transitions: { label: string; status: AppointmentStatus; icon: React.ElementType }[] = [
    { label: 'Mark done', status: 'done' as AppointmentStatus, icon: Check },
    { label: 'Mark no-show', status: 'no_show' as AppointmentStatus, icon: UserX },
    { label: 'Mark cancelled', status: 'cancelled' as AppointmentStatus, icon: Ban },
    { label: 'Mark booked', status: 'booked' as AppointmentStatus, icon: Check },
  ].filter(t => t.status !== apt.status);

  return (
    <tr className="border-b border-[#E8E7DF] last:border-0 hover:bg-[#F8F7F2] transition-colors">
      <td className="px-4 py-3.5">
        <p className="text-sm font-semibold text-[#26352E] whitespace-nowrap">
          {apt.clients?.full_name ?? '—'}
        </p>
      </td>
      <td className="px-4 py-3.5">
        <p className="text-sm text-[#788078] whitespace-nowrap">
          {apt.clients?.phone ? formatPhone(apt.clients.phone) : '—'}
        </p>
      </td>
      <td className="px-4 py-3.5">
        <p className="text-sm text-[#26352E] whitespace-nowrap">
          {formatDate(apt.appointment_date)}
        </p>
      </td>
      <td className="px-4 py-3.5">
        <p className="text-sm font-medium text-[#26352E] whitespace-nowrap">
          {formatTime(apt.start_time)}
        </p>
      </td>
      <td className="px-4 py-3.5">
        <StatusBadge status={apt.status} />
      </td>
      <td className="px-4 py-3.5">
        <ConfirmationBadge confirmation={apt.attendance_confirmation} />
      </td>
      <td className="px-4 py-3.5 relative">
        <button
          onClick={() => setActiveMenu(menuOpen ? null : apt.id)}
          aria-haspopup="true"
          aria-expanded={menuOpen}
          aria-label={`Actions for ${apt.clients?.full_name}`}
          className="p-2 rounded-lg hover:bg-[#E7EDE4] transition-colors text-[#788078] hover:text-[#26352E]"
        >
          <MoreHorizontal size={16} aria-hidden="true" />
        </button>
        {menuOpen && (
          <div
            className="absolute right-4 top-full mt-1 w-48 bg-white rounded-xl border border-[#E8E7DF] shadow-lg z-20 animate-scale-in overflow-hidden"
            role="menu"
          >
            {transitions.map(t => (
              <button
                key={t.status}
                onClick={() => onStatusChange(t.status)}
                disabled={isUpdating}
                role="menuitem"
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-[#26352E] hover:bg-[#F8F7F2] transition-colors text-left disabled:opacity-50"
              >
                <t.icon size={14} className="text-[#788078]" aria-hidden="true" />
                {t.label}
              </button>
            ))}
          </div>
        )}
      </td>
    </tr>
  );
}

// ---- Add Appointment Modal ----

function AddAppointmentModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { success, error: toastError } = useToast();
  const qc = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ManualAppointmentFormValues>({
    resolver: zodResolver(manualAppointmentSchema) as any,
    defaultValues: { status: 'booked' },
  });

  const mutation = useMutation({
    mutationFn: (data: ManualAppointmentFormValues) =>
      createAppointmentWithClient({
        fullName: data.full_name,
        phone: data.phone,
        date: data.appointment_date,
        startTime: data.start_time,
        status: data.status,
        notes: data.notes,
      }),
    onSuccess: () => {
      success('Appointment added successfully!');
      qc.invalidateQueries({ queryKey: ['appointments'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['today-appointments'] });
      reset();
      onClose();
    },
    onError: (err: Error) => toastError(err.message),
  });

  const onSubmit = (data: ManualAppointmentFormValues) => mutation.mutate(data);

  return (
    <Dialog
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Add appointment"
      description="Manually create an appointment for a client."
      size="md"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <Input
          label="Client name"
          placeholder="Full name"
          required
          error={errors.full_name?.message}
          {...register('full_name')}
        />
        <Input
          label="Phone number"
          placeholder="e.g. 98200 11111 (optional)"
          type="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="admin-apt-date" className="block text-sm font-semibold text-[#26352E] mb-1.5">
              Date <span className="text-[#C76C64]">*</span>
            </label>
            <input
              id="admin-apt-date"
              type="date"
              className={`w-full px-4 py-3 rounded-xl border text-sm text-[#26352E] bg-white focus:outline-none focus:ring-2 focus:ring-[#718B73]/30 ${errors.appointment_date ? 'border-[#C76C64]' : 'border-[#E8E7DF]'}`}
              {...register('appointment_date')}
            />
            {errors.appointment_date && (
              <p className="text-xs text-[#C76C64] mt-1">{errors.appointment_date.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="admin-apt-time" className="block text-sm font-semibold text-[#26352E] mb-1.5">
              Time <span className="text-[#C76C64]">*</span>
            </label>
            <input
              id="admin-apt-time"
              type="time"
              className={`w-full px-4 py-3 rounded-xl border text-sm text-[#26352E] bg-white focus:outline-none focus:ring-2 focus:ring-[#718B73]/30 ${errors.start_time ? 'border-[#C76C64]' : 'border-[#E8E7DF]'}`}
              {...register('start_time')}
            />
            {errors.start_time && (
              <p className="text-xs text-[#C76C64] mt-1">{errors.start_time.message}</p>
            )}
          </div>
        </div>
        <Select
          label="Status"
          required
          error={errors.status?.message}
          options={[
            { value: 'booked', label: 'Booked' },
            { value: 'done', label: 'Completed' },
            { value: 'no_show', label: 'No-show' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          {...register('status')}
        />
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => { reset(); onClose(); }}
            className="flex-1"
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            loading={mutation.isPending}
          >
            Add appointment
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
