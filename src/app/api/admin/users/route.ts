import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

export async function POST(req: Request) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { nama, email, password, nip, jabatan, divisi, role } = await req.json()

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing)
    return NextResponse.json({ error: "Email sudah digunakan!" }, { status: 400 })

  if (!password || password.length < 6)
    return NextResponse.json({ error: "Password minimal 6 karakter!" }, { status: 400 })

  const hashed = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      nama, email, password: hashed,
      nip: nip || null, jabatan: jabatan || null,
      divisi: divisi || null, role: role as Role,
    },
  })

  return NextResponse.json(user)
}