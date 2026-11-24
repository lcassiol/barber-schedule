import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { globSync } from "node:fs";
describe("client/server boundary",()=>{ it("does not import server-only modules from client components",()=>{ const files=globSync("src/**/*.{ts,tsx}"); for(const file of files){ const source=readFileSync(file,"utf8"); if(source.startsWith('"use client"')) expect(source).not.toMatch(/@\/(db|auth|services|config)\//); } }); });
