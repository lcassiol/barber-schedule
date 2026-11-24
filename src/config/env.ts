import { IANAZone } from "luxon";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().url().refine((url) => url.startsWith("postgres://") || url.startsWith("postgresql://"), "must be a PostgreSQL URL"),
  PUBLIC_APP_URL: z.string().url(),
  SCHEDULE_TIMEZONE: z.string().refine(IANAZone.isValidZone, "must be a valid IANA timezone"),
  ADMIN_USERNAME: z.string().trim().min(3).max(80).optional(),
  ADMIN_PASSWORD: z.string().min(12).max(200).optional(),
  BARBER_NAME: z.string().trim().min(2).max(100).optional(),
  BARBER_SLUG: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
}).superRefine((value, ctx) => {
  const bootstrap = [value.ADMIN_USERNAME, value.ADMIN_PASSWORD, value.BARBER_NAME, value.BARBER_SLUG];
  if (bootstrap.some(Boolean) && !bootstrap.every(Boolean)) {
    ctx.addIssue({ code: "custom", message: "all bootstrap variables are required together", path: ["ADMIN_USERNAME"] });
  }
});

export type AppEnv = z.infer<typeof schema>;

export function parseEnv(source: Record<string, string | undefined>): AppEnv {
  const result = schema.safeParse(source);
  if (!result.success) {
    const fields = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    throw new Error(`Invalid environment configuration: ${fields}`);
  }
  return result.data;
}

let cached: AppEnv | undefined;
export function env(): AppEnv {
  cached ??= parseEnv(process.env);
  return cached;
}
