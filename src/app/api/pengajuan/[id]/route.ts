import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const body = await req.json()
  const { tujuan, maksud, tglBerangkat, tglKembali, transport, anggaran, catatan } = body

  const existing = await prisma.pengajuanSPPD.findFirst({
    where: { id, userId },
  })
  if (!existing) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 })
  if (existing.status !== "DRAFT" && existing.status !== "REJECTED") {
    return NextResponse.json({ error: "Hanya DRAFT/REJECTED yang bisa diedit" }, { status: 400 })
  }

  const updated = await prisma.pengajuanSPPD.update({
    where: { id },
    data: {
      tujuan: tujuan.trim(),
      maksud: maksud.trim(),
      tglBerangkat: new Date(tglBerangkat),
      tglKembali: new Date(tglKembali),
      transport,
      anggaran: BigInt(anggaran ?? 0),
      catatan: catatan?.trim() || null,
    },
  })

  return NextResponse.json({
    data: {
      ...updated,
      anggaran: parseInt(updated.anggaran.toString()),
      tglBerangkat: updated.tglBerangkat.toISOString(),
      tglKembali: updated.tglKembali.toISOString(),
      createdAt: updated.createdAt.toISOString(),
    },
  })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const existing = await prisma.pengajuanSPPD.findFirst({
    where: { id, userId, status: "DRAFT" },
  })
  if (!existing) return NextResponse.json({ error: "Tidak ditemukan / bukan DRAFT" }, { status: 404 })

  await prisma.pengajuanSPPD.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}