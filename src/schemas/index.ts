import { z } from 'zod';
import { normalizePhone } from '../lib/utils';

// -------- Phone validation --------
const indianPhone = z
  .string()
  .min(1, 'Phone number is required')
  .transform(val => normalizePhone(val))
  .refine(val => /^[6-9]\d{9}$/.test(val), {
    message: 'Enter a valid 10-digit Indian mobile number',
  });

const optionalPhone = z
  .string()
  .optional()
  .transform(val => (val ? normalizePhone(val) : undefined))
  .refine(val => !val || /^[6-9]\d{9}$/.test(val), {
    message: 'Enter a valid 10-digit Indian mobile number',
  });

// -------- Booking Form --------
export const bookingSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens and apostrophes'),
  phone: indianPhone,
  appointment_date: z
    .string()
    .min(1, 'Please select a date'),
  start_time: z
    .string()
    .min(1, 'Please select a time'),
  notes: z.string().max(500, 'Notes too long').optional(),
});

export type BookingFormValues = z.infer<typeof bookingSchema>;

// -------- Manual Appointment Form (admin) --------
export const manualAppointmentSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  phone: optionalPhone,
  appointment_date: z
    .string()
    .min(1, 'Please select a date'),
  start_time: z
    .string()
    .min(1, 'Please select a time'),
  status: z.enum(['booked', 'done', 'no_show', 'cancelled'] as const, {
    message: 'Please select a status',
  }),
  notes: z.string().max(500, 'Notes too long').optional(),
});

export type ManualAppointmentFormValues = z.infer<typeof manualAppointmentSchema>;

// -------- Reschedule Form --------
export const rescheduleSchema = z.object({
  appointment_date: z.string().min(1, 'Please select a new date'),
  start_time: z.string().min(1, 'Please select a new time'),
});

export type RescheduleFormValues = z.infer<typeof rescheduleSchema>;

// -------- Profile Form --------
export const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  phone: indianPhone,
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
