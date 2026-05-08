import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { StatusSPPD } from "@prisma/client"

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
  const pesan = keputusan === "APPROVED"
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