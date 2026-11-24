import { NextResponse } from "next/server";
import { authenticate, createSession } from "@/auth/session";
import { env } from "@/config/env";

const destination = (path: string) => new URL(path, env().PUBLIC_APP_URL);

export async function POST(request: Request) {
  const formData = await request.formData();
  const credential = await authenticate(String(formData.get("username") ?? ""), String(formData.get("password") ?? ""));
  if (!credential) return NextResponse.redirect(destination("/admin/login?erro=1"), 303);
  await createSession(credential.id);
  return NextResponse.redirect(destination("/admin"), 303);
}
