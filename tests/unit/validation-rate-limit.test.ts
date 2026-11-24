import { beforeEach, describe, expect, it } from "vitest";
import { appointmentInput } from "@/domain/validation";
import { consume, resetLimiter } from "@/services/rate-limit";
describe("appointment validation",()=>{ it("requires bounded name and phone and permits optional notes",()=>{ expect(appointmentInput.safeParse({name:"Ana",phone:"1199999999",start:"2027-01-01T10:00:00Z"}).success).toBe(true); expect(appointmentInput.safeParse({name:"",phone:"1",notes:"x".repeat(501),start:"bad"}).success).toBe(false); }); });
describe("rate limiter",()=>{ beforeEach(resetLimiter); it("limits one origin without affecting another",()=>{ expect(consume("a",2,1000,0)).toBe(true); expect(consume("a",2,1000,0)).toBe(true); expect(consume("a",2,1000,0)).toBe(false); expect(consume("admin",2,1000,0)).toBe(true); expect(consume("a",2,1000,1001)).toBe(true); }); });
