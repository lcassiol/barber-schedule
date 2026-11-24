import { NextResponse } from "next/server";
import { logout } from "@/auth/session";
import { env } from "@/config/env";

export async function GET() {
  await logout();
  return NextResponse.redirect(new URL("/admin/login", env().PUBLIC_APP_URL));
}
