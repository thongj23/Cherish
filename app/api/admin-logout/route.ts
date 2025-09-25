import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({ ok: true })
  // Expire the cookie
  res.headers.append("Set-Cookie", "admin_session=; Path=/; HttpOnly; Max-Age=0;")
  return res
}

