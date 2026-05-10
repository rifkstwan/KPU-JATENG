import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const { passwordLama, passwordBaru } = await req.json()

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })

  const valid = await bcrypt.compare(passwordLama, user.password)
  if (!valid) return NextResponse.json({ error: "Password lama tidak sesuai" }, { status: 400 })

  const hashed = await bcrypt.hash(passwordBaru, 12)
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } })

  return NextResponse.json({ ok: true })
}