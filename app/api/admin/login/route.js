import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = signToken({ id: admin.id, username: admin.username });
    const res = NextResponse.json({ ok: true });
    // Set admin session cookie name used by middleware
    res.cookies.set('admin_session', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 8 });
    return res;
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
