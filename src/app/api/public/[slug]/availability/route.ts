import { NextResponse } from "next/server";
import { getAvailability } from "@/services/booking";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try { const { slug } = await params; const date = new URL(request.url).searchParams.get("date"); if (!date) return NextResponse.json({ error: "date is required" }, { status: 400 }); const data = await getAvailability(slug, date); if (!data) return NextResponse.json({ error: "not found" }, { status: 404 }); return NextResponse.json({ date: data.date, slots: data.slots }); } catch { return NextResponse.json({ error: "invalid query" }, { status: 400 }); }
}
