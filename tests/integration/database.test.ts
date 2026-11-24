import { afterAll, beforeAll, describe, expect, it } from "vitest";
import postgres from "postgres";
import { readFileSync } from "node:fs";

const url=process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
const suite=url?describe:describe.skip;
suite("PostgreSQL schema",()=>{
  const sql=postgres(url ?? "",{max:4});
  beforeAll(async()=>{ const migration=readFileSync("drizzle/0000_initial.sql","utf8").replaceAll("--> statement-breakpoint",""); await sql.unsafe("DROP SCHEMA public CASCADE; CREATE SCHEMA public;"); await sql.unsafe(migration); });
  afterAll(async()=>{ await sql.unsafe("DROP SCHEMA public CASCADE; CREATE SCHEMA public;"); await sql.end(); });
  it("creates all required tables and constraints",async()=>{ const rows=await sql`select table_name from information_schema.tables where table_schema='public'`; expect(rows.map(r=>r.table_name)).toEqual(expect.arrayContaining(["barbers","admin_credentials","sessions","weekly_work_periods","appointments"])); });
  it("accepts adjacent intervals and rejects overlap",async()=>{ const [barber]=await sql`insert into barbers(name,slug,timezone) values('Test','test','UTC') returning id`; await sql`insert into appointments(barber_id,start_at,end_at,customer_name,customer_phone,source) values(${barber.id},'2027-01-01T09:00Z','2027-01-01T10:00Z','A','11111111','public'),(${barber.id},'2027-01-01T10:00Z','2027-01-01T11:00Z','B','22222222','admin')`; await expect(sql`insert into appointments(barber_id,start_at,end_at,customer_name,customer_phone,source) values(${barber.id},'2027-01-01T09:30Z','2027-01-01T10:30Z','C','33333333','public')`).rejects.toMatchObject({code:"23P01"}); });
  it("allows exactly one of two concurrent inserts",async()=>{ const [barber]=await sql`select id from barbers limit 1`; const insert=()=>sql`insert into appointments(barber_id,start_at,end_at,customer_name,customer_phone,source) values(${barber.id},'2027-01-02T09:00Z','2027-01-02T10:00Z','Race','44444444','public')`; const results=await Promise.allSettled([insert(),insert()]); expect(results.filter(r=>r.status==="fulfilled")).toHaveLength(1); });
});
