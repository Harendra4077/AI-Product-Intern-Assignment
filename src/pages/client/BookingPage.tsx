import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  Leaf,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarPicker } from '../../components/booking/CalendarPicker';
import { TimeSlotGrid } from '../../components/booking/TimeSlotGrid';
import { Input } from '../../components/ui/FormFields';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { getBookedTimesForDate, createAppointmentWithClient } from '../../services/appointments';
import { bookingSchema, type BookingFormValues } from '../../schemas';
import { generateTimeSlots, formatDate, formatTime } from '../../lib/utils';
import type { Appointment } from '../../types';

type Step = 1 | 2 | 3 | 4;

export function BookingPage() {
  const navigate = useNavigate();
  const { error: toastError } = useToast();

  const [step, setStep] = useState<Step>(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);

  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;

  const { data: bookedTimes = [], isLoading: loadingSlots } = useQuery({
    queryKey: ['booked-times', dateStr],
    queryFn: () => getBookedTimesForDate(dateStr!),
    enabled: !!dateStr,
  });

  const slots = dateStr ? generateTimeSlots(bookedTimes, dateStr) : [];

  const { register, handleSubmit, formState: { errors }, getValues } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      appointment_date: dateStr ?? '',
      start_time: selectedTime ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: (data: BookingFormValues) =>
      createAppointmentWithClient({
        fullName: data.full_name,
        phone: data.phone,
        date: dateStr!,
        startTime: selectedTime!,
        notes: data.notes,
      }),
    onSuccess: (apt) => {
      setBookedAppointment(apt);
      setStep(4);
    },
    onError: (err: Error) => {
      toastError(err.message);
      // If slot was taken, go back to time selection
      if (err.message.includes('slot')) {
        setStep(2);
        setSelectedTime(null);
      }
    },
  });

  const STEP_LABELS = ['Date', 'Time', 'Details', 'Confirm'];

  const progressPercent = ((step - 1) / 3) * 100;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#26352E]">Book a consultation</h1>
        <p className="text-sm text-[#788078] mt-1">Schedule your nutrition session</p>
      </div>

      {step < 4 && (
        <>
          {/* Progress bar */}
          <div className="mb-6">
            <div className="h-1.5 bg-[#E7EDE4] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#354B3C] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={step}
                aria-valuemin={1}
                aria-valuemax={4}
                aria-label={`Step ${step} of 4`}
              />
            </div>
            <div className="flex justify-between mt-2">
              {STEP_LABELS.map((label, i) => (
                <span
                  key={label}
                  className={`text-xs font-semibold ${
                    i + 1 <= step ? 'text-[#354B3C]' : 'text-[#B0B8B0]'
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Step 1: Date */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-sm font-semibold text-[#26352E]">Select a date</p>
          <CalendarPicker
            selectedDate={selectedDate}
            onDateSelect={(d) => {
              setSelectedDate(d);
              setSelectedTime(null);
            }}
          />
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!selectedDate}
            onClick={() => setStep(2)}
          >
            Continue
            <ChevronRight size={18} aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Step 2: Time */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-4 flex items-center gap-3">
            <Calendar size={16} className="text-[#718B73]" aria-hidden="true" />
            <span className="text-sm font-semibold text-[#26352E]">
              {formatDate(dateStr!)}
            </span>
          </div>

          <p className="text-sm font-semibold text-[#26352E]">Select a time</p>
          <TimeSlotGrid
            slots={slots}
            selectedTime={selectedTime}
            onSelect={setSelectedTime}
            loading={loadingSlots}
          />

          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep(1)} className="flex-1">
              <ChevronLeft size={18} aria-hidden="true" />
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              disabled={!selectedTime}
              onClick={() => setStep(3)}
            >
              Continue
              <ChevronRight size={18} aria-hidden="true" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <form
          className="space-y-4 animate-fade-in"
          onSubmit={handleSubmit(() => mutation.mutate(getValues()))}
          noValidate
        >
          {/* Summary */}
          <div className="card p-4 space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={14} className="text-[#718B73]" aria-hidden="true" />
              <span className="text-[#788078]">{formatDate(dateStr!)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock size={14} className="text-[#718B73]" aria-hidden="true" />
              <span className="text-[#788078]">
                {slots.find(s => s.time === selectedTime)?.label}
              </span>
            </div>
          </div>

          <Input
            label="Full name"
            placeholder="e.g. Riya Shah"
            required
            error={errors.full_name?.message}
            {...register('full_name')}
          />

          <Input
            label="Phone number"
            placeholder="e.g. 98200 11111"
            type="tel"
            required
            hint="10-digit Indian mobile number"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setStep(2)}
              className="flex-1"
            >
              <ChevronLeft size={18} aria-hidden="true" />
              Back
            </Button>
            <Button type="submit" variant="primary" size="lg" className="flex-1">
              Review booking
              <ChevronRight size={18} aria-hidden="true" />
            </Button>
          </div>
        </form>
      )}

      {/* Step 4: Success */}
      {step === 4 && bookedAppointment && (
        <div className="flex flex-col items-center text-center space-y-6 py-8 animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-[#E7EDE4] flex items-center justify-center">
            <CheckCircle2 size={40} className="text-[#438765]" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#26352E]">You're booked!</h2>
            <p className="text-sm text-[#788078] mt-2">
              Your consultation has been scheduled successfully.
            </p>
          </div>

          <div className="card p-5 w-full text-left space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#E7EDE4] flex items-center justify-center">
                <Leaf size={16} className="text-[#718B73]" aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-[#26352E]">Nutrition Consultation</p>
            </div>
            <div className="text-sm text-[#788078] space-y-1 pl-11">
              <p>📅 {formatDate(bookedAppointment.appointment_date)}</p>
              <p>🕐 {formatTime(bookedAppointment.start_time)}</p>
              <p>👩‍⚕️ Dr. Priya Sharma</p>
            </div>
          </div>

          <div className="w-full space-y-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => navigate('/client/appointments')}
            >
              View my appointments
            </Button>
            <Button
              variant="ghost"
              size="md"
              className="w-full"
              onClick={() => {
                setStep(1);
                setSelectedDate(null);
                setSelectedTime(null);
                setBookedAppointment(null);
              }}
            >
              Book another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
