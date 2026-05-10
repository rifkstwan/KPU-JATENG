import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: approverId, role } = session.user as { id: string; role: string }
  if (!["APPROVER", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { keputusan, catatan } = await req.json()

  if (!["APPROVED", "REJECTED"].includes(keputusan)) {
    return NextResponse.json({ error: "Keputusan tidak valid" }, { status: 400 })
  }
  if (keputusan === "REJECTED" && !catatan?.trim()) {
    return NextResponse.json({ error: "Catatan wajib diisi saat menolak" }, { status: 400 })
  }

  const sppd = await prisma.pengajuanSPPD.findFirst({
    where: { id: params.id, status: "PENDING" },
    include: { user: { select: { id: true, nama: true } } },
  })
  if (!sppd) return NextResponse.json({ error: "Pengajuan tidak ditemukan atau sudah diproses" }, { status: 404 })

  const [approval] = await prisma.$transaction([
    prisma.approval.create({
      data: {
        sppdId: params.id,
        approverId,
        keputusan,
        catatan: catatan?.trim() || null,
      },
    }),
    prisma.pengajuanSPPD.update({
      where: { id: params.id },
      data: { status: keputusan },
    }),
    prisma.notifikasi.create({
      data: {
        userId: sppd.user.id,
        sppdId: params.id,
        pesan: keputusan === "APPROVED"
          ? `Pengajuan SPPD ${sppd.nomorSppd} Anda telah disetujui.`
          : `Pengajuan SPPD ${sppd.nomorSppd} Anda ditolak.${catatan ? ` Alasan: ${catatan}` : ""}`,
        tipe: keputusan,
      },
    }),
  ])

  return NextResponse.json({ ok: true, approvalId: approval.id })
}