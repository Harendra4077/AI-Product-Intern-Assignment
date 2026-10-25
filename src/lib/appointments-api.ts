import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Appointment, Status } from "./appointments";

const KEY = ["appointments"];

async function fetchAll(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("appt_date", { ascending: true })
    .order("appt_time", { ascending: true });
  if (error) throw error;
  return data as Appointment[];
}

/** All appointments, kept live across the client app and dashboard. */
export function useAppointments() {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase
      .channel(`appts-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () =>
        qc.invalidateQueries({ queryKey: KEY }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);
  return useQuery({ queryKey: KEY, queryFn: fetchAll });
}

function friendly(error: { code?: string; message: string }): Error {
  if (error.code === "23505") return new Error("Sorry, that slot was just taken. Please pick another time.");
  return new Error(error.message);
}

export async function createAppointment(input: {
  client_name: string;
  phone: string | null;
  appt_date: string;
  appt_time: string;
  source: "client" | "dashboard";
  status?: Status;
}) {
  const { data, error } = await supabase.from("appointments").insert(input).select().single();
  if (error) throw friendly(error);
  return data as Appointment;
}

export async function updateAppointment(id: string, patch: Partial<Appointment>) {
  const { error } = await supabase.from("appointments").update(patch).eq("id", id);
  if (error) throw friendly(error);
}

// --- "Me" on this device: the client is remembered by phone number (no login needed). ---
const ME_KEY = "kayro-me";
export type Me = { name: string; phone: string };

export function useMe() {
  const [me, setMeState] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ME_KEY);
      if (raw) setMeState(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);
  const setMe = (m: Me | null) => {
    if (m) localStorage.setItem(ME_KEY, JSON.stringify(m));
    else localStorage.removeItem(ME_KEY);
    setMeState(m);
  };
  return { me, setMe, ready };
}

export function useNow(intervalMs = 60_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}
