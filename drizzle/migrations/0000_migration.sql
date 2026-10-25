CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  phone text,
  appt_date date NOT NULL,
  appt_time time NOT NULL,
  status text NOT NULL DEFAULT 'booked' CHECK (status IN ('booked','done','no_show','cancelled')),
  confirmed_at timestamptz,
  source text NOT NULL DEFAULT 'client' CHECK (source IN ('client','dashboard','import')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.appointments TO anon, authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON public.appointments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public insert" ON public.appointments FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public update" ON public.appointments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE UNIQUE INDEX appointments_no_double_booking ON public.appointments (appt_date, appt_time) WHERE status <> 'cancelled';
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- Sample data, normalised: phones to 10 digits, dates to ISO, times to 24h.
INSERT INTO public.appointments (client_name, phone, appt_date, appt_time, status, source) VALUES
('Riya Shah','9820011111','2026-10-24','10:00','booked','import'),
('Arjun Mehta','9820022222','2026-10-24','11:30','booked','import'),
('Riya Shah','9820011111','2026-10-25','16:00','booked','import'),
('Meera Iyer',NULL,'2026-10-23','09:00','done','import'),
('Kabir Rao','9820033333','2026-10-22','14:00','no_show','import');