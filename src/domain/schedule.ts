import { DateTime, IANAZone } from "luxon";

export type WorkPeriod = { start: string; end: string };
export type WeekSchedule = Record<number, WorkPeriod[]>;
export type TimeWindow = { start: Date; end: Date };

const TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export function validateDayPeriods(periods: WorkPeriod[]): WorkPeriod[] {
  const sorted = periods.map((period) => ({ ...period })).sort((a, b) => a.start.localeCompare(b.start));
  for (const period of sorted) {
    if (!TIME.test(period.start) || !TIME.test(period.end)) throw new Error("Use times in HH:mm format");
    if (period.end <= period.start) throw new Error("Period end must be after its start");
  }
  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index].start < sorted[index - 1].end) throw new Error("Work periods cannot overlap");
  }
  return sorted;
}

export function validateWeek(schedule: WeekSchedule): WeekSchedule {
  const result = {} as WeekSchedule;
  for (let day = 1; day <= 7; day += 1) result[day] = validateDayPeriods(schedule[day] ?? []);
  return result;
}

export function applyPattern(schedule: WeekSchedule, days: number[], periods: WorkPeriod[]): WeekSchedule {
  const result = structuredClone(schedule);
  const validated = validateDayPeriods(periods);
  for (const day of days) result[day] = validated.map((period) => ({ ...period }));
  return result;
}

export function localPeriodToUtc(date: string, period: WorkPeriod, zone: string): TimeWindow {
  if (!IANAZone.isValidZone(zone)) throw new Error("Invalid IANA timezone");
  validateDayPeriods([period]);
  const start = DateTime.fromISO(`${date}T${period.start}`, { zone });
  const end = DateTime.fromISO(`${date}T${period.end}`, { zone });
  if (!start.isValid || !end.isValid || start.toFormat("HH:mm") !== period.start || end.toFormat("HH:mm") !== period.end) {
    throw new Error("Local time does not exist in this timezone");
  }
  return { start: start.toUTC().toJSDate(), end: end.toUTC().toJSDate() };
}

export function generateSlots(window: TimeWindow, durationMinutes = 60): TimeWindow[] {
  if (durationMinutes <= 0) throw new Error("Duration must be positive");
  const slots: TimeWindow[] = [];
  let cursor = window.start.getTime();
  const duration = durationMinutes * 60_000;
  while (cursor + duration <= window.end.getTime()) {
    slots.push({ start: new Date(cursor), end: new Date(cursor + duration) });
    cursor += duration;
  }
  return slots;
}

export function overlaps(a: TimeWindow, b: TimeWindow): boolean {
  return a.start < b.end && b.start < a.end;
}

export function availability(windows: TimeWindow[], appointments: TimeWindow[], now = new Date()) {
  return windows.map((window) => ({
    start: window.start.toISOString(),
    end: window.end.toISOString(),
    state: window.start <= now ? "unavailable" as const : appointments.some((item) => overlaps(window, item)) ? "occupied" as const : "available" as const,
  }));
}
