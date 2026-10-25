-- ============================================================
-- Kayro Appointment Platform – Database Migration
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: nutritionists
-- ============================================================
CREATE TABLE IF NOT EXISTS nutritionists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT,
  consultation_duration_minutes INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: clients
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT,
  normalized_phone TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: appointments
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  nutritionist_id UUID NOT NULL REFERENCES nutritionists(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked'
    CHECK (status IN ('booked', 'done', 'no_show', 'cancelled')),
  attendance_confirmation TEXT NOT NULL DEFAULT 'pending'
    CHECK (attendance_confirmation IN ('pending', 'confirmed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLE: reminder_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS reminder_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24h', '2h', 'custom')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  delivery_status TEXT NOT NULL DEFAULT 'simulated'
    CHECK (delivery_status IN ('simulated', 'pending', 'sent', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_nutritionist_id ON appointments(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_clients_normalized_phone ON clients(normalized_phone);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_appointment_id ON reminder_logs(appointment_id);

-- ============================================================
-- UNIQUE CONSTRAINT: prevent double-booking active slots
-- ============================================================
-- An active appointment is one that is NOT cancelled.
-- We use a partial unique index for this.
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_appointment
  ON appointments(nutritionist_id, appointment_date, start_time)
  WHERE status != 'cancelled';

-- ============================================================
-- FUNCTION: updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- FUNCTION: book_appointment (atomic, prevents race conditions)
-- ============================================================
CREATE OR REPLACE FUNCTION book_appointment(
  p_client_id UUID,
  p_nutritionist_id UUID,
  p_appointment_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_notes TEXT DEFAULT NULL
)
RETURNS appointments AS $$
DECLARE
  v_conflict_count INTEGER;
  v_appointment appointments;
BEGIN
  -- Lock check: count active (non-cancelled) appointments at this slot
  SELECT COUNT(*) INTO v_conflict_count
  FROM appointments
  WHERE nutritionist_id = p_nutritionist_id
    AND appointment_date = p_appointment_date
    AND start_time = p_start_time
    AND status != 'cancelled'
  FOR UPDATE;

  IF v_conflict_count > 0 THEN
    RAISE EXCEPTION 'SLOT_UNAVAILABLE: This time slot is already booked.';
  END IF;

  -- Validate date is not in the past
  IF p_appointment_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'PAST_DATE: Cannot book appointments in the past.';
  END IF;

  INSERT INTO appointments (
    client_id, nutritionist_id, appointment_date,
    start_time, end_time, notes, status, attendance_confirmation
  ) VALUES (
    p_client_id, p_nutritionist_id, p_appointment_date,
    p_start_time, p_end_time, p_notes, 'booked', 'pending'
  ) RETURNING * INTO v_appointment;

  RETURN v_appointment;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: reschedule_appointment (atomic)
-- ============================================================
CREATE OR REPLACE FUNCTION reschedule_appointment(
  p_appointment_id UUID,
  p_new_date DATE,
  p_new_start_time TIME,
  p_new_end_time TIME
)
RETURNS appointments AS $$
DECLARE
  v_conflict_count INTEGER;
  v_appointment appointments;
  v_nutritionist_id UUID;
BEGIN
  -- Get the appointment's nutritionist
  SELECT nutritionist_id INTO v_nutritionist_id
  FROM appointments
  WHERE id = p_appointment_id AND status = 'booked';

  IF v_nutritionist_id IS NULL THEN
    RAISE EXCEPTION 'INVALID_APPOINTMENT: Appointment not found or not reschedule-eligible.';
  END IF;

  -- Validate new date is not in the past
  IF p_new_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'PAST_DATE: Cannot reschedule to a past date.';
  END IF;

  -- Check conflict on new slot (excluding current appointment)
  SELECT COUNT(*) INTO v_conflict_count
  FROM appointments
  WHERE nutritionist_id = v_nutritionist_id
    AND appointment_date = p_new_date
    AND start_time = p_new_start_time
    AND status != 'cancelled'
    AND id != p_appointment_id
  FOR UPDATE;

  IF v_conflict_count > 0 THEN
    RAISE EXCEPTION 'SLOT_UNAVAILABLE: The new time slot is already booked.';
  END IF;

  UPDATE appointments
  SET
    appointment_date = p_new_date,
    start_time = p_new_start_time,
    end_time = p_new_end_time,
    attendance_confirmation = 'pending',
    updated_at = NOW()
  WHERE id = p_appointment_id
  RETURNING * INTO v_appointment;

  RETURN v_appointment;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — open for demo
-- ============================================================
-- For the demo, we enable RLS but allow public read/write.
-- In production, tighten these policies to per-user access.

ALTER TABLE nutritionists ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "public_read_nutritionists" ON nutritionists;
DROP POLICY IF EXISTS "public_read_clients" ON clients;
DROP POLICY IF EXISTS "public_write_clients" ON clients;
DROP POLICY IF EXISTS "public_read_appointments" ON appointments;
DROP POLICY IF EXISTS "public_write_appointments" ON appointments;
DROP POLICY IF EXISTS "public_read_reminders" ON reminder_logs;
DROP POLICY IF EXISTS "public_write_reminders" ON reminder_logs;

CREATE POLICY "public_read_nutritionists" ON nutritionists FOR SELECT USING (true);

CREATE POLICY "public_read_clients" ON clients FOR SELECT USING (true);
CREATE POLICY "public_write_clients" ON clients FOR ALL USING (true);

CREATE POLICY "public_read_appointments" ON appointments FOR SELECT USING (true);
CREATE POLICY "public_write_appointments" ON appointments FOR ALL USING (true);

CREATE POLICY "public_read_reminders" ON reminder_logs FOR SELECT USING (true);
CREATE POLICY "public_write_reminders" ON reminder_logs FOR ALL USING (true);
