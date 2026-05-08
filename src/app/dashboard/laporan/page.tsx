import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function LaporanPage() {
  const session = await auth()
  if (!session) redirect("/login")
  if (session.user.role === "PEGAWAI") redirect("/dashboard")

  const [total, disetujui, menunggu, ditolak, recentSppd] = await Promise.all([
    prisma.pengajuanSPPD.count(),
    prisma.pengajuanSPPD.count({ where: { status: "APPROVED" } }),
    prisma.pengajuanSPPD.count({ where: { status: "PENDING" } }),
    prisma.pengajuanSPPD.count({ where: { status: "REJECTED" } }),
    prisma.pengajuanSPPD.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { nama: true } } },
    }),
  ])

  const cards = [
    { label: "Total SPPD", value: total, color: "#2563eb", icon: "📋" },
    { label: "Disetujui", value: disetujui, color: "#16a34a", icon: "✅" },
    { label: "Menunggu", value: menunggu, color: "#d97706", icon: "⏳" },
    { label: "Ditolak", value: ditolak, color: "#dc2626", icon: "❌" },
  ]

  const statusLabel: Record<string, string> = {
    PENDING: "Menunggu",
    APPROVED: "Disetujui",
    REJECTED: "Ditolak",
    DRAFT: "Draft",
  }
  const statusColor: Record<string, string> = {
    PENDING: "#d97706",
    APPROVED: "#16a34a",
    REJECTED: "#dc2626",
    DRAFT: "#6b7280",
  }

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "24px" }}>
        Laporan SPPD
      </h1>

      {/* KPI Cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px", marginBottom: "32px",
      }}>
        {cards.map(c => (
          <div key={c.label} style={{
            background: "white", border: "1px solid #e5e7eb",
            borderRadius: "8px", padding: "20px", textAlign: "center",
          }}>
            <div style={{ fontSize: "2rem" }}>{c.icon}</div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: c.color }}>{c.value}</div>
            <div style={{ color: "#666", fontSize: "0.85rem" }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Tabel Rekap */}
      <div style={{
        background: "white", border: "1px solid #e5e7eb",
        borderRadius: "8px", overflow: "hidden",
      }}>
        <div style={{
          padding: "16px", borderBottom: "1px solid #e5e7eb",
          fontWeight: 700, fontSize: "1rem",
        }}>
          10 SPPD Terbaru
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Nomor", "Pemohon", "Tujuan", "Tgl Berangkat", "Transport", "Status"].map(h => (
                <th key={h} style={{
                  padding: "10px 16px", textAlign: "left",
                  fontSize: "0.8rem", color: "#666", fontWeight: 600,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentSppd.map((s) => (
              <tr key={s.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                <td style={{ padding: "10px 16px", fontSize: "0.85rem", fontFamily: "monospace" }}>
                  {s.nomorSppd}
                </td>
                <td style={{ padding: "10px 16px", fontSize: "0.85rem" }}>
                  {s.user.nama}
                </td>
                <td style={{ padding: "10px 16px", fontSize: "0.85rem" }}>
                  {s.tujuan}
                </td>
                <td style={{ padding: "10px 16px", fontSize: "0.85rem" }}>
                  {new Date(s.tglBerangkat).toLocaleDateString("id-ID")}
                </td>
                <td style={{ padding: "10px 16px", fontSize: "0.85rem" }}>
                  {s.transport}
                </td>
                <td style={{ padding: "10px 16px" }}>
                  <span style={{
                    background: (statusColor[s.status] || "#6b7280") + "22",
                    color: statusColor[s.status] || "#6b7280",
                    padding: "2px 8px", borderRadius: "9999px",
                    fontSize: "0.75rem", fontWeight: 600,
                  }}>
                    {statusLabel[s.status] || s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}