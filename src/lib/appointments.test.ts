import { describe, expect, it } from "vitest";
import { DASHBOARD_STATUSES, availableSlots, normalizePhone, formatTime, noShowCount, type Appointment } from "./appointments";

describe("dashboard status choices", () => {
  it("allows Booked, Done, No-show and Cancelled", () => {
    expect(DASHBOARD_STATUSES).toEqual(["booked", "done", "no_show", "cancelled"]);
  });
});

describe("normalizePhone", () => {
  it("treats '98200 11111' and '9820011111' as the same client", () => {
    expect(normalizePhone("98200 11111")).toBe("9820011111");
    expect(normalizePhone("9820011111")).toBe("9820011111");
    expect(normalizePhone("+91 98200 11111")).toBe("9820011111");
  });
  it("rejects blank or short numbers", () => {
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone("12345")).toBeNull();
  });
});

describe("availableSlots", () => {
  const now = new Date(2026, 9, 24, 8, 0);
  const base = { appt_date: "2026-10-24" };
  it("hides a slot already booked (no double booking)", () => {
    const slots = availableSlots("2026-10-24", [{ id: "1", ...base, appt_time: "10:00:00", status: "booked" }], now);
    expect(slots).not.toContain("10:00");
    expect(slots).toContain("10:30");
  });
  it("frees a slot when its appointment is cancelled", () => {
    const slots = availableSlots("2026-10-24", [{ id: "1", ...base, appt_time: "10:00:00", status: "cancelled" }], now);
    expect(slots).toContain("10:00");
  });
  it("hides past slots", () => {
    const slots = availableSlots("2026-10-24", [], new Date(2026, 9, 24, 12, 0));
    expect(slots).not.toContain("11:30");
    expect(slots[0]).toBe("12:30");
  });
});

describe("formatTime", () => {
  it("formats 24h to friendly 12h", () => {
    expect(formatTime("16:00:00")).toBe("4:00 pm");
    expect(formatTime("11:30")).toBe("11:30 am");
  });
});

describe("noShowCount", () => {
  it("counts no-shows for the same phone", () => {
    const a = [
      { phone: "9820033333", status: "no_show" },
      { phone: "9820033333", status: "done" },
    ] as Appointment[];
    expect(noShowCount(a, "9820033333")).toBe(1);
  });
});
