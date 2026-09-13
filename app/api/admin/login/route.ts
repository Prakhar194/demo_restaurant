import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/auth";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }
  await createAdminSession();
  return NextResponse.json({ ok: true });
}
