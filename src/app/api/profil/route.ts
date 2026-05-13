import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id as string
    const body = await req.json()
    const { nama, jabatan, divisi } = body

    if (!nama || typeof nama !== "string" || !nama.trim()) {
      return NextResponse.json({ error: "Nama tidak boleh kosong" }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        nama: nama.trim(),
        jabatan: jabatan?.trim() || null,
        divisi: divisi?.trim() || null,
      },
      select: {
        id: true,
        nama: true,
        jabatan: true,
        divisi: true,
      },
    })

    return NextResponse.json({ data: updated })
  } catch (err) {
    console.error("[PUT /api/profil]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}