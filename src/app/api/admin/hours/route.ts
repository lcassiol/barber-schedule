import { NextResponse } from "next/server";
import { requireBarber, UnauthorizedError } from "@/auth/session";
import { getWeek, replaceWeek } from "@/db/repositories";
import { validateWeek } from "@/domain/schedule";
export async function GET() { try { const barber=await requireBarber("api"); return NextResponse.json(await getWeek(barber.id)); } catch(error) { return NextResponse.json({error:"unauthorized"},{status:error instanceof UnauthorizedError?401:500}); } }
export async function PUT(request:Request) { try { const barber=await requireBarber("api"); await replaceWeek(barber.id,validateWeek(await request.json())); return NextResponse.json({ok:true}); } catch(error) { return NextResponse.json({error:error instanceof UnauthorizedError?"unauthorized":"invalid schedule"},{status:error instanceof UnauthorizedError?401:400}); } }
