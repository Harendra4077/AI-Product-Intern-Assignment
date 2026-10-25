// ============================================================
// Kayro – Shared TypeScript Type Definitions
// ============================================================

export type AppointmentStatus = 'booked' | 'done' | 'no_show' | 'cancelled';
export type AttendanceConfirmation = 'pending' | 'confirmed';
export type ReminderType = '24h' | '2h' | 'custom';
export type DeliveryStatus = 'simulated' | 'pending' | 'sent' | 'failed';

export interface Nutritionist {
  id: string;
  full_name: string;
  email: string | null;
  consultation_duration_minutes: number;
  created_at: string;
}

export interface Client {
  id: string;
  full_name: string;
  phone: string | null;
  normalized_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  client_id: string;
  nutritionist_id: string;
  appointment_date: string; // YYYY-MM-DD
  start_time: string;       // HH:MM:SS
  end_time: string;         // HH:MM:SS
  status: AppointmentStatus;
  attendance_confirmation: AttendanceConfirmation;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppointmentWithClient extends Appointment {
  clients: Client;
  nutritionists: Nutritionist;
}

export interface ReminderLog {
  id: string;
  appointment_id: string;
  reminder_type: ReminderType;
  scheduled_at: string;
  delivery_status: DeliveryStatus;
  created_at: string;
}

// -------- Form / UI Types --------

export interface BookingFormData {
  full_name: string;
  phone: string;
  appointment_date: string;
  start_time: string;
  notes?: string;
}

export interface ManualAppointmentFormData {
  full_name: string;
  phone: string;
  appointment_date: string;
  start_time: string;
  status: AppointmentStatus;
  notes?: string;
}

export interface DashboardStats {
  total: number;
  today: number;
  completed: number;
  noShows: number;
  pendingConfirmation: number;
}

export interface TimeSlot {
  time: string;      // HH:MM
  label: string;     // 09:00 AM
  available: boolean;
}

export interface ClientStats {
  client: Client;
  totalAppointments: number;
  lastAppointmentDate: string | null;
}
