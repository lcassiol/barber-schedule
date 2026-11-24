"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBarber, requireSession } from "@/auth/session";
import { bookAdmin } from "@/services/booking";
import { replaceWeek } from "@/db/repositories";
import { applyPattern, validateWeek, type WeekSchedule, type WorkPeriod } from "@/domain/schedule";
import { DateTime } from "luxon";

export async function createAdminAppointment(formData: FormData) {
  await requireSession();
  const barber = await requireBarber();
  try {
    const localStart = DateTime.fromISO(String(formData.get("start")), { zone: barber.timezone });
    if (!localStart.isValid) throw new Error("Invalid start");
    await bookAdmin(barber.id, { name: formData.get("name"), phone: formData.get("phone"), notes: formData.get("notes"), start: localStart.toUTC().toISO() });
  } catch { redirect("/admin?erro=horario"); }
  revalidatePath("/admin"); redirect("/admin?salvo=1");
}

function periodsFor(formData: FormData, day: number): WorkPeriod[] {
  const periods: WorkPeriod[] = [];
  for (let row = 1; row <= 2; row += 1) {
    const start = String(formData.get(`day-${day}-start-${row}`) ?? ""); const end = String(formData.get(`day-${day}-end-${row}`) ?? "");
    if (start || end) periods.push({ start, end });
  }
  return periods;
}

export async function saveWeek(formData: FormData) {
  await requireSession(); const barber = await requireBarber();
  try {
    let week = Object.fromEntries(Array.from({ length: 7 }, (_, index) => [index + 1, periodsFor(formData, index + 1)])) as WeekSchedule;
    const selected = formData.getAll("pattern-day").map(Number);
    if (selected.length) week = applyPattern(week, selected, [{ start: String(formData.get("pattern-start")), end: String(formData.get("pattern-end")) }]);
    await replaceWeek(barber.id, validateWeek(week));
  } catch { redirect("/admin/horarios?erro=1"); }
  revalidatePath("/admin/horarios"); redirect("/admin/horarios?salvo=1");
}
