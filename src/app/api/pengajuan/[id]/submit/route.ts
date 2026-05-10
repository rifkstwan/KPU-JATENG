import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id: string }).id

  const existing = await prisma.pengajuanSPPD.findFirst({
    where: { id: params.id, userId, status: "DRAFT" },
  })
  if (!existing) return NextResponse.json({ error: "Tidak ditemukan / bukan DRAFT" }, { status: 404 })

  await prisma.$transaction([
    prisma.pengajuanSPPD.update({
      where: { id: params.id },
      data: { status: "PENDING" },
    }),
    prisma.notifikasi.create({
      data: {
        userId,
        sppdId: params.id,
        pesan: `Pengajuan SPPD ${existing.nomorSppd} berhasil diajukan dan menunggu persetujuan.`,
        tipe: "PENDING",
      },
    }),
  ])

  return NextResponse.json({ ok: true })
}