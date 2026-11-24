import { NextResponse } from "next/server";
import { requireBarber, UnauthorizedError } from "@/auth/session";
import { bookAdmin } from "@/services/booking";
export async function POST(request: Request) { try { const barber = await requireBarber("api"); await bookAdmin(barber.id, await request.json()); return NextResponse.json({ ok:true },{status:201}); } catch(error) { return NextResponse.json({error:error instanceof UnauthorizedError?"unauthorized":"invalid appointment"},{status:error instanceof UnauthorizedError?401:400}); } }
