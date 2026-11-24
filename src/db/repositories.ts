import "server-only";
import { and, asc, eq, gt, isNull, lt } from "drizzle-orm";
import type { AppointmentInput } from "@/domain/validation";
import type { WeekSchedule } from "@/domain/schedule";
import { db } from "./client";
import { appointments, barbers, sessions, weeklyWorkPeriods } from "./schema";

export async function getBarberBySlug(slug: string) {
  const [barber] = await db.select().from(barbers).where(eq(barbers.slug, slug)).limit(1);
  return barber;
}

export async function getOnlyBarber() {
  const [barber] = await db.select().from(barbers).limit(1);
  return barber;
}

export async function getWeek(barberId: string): Promise<WeekSchedule> {
  const rows = await db.select().from(weeklyWorkPeriods).where(eq(weeklyWorkPeriods.barberId, barberId)).orderBy(asc(weeklyWorkPeriods.weekday), asc(weeklyWorkPeriods.startTime));
  const week = Object.fromEntries(Array.from({ length: 7 }, (_, index) => [index + 1, []])) as WeekSchedule;
  for (const row of rows) week[row.weekday].push({ start: row.startTime.slice(0, 5), end: row.endTime.slice(0, 5) });
  return week;
}

export async function replaceWeek(barberId: string, week: WeekSchedule) {
  await db.transaction(async (tx) => {
    await tx.delete(weeklyWorkPeriods).where(eq(weeklyWorkPeriods.barberId, barberId));
    const values = Object.entries(week).flatMap(([weekday, periods]) => periods.map((period) => ({ barberId, weekday: Number(weekday), startTime: period.start, endTime: period.end })));
    if (values.length) await tx.insert(weeklyWorkPeriods).values(values);
  });
}

export async function listAppointments(barberId: string, start: Date, end: Date) {
  return db.select().from(appointments).where(and(eq(appointments.barberId, barberId), lt(appointments.startAt, end), gt(appointments.endAt, start))).orderBy(asc(appointments.startAt));
}

export async function createAppointment(barberId: string, input: AppointmentInput, source: "public" | "admin") {
  const startAt = new Date(input.start);
  const endAt = new Date(startAt.getTime() + 60 * 60_000);
  try {
    const [created] = await db.transaction((tx) => tx.insert(appointments).values({ barberId, startAt, endAt, customerName: input.name, customerPhone: input.phone, notes: input.notes, source }).returning({ id: appointments.id }));
    return created;
  } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "23P01") throw new SlotUnavailableError();
    throw error;
  }
}

export class SlotUnavailableError extends Error {
  constructor() { super("Este horário não está mais disponível."); }
}

export async function findActiveSession(tokenHash: string) {
  const [session] = await db.select().from(sessions).where(and(eq(sessions.tokenHash, tokenHash), isNull(sessions.revokedAt), gt(sessions.expiresAt, new Date()))).limit(1);
  return session;
}

export async function revokeSession(tokenHash: string) {
  await db.update(sessions).set({ revokedAt: new Date() }).where(eq(sessions.tokenHash, tokenHash));
}
