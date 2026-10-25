-- ============================================================
-- Kayro Appointment Platform – Seed Script
-- ============================================================
-- This is idempotent: running it multiple times won't create duplicates.
-- ============================================================

-- Insert demo nutritionist
INSERT INTO nutritionists (id, full_name, email, consultation_duration_minutes)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Dr. Priya Sharma',
  'priya.sharma@kayro.health',
  30
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Insert clients (with normalized phone numbers)
-- ============================================================

-- Riya Shah (appears twice in the data, one client record)
INSERT INTO clients (id, full_name, phone, normalized_phone)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'Riya Shah',
  '98200 11111',
  '9820011111'
)
ON CONFLICT (normalized_phone) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      updated_at = NOW();

-- Arjun Mehta
INSERT INTO clients (id, full_name, phone, normalized_phone)
VALUES (
  '00000000-0000-0000-0000-000000000011',
  'Arjun Mehta',
  '98200 22222',
  '9820022222'
)
ON CONFLICT (normalized_phone) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      updated_at = NOW();

-- Meera Iyer (no phone number provided)
INSERT INTO clients (id, full_name, phone, normalized_phone)
VALUES (
  '00000000-0000-0000-0000-000000000012',
  'Meera Iyer',
  NULL,
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- Kabir Rao
INSERT INTO clients (id, full_name, phone, normalized_phone)
VALUES (
  '00000000-0000-0000-0000-000000000013',
  'Kabir Rao',
  '98200 33333',
  '9820033333'
)
ON CONFLICT (normalized_phone) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      updated_at = NOW();

-- ============================================================
-- Insert appointments
-- ============================================================

-- 1. Riya Shah | 2026-10-24 | 10:00 | booked
INSERT INTO appointments (
  id, client_id, nutritionist_id,
  appointment_date, start_time, end_time,
  status, attendance_confirmation
) VALUES (
  '00000000-0000-0000-0000-000000000101',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  '2026-10-24', '10:00', '10:30',
  'booked', 'pending'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = NOW();

-- 2. Arjun Mehta | 2026-10-24 | 11:30 | booked
INSERT INTO appointments (
  id, client_id, nutritionist_id,
  appointment_date, start_time, end_time,
  status, attendance_confirmation
) VALUES (
  '00000000-0000-0000-0000-000000000102',
  '00000000-0000-0000-0000-000000000011',
  '00000000-0000-0000-0000-000000000001',
  '2026-10-24', '11:30', '12:00',
  'booked', 'pending'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = NOW();

-- 3. Riya Shah | 2026-10-25 | 16:00 | booked (same client as #1)
INSERT INTO appointments (
  id, client_id, nutritionist_id,
  appointment_date, start_time, end_time,
  status, attendance_confirmation
) VALUES (
  '00000000-0000-0000-0000-000000000103',
  '00000000-0000-0000-0000-000000000010',
  '00000000-0000-0000-0000-000000000001',
  '2026-10-25', '16:00', '16:30',
  'booked', 'pending'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = NOW();

-- 4. Meera Iyer | 2026-10-23 | 09:00 | done
INSERT INTO appointments (
  id, client_id, nutritionist_id,
  appointment_date, start_time, end_time,
  status, attendance_confirmation
) VALUES (
  '00000000-0000-0000-0000-000000000104',
  '00000000-0000-0000-0000-000000000012',
  '00000000-0000-0000-0000-000000000001',
  '2026-10-23', '09:00', '09:30',
  'done', 'confirmed'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = NOW();

-- 5. Kabir Rao | 2026-10-22 | 14:00 | no_show
INSERT INTO appointments (
  id, client_id, nutritionist_id,
  appointment_date, start_time, end_time,
  status, attendance_confirmation
) VALUES (
  '00000000-0000-0000-0000-000000000105',
  '00000000-0000-0000-0000-000000000013',
  '00000000-0000-0000-0000-000000000001',
  '2026-10-22', '14:00', '14:30',
  'no_show', 'pending'
)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = NOW();
