import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { nama, kontak, isi } = await req.json()

    if (!nama || !isi) {
      return NextResponse.json({ error: "Nama dan isi wajib diisi" }, { status: 400 })
    }

    const data = await prisma.kritikSaran.create({
      data: { nama, kontak: kontak || null, isi },
    })

    return NextResponse.json({ success: true, id: data.id })
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}
