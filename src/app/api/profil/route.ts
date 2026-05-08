import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()

  if (body.type === "info") {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        nama: body.nama,
        nip: body.nip || null,
        jabatan: body.jabatan || null,
        divisi: body.divisi || null,
      },
    })
    return NextResponse.json(updated)
  }

  if (body.type === "password") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })
    if (!user) return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })

    const valid = await bcrypt.compare(body.passwordLama, user.password)
    if (!valid) return NextResponse.json({ error: "Password lama salah!" }, { status: 400 })

    const hashed = await bcrypt.hash(body.passwordBaru, 10)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 })
}