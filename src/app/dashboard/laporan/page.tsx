import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import LaporanClient from "./client"

export default async function LaporanPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const role = (session.user as { role: string }).role
  if (!["APPROVER", "ADMIN"].includes(role)) redirect("/dashboard")

  // Ambil semua SPPD yang sudah final (APPROVED / REJECTED)
  const rawData = await prisma.pengajuanSPPD.findMany({
    where: { status: { in: ["APPROVED", "REJECTED"] } },
    include: {
      user: { select: { nama: true, nip: true, jabatan: true, divisi: true } },
      approvals: {
        include: { approver: { select: { nama: true } } },
        orderBy: { approvedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const data = rawData.map((item) => ({
    id: item.id,
    nomorSppd: item.nomorSppd,
    tujuan: item.tujuan,
    maksud: item.maksud,
    transport: item.transport,
    anggaran: parseInt(item.anggaran.toString()),
    status: item.status,
    tglBerangkat: item.tglBerangkat.toISOString(),
    tglKembali: item.tglKembali.toISOString(),
    createdAt: item.createdAt.toISOString(),
    user: item.user,
    approver: item.approvals[0]?.approver?.nama ?? null,
    approvedAt: item.approvals[0]?.approvedAt?.toISOString() ?? null,
  }))

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#1a1f36", margin: 0, letterSpacing: "-0.3px" }}>
          Laporan SPPD
        </h1>
        <p style={{ fontSize: "13px", color: "#8f95a3", margin: "4px 0 0" }}>
          Rekap dan statistik pengajuan SPPD yang telah diproses
        </p>
      </div>
      <LaporanClient data={data} />
    </div>
  )
}