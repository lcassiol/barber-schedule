import { check, index, integer, pgEnum, pgTable, text, time, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const appointmentSource = pgEnum("appointment_source", ["public", "admin"]);

export const barbers = pgTable("barbers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 80 }).notNull(),
  timezone: varchar("timezone", { length: 100 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("barbers_slug_idx").on(table.slug)]);

export const adminCredentials = pgTable("admin_credentials", {
  id: uuid("id").defaultRandom().primaryKey(),
  barberId: uuid("barber_id").notNull().references(() => barbers.id, { onDelete: "cascade" }),
  username: varchar("username", { length: 80 }).notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("admin_credentials_username_idx").on(table.username), uniqueIndex("admin_credentials_barber_idx").on(table.barberId)]);

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  credentialId: uuid("credential_id").notNull().references(() => adminCredentials.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [uniqueIndex("sessions_token_hash_idx").on(table.tokenHash), index("sessions_expiry_idx").on(table.expiresAt)]);

export const weeklyWorkPeriods = pgTable("weekly_work_periods", {
  id: uuid("id").defaultRandom().primaryKey(),
  barberId: uuid("barber_id").notNull().references(() => barbers.id, { onDelete: "cascade" }),
  weekday: integer("weekday").notNull(),
  startTime: time("start_time", { precision: 0 }).notNull(),
  endTime: time("end_time", { precision: 0 }).notNull(),
}, (table) => [
  check("weekly_work_periods_weekday_check", sql`${table.weekday} between 1 and 7`),
  check("weekly_work_periods_order_check", sql`${table.endTime} > ${table.startTime}`),
  index("weekly_work_periods_barber_day_idx").on(table.barberId, table.weekday),
]);

export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  barberId: uuid("barber_id").notNull().references(() => barbers.id, { onDelete: "cascade" }),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }).notNull(),
  customerName: varchar("customer_name", { length: 100 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 30 }).notNull(),
  notes: varchar("notes", { length: 500 }),
  source: appointmentSource("source").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  check("appointments_order_check", sql`${table.endAt} > ${table.startAt}`),
  check("appointments_one_hour_check", sql`${table.endAt} = ${table.startAt} + interval '1 hour'`),
  index("appointments_barber_start_idx").on(table.barberId, table.startAt),
]);
