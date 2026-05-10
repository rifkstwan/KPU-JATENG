import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { StatusSPPD } from "@prisma/client"

// ── PATCH /api/sppd/[id] — Approval keputusan ──
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { keputusan, approverId } = await req.json()

  // Simpan record approval
  await prisma.approval.create({
    data: {
      sppdId: params.id,
      approverId,
      keputusan: keputusan as StatusSPPD,
    },
  })

  // Update status pengajuan
  const updated = await prisma.pengajuanSPPD.update({
    where: { id: params.id },
    data: { status: keputusan as StatusSPPD },
  })

  // Kirim notifikasi ke pemohon
  const pesan =
    keputusan === "APPROVED"
      ? `SPPD ${updated.nomorSppd} kamu telah disetujui ✅`
      : `SPPD ${updated.nomorSppd} kamu ditolak ❌`

  await prisma.notifikasi.create({
    data: {
      userId: updated.userId,
      sppdId: params.id,
      pesan,
      tipe: keputusan === "APPROVED" ? "APPROVED" : "REJECTED",
    },
  })

  return NextResponse.json(updated)
}

// ── DELETE /api/sppd/[id] — Hapus SPPD berstatus DRAFT ──
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const sppd = await prisma.pengajuanSPPD.findUnique({
      where: { id: params.id },
    })

    if (!sppd) {
      return NextResponse.json({ message: "SPPD tidak ditemukan" }, { status: 404 })
    }

    // Hanya pemilik atau ADMIN yang bisa hapus
    if (sppd.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Hanya DRAFT yang bisa dihapus
    if (sppd.status !== "DRAFT") {
      return NextResponse.json(
        { message: "Hanya SPPD berstatus Draft yang bisa dihapus" },
        { status: 400 }
      )
    }

    await prisma.pengajuanSPPD.delete({ where: { id: params.id } })

    return NextResponse.json({ message: "Berhasil dihapus" })
  } catch (error) {
    console.error("[DELETE /api/sppd/:id]", error)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}