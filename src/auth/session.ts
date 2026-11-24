import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { db } from "@/db/client";
import { env } from "@/config/env";
import { adminCredentials, barbers, sessions } from "@/db/schema";
import { findActiveSession, revokeSession } from "@/db/repositories";

export const SESSION_COOKIE = "barber_session";
const MAX_AGE = 60 * 60 * 12;
export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function authenticate(username: string, password: string) {
  const [credential] = await db.select().from(adminCredentials).where(eq(adminCredentials.username, username)).limit(1);
  if (!credential || !(await compare(password, credential.passwordHash))) return null;
  return credential;
}

export async function createSession(credentialId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + MAX_AGE * 1000);
  await db.insert(sessions).values({ credentialId, tokenHash: hashToken(token), expiresAt });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, { httpOnly: true, secure: new URL(env().PUBLIC_APP_URL).protocol === "https:", sameSite: "lax", path: "/", maxAge: MAX_AGE, expires: expiresAt });
}

export async function currentSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? findActiveSession(hashToken(token)) : undefined;
}

export async function requireSession(mode: "page" | "api" = "page") {
  const session = await currentSession();
  if (!session) {
    if (mode === "page") redirect("/admin/login");
    throw new UnauthorizedError();
  }
  return session;
}

export async function requireBarber(mode: "page" | "api" = "page") {
  const session = await requireSession(mode);
  const [barber] = await db.select({ id: barbers.id, name: barbers.name, slug: barbers.slug, timezone: barbers.timezone }).from(adminCredentials).innerJoin(barbers, eq(adminCredentials.barberId, barbers.id)).where(eq(adminCredentials.id, session.credentialId)).limit(1);
  if (!barber) throw new UnauthorizedError();
  return barber;
}

export async function logout() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await revokeSession(hashToken(token));
  store.delete(SESSION_COOKIE);
}

export class UnauthorizedError extends Error {}
