import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { SlotUnavailableError } from "@/db/repositories";
import { bookPublic } from "@/services/booking";
import { consume } from "@/services/rate-limit";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const origin = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!consume(origin)) return NextResponse.json({ error: "Muitas tentativas. Aguarde um minuto." }, { status: 429 });
  try { const { slug } = await params; const body = await request.json(); if (typeof body.start === "string" && !/[zZ]|[+-]\d\d:\d\d$/.test(body.start)) body.start = new Date(body.start).toISOString(); await bookPublic(slug, body); return NextResponse.json({ ok: true }, { status: 201 }); }
  catch (error) { const message = error instanceof ZodError ? "Revise os campos obrigatórios." : error instanceof SlotUnavailableError ? error.message : error instanceof Error ? error.message : "Não foi possível reservar."; return NextResponse.json({ error: message }, { status: error instanceof SlotUnavailableError ? 409 : 400 }); }
}
