import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCMSAdmin } from "@/lib/cms-auth-guard"
import bcrypt from "bcryptjs"

export async function GET() {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  const data = await prisma.user.findMany({
    where: { role: "CMS_ADMIN" },
    select: { id: true, nama: true, email: true, role: true, jabatan: true, divisi: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  const body = await req.json()
  const { nama, email, password, jabatan, divisi } = body

  if (!nama || !email || !password) {
    return NextResponse.json({ error: "Nama, email, dan password wajib diisi" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      nama,
      email,
      password: hashed,
      jabatan: jabatan || null,
      divisi: divisi || null,
      role: "CMS_ADMIN",
    },
    select: { id: true, nama: true, email: true, role: true, jabatan: true, divisi: true, createdAt: true },
  })

  return NextResponse.json(user, { status: 201 })
}
