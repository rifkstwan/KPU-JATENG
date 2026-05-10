import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const { nama, jabatan, divisi } = await req.json()

  if (!nama?.trim()) {
    return NextResponse.json({ error: "Nama tidak boleh kosong" }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: userId },
    data: { nama: nama.trim(), jabatan: jabatan?.trim() || null, divisi: divisi?.trim() || null },
  })

  return NextResponse.json({ ok: true })
}