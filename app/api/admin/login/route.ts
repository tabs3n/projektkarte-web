import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Falsches Passwort' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_session', password, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })
  return res
}
