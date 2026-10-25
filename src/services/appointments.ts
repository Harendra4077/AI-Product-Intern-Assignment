import { supabase } from '../lib/supabase';
import { timeToEndTime } from '../lib/utils';
import { DEMO_NUTRITIONIST_ID } from './nutritionists';
import { findOrCreateClient } from './clients';
import type {
  Appointment,
  AppointmentWithClient,
  AppointmentStatus,
  DashboardStats,
} from '../types';

// -------- Fetch helpers --------

export async function getAppointmentsWithClients(filters?: {
  status?: AppointmentStatus;
  date?: string;
  search?: string;
}): Promise<AppointmentWithClient[]> {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      clients (*),
      nutritionists (*)
    `)
    .order('appointment_date', { ascending: false })
    .order('start_time', { ascending: true });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.date) {
    query = query.eq('appointment_date', filters.date);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let results = data as AppointmentWithClient[];

  // Client-side search filter
  if (filters?.search) {
    const term = filters.search.toLowerCase();
    results = results.filter(a =>
      a.clients?.full_name?.toLowerCase().includes(term) ||
      a.clients?.normalized_phone?.includes(term) ||
      a.clients?.phone?.includes(term)
    );
  }

  return results;
}

export async function getAppointmentById(id: string): Promise<AppointmentWithClient> {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      clients (*),
      nutritionists (*)
    `)
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as AppointmentWithClient;
}

export async function getAppointmentsByPhone(normalizedPhone: string): Promise<AppointmentWithClient[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      clients (*),
      nutritionists (*)
    `)
    .order('appointment_date', { ascending: false })
    .order('start_time', { ascending: true });

  if (error) throw new Error(error.message);

  const all = data as AppointmentWithClient[];
  return all.filter(a => a.clients?.normalized_phone === normalizedPhone);
}

export async function getBookedTimesForDate(
  date: string,
  nutritionistId: string = DEMO_NUTRITIONIST_ID
): Promise<string[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select('start_time')
    .eq('appointment_date', date)
    .eq('nutritionist_id', nutritionistId)
    .neq('status', 'cancelled');

  if (error) throw new Error(error.message);
  return (data as { start_time: string }[]).map(r => r.start_time);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('appointments')
    .select('status, appointment_date, attendance_confirmation');

  if (error) throw new Error(error.message);

  const all = data as { status: AppointmentStatus; appointment_date: string; attendance_confirmation: string }[];

  return {
    total: all.length,
    today: all.filter(a => a.appointment_date === today && a.status !== 'cancelled').length,
    completed: all.filter(a => a.status === 'done').length,
    noShows: all.filter(a => a.status === 'no_show').length,
    pendingConfirmation: all.filter(
      a => a.status === 'booked' &&
      a.appointment_date >= today &&
      a.attendance_confirmation === 'pending'
    ).length,
  };
}

// -------- Mutations --------

export async function bookAppointment(params: {
  clientId: string;
  nutritionistId?: string;
  date: string;
  startTime: string;
  notes?: string;
}): Promise<Appointment> {
  const nutritionistId = params.nutritionistId ?? DEMO_NUTRITIONIST_ID;
  const endTime = timeToEndTime(params.startTime, 30);

  const { data, error } = await supabase.rpc('book_appointment', {
    p_client_id: params.clientId,
    p_nutritionist_id: nutritionistId,
    p_appointment_date: params.date,
    p_start_time: params.startTime,
    p_end_time: endTime,
    p_notes: params.notes ?? null,
  });

  if (error) {
    if (error.message.includes('SLOT_UNAVAILABLE')) {
      throw new Error('This time slot has just been booked. Please choose another time.');
    }
    if (error.message.includes('PAST_DATE')) {
      throw new Error('You cannot book an appointment in the past.');
    }
    throw new Error(error.message);
  }

  return data as Appointment;
}

export async function createAppointmentWithClient(params: {
  fullName: string;
  phone?: string;
  date: string;
  startTime: string;
  status?: AppointmentStatus;
  notes?: string;
}): Promise<Appointment> {
  // Find or create client
  const client = await findOrCreateClient(params.fullName, params.phone);

  if (params.status && params.status !== 'booked') {
    // Admin manual creation with arbitrary status — bypass atomic booking check for historical records
    const endTime = timeToEndTime(params.startTime, 30);
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        client_id: client.id,
        nutritionist_id: DEMO_NUTRITIONIST_ID,
        appointment_date: params.date,
        start_time: params.startTime,
        end_time: endTime,
        status: params.status,
        notes: params.notes ?? null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('This time slot is already booked.');
      }
      throw new Error(error.message);
    }
    return data as Appointment;
  }

  return bookAppointment({
    clientId: client.id,
    date: params.date,
    startTime: params.startTime,
    notes: params.notes,
  });
}

export async function rescheduleAppointment(params: {
  appointmentId: string;
  newDate: string;
  newStartTime: string;
}): Promise<Appointment> {
  const newEndTime = timeToEndTime(params.newStartTime, 30);

  const { data, error } = await supabase.rpc('reschedule_appointment', {
    p_appointment_id: params.appointmentId,
    p_new_date: params.newDate,
    p_new_start_time: params.newStartTime,
    p_new_end_time: newEndTime,
  });

  if (error) {
    if (error.message.includes('SLOT_UNAVAILABLE')) {
      throw new Error('This time slot is already booked. Please choose another time.');
    }
    if (error.message.includes('PAST_DATE')) {
      throw new Error('Cannot reschedule to a past date.');
    }
    if (error.message.includes('INVALID_APPOINTMENT')) {
      throw new Error('Appointment cannot be rescheduled. It may have already been completed or cancelled.');
    }
    throw new Error(error.message);
  }

  return data as Appointment;
}

export async function cancelAppointment(id: string): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function confirmAttendance(id: string): Promise<void> {
  const { error } = await supabase
    .from('appointments')
    .update({ attendance_confirmation: 'confirmed' })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function getTodayAppointments(): Promise<AppointmentWithClient[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('appointments')
    .select(`*, clients(*), nutritionists(*)`)
    .eq('appointment_date', today)
    .neq('status', 'cancelled')
    .order('start_time');

  if (error) throw new Error(error.message);
  return data as AppointmentWithClient[];
}

// -------- Reminder Logs --------

export async function createReminderLog(params: {
  appointmentId: string;
  reminderType: '24h' | '2h' | 'custom';
  scheduledAt: string;
}): Promise<void> {
  const { error } = await supabase
    .from('reminder_logs')
    .insert({
      appointment_id: params.appointmentId,
      reminder_type: params.reminderType,
      scheduled_at: params.scheduledAt,
      delivery_status: 'simulated',
    });

  if (error) throw new Error(error.message);
}

export async function getReminderLogs(appointmentId: string) {
  const { data, error } = await supabase
    .from('reminder_logs')
    .select('*')
    .eq('appointment_id', appointmentId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}
