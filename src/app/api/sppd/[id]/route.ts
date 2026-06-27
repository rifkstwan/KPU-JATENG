import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const sppd = await prisma.pengajuanSPPD.findFirst({
    where: { id },
    include: {
      user: { select: { nama: true, jabatan: true, divisi: true, nip: true } },
      approvals: {
        include: { approver: { select: { nama: true, jabatan: true } } },
        orderBy: { approvedAt: "desc" },
      },
    },
  })

  if (!sppd) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 })

  return NextResponse.json({ ...sppd, anggaran: sppd.anggaran.toString() })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id
  const isAdmin = session.user.role === "ADMIN"

  const sppd = await prisma.pengajuanSPPD.findFirst({
    where: { id, ...(isAdmin ? {} : { userId }) },
  })

  if (!sppd) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 })
  if (!isAdmin && sppd.status !== "DRAFT") {
    return NextResponse.json({ error: "Hanya DRAFT yang bisa dihapus" }, { status: 400 })
  }

  await prisma.pengajuanSPPD.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = session.user.id
  const body = await req.json()

  const sppd = await prisma.pengajuanSPPD.findFirst({
    where: { id, userId },
  })

  if (!sppd) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 })
  if (!["DRAFT", "REJECTED"].includes(sppd.status)) {
    return NextResponse.json({ error: "Hanya DRAFT/REJECTED yang bisa diedit" }, { status: 400 })
  }

  const updated = await prisma.pengajuanSPPD.update({
    where: { id },
    data: {
      tujuan: body.tujuan?.trim(),
      maksud: body.maksud?.trim(),
      tglBerangkat: body.tglBerangkat ? new Date(body.tglBerangkat) : undefined,
      tglKembali: body.tglKembali ? new Date(body.tglKembali) : undefined,
      tempatBerangkat: body.tempatBerangkat?.trim(),
      tingkatBiaya: body.tingkatBiaya?.trim(),
      kodeAkun: body.kodeAkun?.trim(),
      transport: body.transport,
      anggaran: body.anggaran != null ? BigInt(body.anggaran) : undefined,
      catatan: body.catatan?.trim() || null,
    },
  })

  return NextResponse.json({ ...updated, anggaran: updated.anggaran.toString() })
}
