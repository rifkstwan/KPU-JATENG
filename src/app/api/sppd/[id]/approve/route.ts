import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { StatusSPPD } from "@prisma/client"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { keputusan, approverId } = await req.json()

    await prisma.approval.create({
      data: {
        sppdId: id,
        approverId,
        keputusan: keputusan as StatusSPPD,
      },
    })

    const updated = await prisma.pengajuanSPPD.update({
      where: { id },
      data: { status: keputusan as StatusSPPD },
    })

    const pesan =
      keputusan === "APPROVED"
        ? `SPPD ${updated.nomorSppd} kamu telah disetujui`
        : `SPPD ${updated.nomorSppd} kamu ditolak`

    await prisma.notifikasi.create({
      data: {
        userId: updated.userId,
        sppdId: id,
        pesan,
        tipe: keputusan === "APPROVED" ? "APPROVED" : "REJECTED",
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[PATCH /api/sppd/:id/approve]", error)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const sppd = await prisma.pengajuanSPPD.findUnique({
      where: { id },
    })

    if (!sppd) {
      return NextResponse.json({ message: "SPPD tidak ditemukan" }, { status: 404 })
    }

    if (sppd.userId !== session.user.id && (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    if (sppd.status !== "DRAFT") {
      return NextResponse.json(
        { message: "Hanya SPPD berstatus Draft yang bisa dihapus" },
        { status: 400 }
      )
    }

    await prisma.pengajuanSPPD.delete({ where: { id } })

    return NextResponse.json({ message: "Berhasil dihapus" })
  } catch (error) {
    console.error("[DELETE /api/sppd/:id/approve]", error)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}