import { useState } from 'react';
import { format } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { CalendarPicker } from '../booking/CalendarPicker';
import { TimeSlotGrid } from '../booking/TimeSlotGrid';
import { useToast } from '../ui/Toast';
import { rescheduleAppointment, getBookedTimesForDate } from '../../services/appointments';
import { generateTimeSlots } from '../../lib/utils';
import type { AppointmentWithClient } from '../../types';

interface RescheduleDialogProps {
  open: boolean;
  onClose: () => void;
  appointment: AppointmentWithClient;
}

export function RescheduleDialog({ open, onClose, appointment }: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const { success, error: toastError } = useToast();
  const qc = useQueryClient();

  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;

  const { data: bookedTimes = [], isLoading: loadingSlots } = useQuery({
    queryKey: ['booked-times', dateStr],
    queryFn: () => getBookedTimesForDate(dateStr!),
    enabled: !!dateStr,
  });

  const slots = dateStr
    ? generateTimeSlots(bookedTimes, dateStr)
    : [];

  const mutation = useMutation({
    mutationFn: () =>
      rescheduleAppointment({
        appointmentId: appointment.id,
        newDate: dateStr!,
        newStartTime: selectedTime!,
      }),
    onSuccess: () => {
      success('Appointment rescheduled successfully!');
      qc.invalidateQueries({ queryKey: ['appointments'] });
      qc.invalidateQueries({ queryKey: ['appointment', appointment.id] });
      onClose();
    },
    onError: (err: Error) => {
      toastError(err.message);
    },
  });

  const canConfirm = !!dateStr && !!selectedTime && !mutation.isPending;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Reschedule Appointment"
      description="Choose a new date and time for your consultation."
      size="md"
    >
      <div className="space-y-6">
        {/* Step 1 – Date */}
        <div>
          <h3 className="text-sm font-semibold text-[#26352E] mb-3">Select a new date</h3>
          <CalendarPicker
            selectedDate={selectedDate}
            onDateSelect={(date) => {
              setSelectedDate(date);
              setSelectedTime(null);
            }}
          />
        </div>

        {/* Step 2 – Time */}
        {dateStr && (
          <div className="animate-fade-in">
            <h3 className="text-sm font-semibold text-[#26352E] mb-3">Select a new time</h3>
            <TimeSlotGrid
              slots={slots}
              selectedTime={selectedTime}
              onSelect={setSelectedTime}
              loading={loadingSlots}
            />
          </div>
        )}

        {/* Summary */}
        {dateStr && selectedTime && (
          <div className="p-4 bg-[#E7EDE4] rounded-xl animate-fade-in">
            <p className="text-sm font-semibold text-[#26352E]">New appointment time</p>
            <p className="text-sm text-[#788078] mt-1">
              {format(selectedDate!, 'EEEE, dd MMMM yyyy')} at{' '}
              {slots.find(s => s.time === selectedTime)?.label}
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => mutation.mutate()}
            className="flex-1"
            disabled={!canConfirm}
            loading={mutation.isPending}
          >
            Confirm Reschedule
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
