import { describe, expect, it } from "vitest";
import { applyPattern, availability, generateSlots, localPeriodToUtc, validateDayPeriods, type WeekSchedule } from "@/domain/schedule";

describe("working periods", () => {
  it("supports closed and multiple periods", () => { expect(validateDayPeriods([])).toEqual([]); expect(validateDayPeriods([{start:"13:00",end:"17:00"},{start:"09:00",end:"12:00"}])[0].start).toBe("09:00"); });
  it("rejects invalid and overlapping periods but permits adjacency", () => { expect(() => validateDayPeriods([{start:"10:00",end:"09:00"}])).toThrow(); expect(() => validateDayPeriods([{start:"09:00",end:"12:00"},{start:"11:00",end:"13:00"}])).toThrow(/overlap/); expect(validateDayPeriods([{start:"09:00",end:"10:00"},{start:"10:00",end:"11:00"}])).toHaveLength(2); });
  it("applies independent copies only to selected days", () => { const week=Object.fromEntries(Array.from({length:7},(_,i)=>[i+1,[]])) as WeekSchedule; const result=applyPattern(week,[1,2],[{start:"09:00",end:"18:00"}]); result[1][0].start="10:00"; expect(result[2][0].start).toBe("09:00"); expect(result[3]).toEqual([]); });
});

describe("timezone slots", () => {
  it("resolves ordinary local periods to UTC", () => expect(localPeriodToUtc("2026-07-01",{start:"09:00",end:"10:00"},"America/Sao_Paulo").start.toISOString()).toBe("2026-07-01T12:00:00.000Z"));
  it("accounts for DST offset changes", () => { const winter=localPeriodToUtc("2026-01-15",{start:"09:00",end:"10:00"},"America/New_York"); const summer=localPeriodToUtc("2026-07-15",{start:"09:00",end:"10:00"},"America/New_York"); expect(winter.start.getUTCHours()).toBe(14); expect(summer.start.getUTCHours()).toBe(13); });
  it("rejects a nonexistent spring-forward local time", () => expect(() => localPeriodToUtc("2026-03-08",{start:"02:30",end:"03:30"},"America/New_York")).toThrow(/does not exist/));
  it("creates only complete one-hour windows", () => { const slots=generateSlots({start:new Date("2026-01-01T09:00:00Z"),end:new Date("2026-01-01T11:30:00Z")}); expect(slots).toHaveLength(2); expect(slots[1].start.toISOString()).toContain("10:00"); });
  it("classifies future, occupied, and past without private data", () => { const windows=[{start:new Date("2026-01-01T09:00Z"),end:new Date("2026-01-01T10:00Z")},{start:new Date("2026-01-01T10:00Z"),end:new Date("2026-01-01T11:00Z")}]; const result=availability(windows,[windows[1]],new Date("2026-01-01T09:30Z")); expect(result.map(x=>x.state)).toEqual(["unavailable","occupied"]); expect(JSON.stringify(result)).not.toMatch(/name|phone|notes|id/); });
});
