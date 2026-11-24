import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalDb = globalThis as unknown as { sqlClient?: ReturnType<typeof postgres> };
// Route modules are evaluated during `next build`; the real URL is mandatory when a query runs.
const connectionString = process.env.DATABASE_URL ?? "postgres://invalid:invalid@127.0.0.1:5432/invalid";
export const sqlClient = globalDb.sqlClient ?? postgres(connectionString, { max: 10, prepare: false });
if (process.env.NODE_ENV !== "production") globalDb.sqlClient = sqlClient;
export const db = drizzle(sqlClient, { schema });
export type Database = typeof db;
