import { describe, expect, it } from "vitest";
import { parseEnv } from "@/config/env";

const valid = { DATABASE_URL: "postgres://user:pass@localhost:5432/barber", PUBLIC_APP_URL: "http://localhost:3000", SCHEDULE_TIMEZONE: "America/Sao_Paulo", NODE_ENV: "test" };
describe("environment", () => {
  it("accepts a valid minimal environment", () => expect(parseEnv(valid).SCHEDULE_TIMEZONE).toBe("America/Sao_Paulo"));
  it("reports missing fields without values or secrets", () => { expect(() => parseEnv({ ADMIN_PASSWORD: "an extremely secret password" })).toThrow(/DATABASE_URL/); try { parseEnv({ ADMIN_PASSWORD: "an extremely secret password" }); } catch (error) { expect(String(error)).not.toContain("extremely secret"); } });
  it("rejects invalid zones and partial bootstrap", () => { expect(() => parseEnv({ ...valid, SCHEDULE_TIMEZONE: "Mars/Olympus" })).toThrow(/IANA/); expect(() => parseEnv({ ...valid, ADMIN_USERNAME: "admin" })).toThrow(/bootstrap/); });
});
