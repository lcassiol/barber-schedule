import "server-only";
import { DateTime } from "luxon";
import { appointmentInput } from "@/domain/validation";
import { availability, generateSlots, localPeriodToUtc } from "@/domain/schedule";
import { createAppointment, getBarberBySlug, getWeek, listAppointments } from "@/db/repositories";

export async function getAvailability(slug: string, date: string, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date");
  const barber = await getBarberBySlug(slug);
  if (!barber) return null;
  const local = DateTime.fromISO(date, { zone: barber.timezone });
  if (!local.isValid || Math.abs(local.diffNow("days").days) > 62) throw new Error("Date outside allowed range");
  const week = await getWeek(barber.id);
  const periods = week[local.weekday] ?? [];
  const slots = periods.flatMap((period) => generateSlots(localPeriodToUtc(date, period, barber.timezone)));
  const dayStart = local.startOf("day").toUTC().toJSDate();
  const dayEnd = local.plus({ days: 1 }).startOf("day").toUTC().toJSDate();
  const existing = await listAppointments(barber.id, dayStart, dayEnd);
  return { barber: { name: barber.name, slug: barber.slug, timezone: barber.timezone }, date, slots: availability(slots, existing.map((item) => ({ start: item.startAt, end: item.endAt })), now) };
}

export async function bookPublic(slug: string, unknownInput: unknown) {
  const input = appointmentInput.parse(unknownInput);
  const barber = await getBarberBySlug(slug);
  if (!barber) throw new Error("Agenda não encontrada");
  const start = new Date(input.start);
  if (start <= new Date()) throw new Error("Escolha um horário futuro");
  const local = DateTime.fromJSDate(start, { zone: barber.timezone });
  const available = await getAvailability(slug, local.toISODate()!);
  if (!available?.slots.some((slot) => slot.start === start.toISOString() && slot.state === "available")) throw new Error("Horário fora do expediente ou indisponível");
  await createAppointment(barber.id, input, "public");
}

export async function bookAdmin(barberId: string, unknownInput: unknown) {
  const input = appointmentInput.parse(unknownInput);
  if (new Date(input.start) <= new Date()) throw new Error("Escolha um horário futuro");
  return createAppointment(barberId, input, "admin");
}
