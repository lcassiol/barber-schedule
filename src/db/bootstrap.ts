import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { env } from "@/config/env";
import { db } from "./client";
import { adminCredentials, barbers } from "./schema";

export async function bootstrap() {
  const config = env();
  const existing = await db.select({ id: barbers.id }).from(barbers).limit(1);
  if (existing.length) {
    const credential = await db.select({ id: adminCredentials.id }).from(adminCredentials).where(eq(adminCredentials.barberId, existing[0].id)).limit(1);
    if (credential.length) return { created: false };
  }
  if (!config.ADMIN_USERNAME || !config.ADMIN_PASSWORD || !config.BARBER_NAME || !config.BARBER_SLUG) {
    throw new Error("Bootstrap required: configure ADMIN_USERNAME, ADMIN_PASSWORD, BARBER_NAME and BARBER_SLUG");
  }
  return db.transaction(async (tx) => {
    const barber = existing[0] ?? (await tx.insert(barbers).values({ name: config.BARBER_NAME!, slug: config.BARBER_SLUG!, timezone: config.SCHEDULE_TIMEZONE }).returning({ id: barbers.id }))[0];
    await tx.insert(adminCredentials).values({ barberId: barber.id, username: config.ADMIN_USERNAME!, passwordHash: await hash(config.ADMIN_PASSWORD!, 12) });
    return { created: true };
  });
}

export async function findCredential(username: string) {
  return db.select().from(adminCredentials).where(eq(adminCredentials.username, username)).limit(1);
}
