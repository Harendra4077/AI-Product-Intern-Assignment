import { supabase } from '../lib/supabase';
import { normalizePhone } from '../lib/utils';
import type { Client, ClientStats } from '../types';

export async function findOrCreateClient(
  fullName: string,
  phone?: string
): Promise<Client> {
  const normalizedPhone = phone ? normalizePhone(phone) : null;

  // If phone provided, try to find existing client by normalized phone
  if (normalizedPhone) {
    const { data: existing } = await supabase
      .from('clients')
      .select('*')
      .eq('normalized_phone', normalizedPhone)
      .maybeSingle();

    if (existing) return existing as Client;
  }

  // Create new client
  const { data, error } = await supabase
    .from('clients')
    .insert({
      full_name: fullName,
      phone: phone || null,
      normalized_phone: normalizedPhone || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Client;
}

export async function getClientById(id: string): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as Client;
}

export async function updateClient(id: string, updates: Partial<Pick<Client, 'full_name' | 'phone' | 'normalized_phone'>>): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Client;
}

export async function getAllClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('full_name');

  if (error) throw new Error(error.message);
  return data as Client[];
}

export async function getClientStats(): Promise<ClientStats[]> {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      client_id,
      appointment_date,
      clients (id, full_name, phone, normalized_phone, created_at, updated_at)
    `)
    .neq('status', 'cancelled')
    .order('appointment_date', { ascending: false });

  if (error) throw new Error(error.message);

  // Aggregate by client
  const clientMap = new Map<string, ClientStats>();

  for (const row of data as any[]) {
    const client = row.clients as Client;
    if (!client) continue;

    if (!clientMap.has(client.id)) {
      clientMap.set(client.id, {
        client,
        totalAppointments: 0,
        lastAppointmentDate: null,
      });
    }

    const stats = clientMap.get(client.id)!;
    stats.totalAppointments += 1;
    if (!stats.lastAppointmentDate || row.appointment_date > stats.lastAppointmentDate) {
      stats.lastAppointmentDate = row.appointment_date;
    }
  }

  return Array.from(clientMap.values()).sort((a, b) =>
    a.client.full_name.localeCompare(b.client.full_name)
  );
}
