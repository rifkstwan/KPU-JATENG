import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ApprovalClient from "./client"

export default async function ApprovalPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id: approverId, role } = session.user as { id: string; role: string }
  if (!["APPROVER", "ADMIN"].includes(role)) redirect("/dashboard")

  const rawData = await prisma.pengajuanSPPD.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { nama: true, nip: true, jabatan: true, divisi: true } },
      approvals: {
        include: { approver: { select: { nama: true } } },
        orderBy: { approvedAt: "desc" },
      },
    },
  })

  const riwayat = await prisma.approval.findMany({
    where: { approverId },
    orderBy: { approvedAt: "desc" },
    take: 20,
    include: {
      sppd: {
        select: {
          nomorSppd: true, tujuan: true, anggaran: true,
          tglBerangkat: true, tglKembali: true,
          user: { select: { nama: true } },
        },
      },
    },
  })

  const data = rawData.map(item => ({
    id: item.id,
    nomorSppd: item.nomorSppd,
    tujuan: item.tujuan,
    maksud: item.maksud,
    transport: item.transport,
    anggaran: parseInt(item.anggaran.toString()),
    catatan: item.catatan,
    status: item.status,
    tglBerangkat: item.tglBerangkat.toISOString(),
    tglKembali: item.tglKembali.toISOString(),
    createdAt: item.createdAt.toISOString(),
    user: item.user,
  }))

  const riwayatData = riwayat.map(r => ({
    id: r.id,
    keputusan: r.keputusan,
    catatan: r.catatan,
    approvedAt: r.approvedAt.toISOString(),
    sppd: {
      nomorSppd: r.sppd.nomorSppd,
      tujuan: r.sppd.tujuan,
      anggaran: parseInt(r.sppd.anggaran.toString()),
      tglBerangkat: r.sppd.tglBerangkat.toISOString(),
      tglKembali: r.sppd.tglKembali.toISOString(),
      user: r.sppd.user,
    },
  }))

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#1a1f36", margin: 0 }}>
          Review Pengajuan SPPD
        </h1>
        <p style={{ fontSize: "13px", color: "#8f95a3", margin: "4px 0 0" }}>
          {data.length > 0
            ? `${data.length} pengajuan menunggu keputusan Anda`
            : "Semua pengajuan sudah diproses"}
        </p>
      </div>
      <ApprovalClient pending={data} riwayat={riwayatData} />
    </div>
  )
}