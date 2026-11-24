import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, sqlClient } from "./client";

await migrate(db, { migrationsFolder: "drizzle" });
await sqlClient.end();
console.info("Database migrations completed");
