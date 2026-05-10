import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import SppdList from "./list"

export default async function SppdPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const isAdminOrApprover = ["ADMIN", "APPROVER"].includes(session.user.role ?? "")

  const rawData = await prisma.pengajuanSPPD.findMany({
    where: isAdminOrApprover ? {} : { userId: session.user.id },
    include: {
      user: { select: { nama: true, jabatan: true, divisi: true } },
      approvals: {
        include: { approver: { select: { nama: true } } },
        orderBy: { approvedAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  })

  // Serialize BigInt + Date → string (tidak bisa langsung pass ke Client Component)
  const data = rawData.map((item) => ({
    ...item,
    anggaran: item.anggaran.toString(),
    tglBerangkat: item.tglBerangkat.toISOString(),
    tglKembali: item.tglKembali.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    approvals: item.approvals.map((a) => ({
      ...a,
      approvedAt: a.approvedAt.toISOString(),
    })),
  }))

  return (
    <div>
      {/* Page Header */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        justifyContent: "space-between", marginBottom: "24px",
      }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#1a1f36", margin: 0, letterSpacing: "-0.3px" }}>
            Daftar SPPD
          </h1>
          <p style={{ fontSize: "13px", color: "#8f95a3", margin: "4px 0 0" }}>
            {isAdminOrApprover
              ? "Semua pengajuan SPPD pegawai"
              : "Riwayat pengajuan perjalanan dinas Anda"}
          </p>
        </div>

        {!isAdminOrApprover && (
          <Link href="/dashboard/pengajuan" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "10px 18px", borderRadius: "10px",
            background: "#00205b", color: "#fff",
            fontSize: "13px", fontWeight: 700,
            textDecoration: "none",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Ajukan SPPD
          </Link>
        )}
      </div>

      <SppdList data={data} role={session.user.role} />
    </div>
  )
}