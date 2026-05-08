import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

type SppdItem = {
  id: string
  nomorSppd: string
  tujuan: string
  tglBerangkat: Date
  status: string
  user?: { nama: string } | null
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const userId = session.user.id
  const role = session.user.role

  const sppd: SppdItem[] = role === "PEGAWAI"
    ? await prisma.pengajuanSPPD.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    : await prisma.pengajuanSPPD.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { user: true },
      })

  const totalSppd = role === "PEGAWAI"
    ? await prisma.pengajuanSPPD.count({ where: { userId } })
    : await prisma.pengajuanSPPD.count()

  const totalDisetujui = role === "PEGAWAI"
    ? await prisma.pengajuanSPPD.count({ where: { userId, status: "APPROVED" } })
    : await prisma.pengajuanSPPD.count({ where: { status: "APPROVED" } })

  const totalMenunggu = role === "PEGAWAI"
    ? await prisma.pengajuanSPPD.count({ where: { userId, status: "PENDING" } })
    : await prisma.pengajuanSPPD.count({ where: { status: "PENDING" } })

  const hour = new Date().getHours()
  const greet = hour < 12 ? "Selamat pagi" : hour < 17 ? "Selamat siang" : "Selamat sore"
  const firstName = session.user.name?.split(" ")[0]

  const statusColor: Record<string, string> = {
    APPROVED: "#437a22",
    PENDING: "#d19900",
    REJECTED: "#a12c7b",
    DRAFT: "#7a7974",
  }
  const statusBg: Record<string, string> = {
    APPROVED: "#d4dfcc",
    PENDING: "#e9e0c6",
    REJECTED: "#e0ced7",
    DRAFT: "#f3f0ec",
  }
  const statusLabel: Record<string, string> = {
    APPROVED: "✓ Disetujui",
    PENDING: "○ Menunggu",
    REJECTED: "✕ Ditolak",
    DRAFT: "— Draft",
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: "1.5rem",
        flexWrap: "wrap", gap: "1rem"
      }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "4px" }}>
            {greet}, {firstName}! 👋
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#7a7974" }}>
            Ringkasan aktivitas perjalanan dinas
          </p>
        </div>
        {(role === "PEGAWAI" || role === "ADMIN") && (
          <a href="/dashboard/pengajuan" style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "#01696f", color: "white", padding: "0.5rem 1rem",
            borderRadius: "0.5rem", fontSize: "0.875rem", fontWeight: 600,
            textDecoration: "none",
          }}>
            ＋ Ajukan SPPD
          </a>
        )}
      </div>

      {/* KPI Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "1rem", marginBottom: "1.5rem"
      }}>
        {[
          { label: "Total SPPD", value: totalSppd, icon: "📋", color: "#01696f", bg: "#cedcd8" },
          { label: "Disetujui", value: totalDisetujui, icon: "✅", color: "#437a22", bg: "#d4dfcc" },
          { label: "Menunggu", value: totalMenunggu, icon: "⏳", color: "#d19900", bg: "#e9e0c6" },
          { label: "Ditolak", value: totalSppd - totalDisetujui - totalMenunggu, icon: "❌", color: "#a12c7b", bg: "#e0ced7" },
        ].map((kpi) => (
          <div key={kpi.label} style={{
            background: "white", border: "1px solid #dcd9d5",
            borderRadius: "0.75rem", padding: "1rem",
            boxShadow: "0 1px 2px rgba(0,0,0,0.06)"
          }}>
            <div style={{
              width: 36, height: 36, background: kpi.bg,
              borderRadius: "0.5rem", display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "1rem", marginBottom: "0.75rem"
            }}>
              {kpi.icon}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#7a7974", marginBottom: "0.25rem" }}>
              {kpi.label}
            </div>
            <div style={{
              fontSize: "1.75rem", fontWeight: 700,
              color: kpi.color, lineHeight: 1
            }}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabel Pengajuan Terbaru */}
      <div style={{
        background: "white", border: "1px solid #dcd9d5",
        borderRadius: "0.75rem", padding: "1.25rem",
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)"
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: "1rem"
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1rem" }}>Pengajuan Terbaru</div>
            <div style={{ fontSize: "0.75rem", color: "#7a7974" }}>5 pengajuan terakhir</div>
          </div>
          <a href="/dashboard/sppd" style={{
            fontSize: "0.75rem", color: "#01696f",
            textDecoration: "none", fontWeight: 600
          }}>
            Lihat semua →
          </a>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {(["No SPPD", role !== "PEGAWAI" ? "Pegawai" : null, "Tujuan", "Tanggal", "Status"] as (string | null)[])
                  .filter((h): h is string => h !== null)
                  .map((h) => (
                    <th key={h} style={{
                      fontSize: "0.7rem", fontWeight: 600, color: "#7a7974",
                      textTransform: "uppercase", letterSpacing: "0.05em",
                      padding: "0.5rem 0.75rem", textAlign: "left",
                      borderBottom: "1px solid #dcd9d5"
                    }}>
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {sppd.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{
                    textAlign: "center", padding: "2rem",
                    color: "#7a7974", fontSize: "0.875rem"
                  }}>
                    Belum ada pengajuan
                  </td>
                </tr>
              ) : (
                sppd.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #f3f0ec" }}>
                    <td style={{
                      padding: "0.75rem", fontSize: "0.875rem",
                      fontWeight: 600, color: "#01696f"
                    }}>
                      {s.nomorSppd}
                    </td>
                    {role !== "PEGAWAI" && (
                      <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>
                        {s.user?.nama}
                      </td>
                    )}
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>
                      {s.tujuan}
                    </td>
                    <td style={{ padding: "0.75rem", fontSize: "0.875rem", color: "#7a7974" }}>
                      {new Date(s.tglBerangkat).toLocaleDateString("id-ID")}
                    </td>
                    <td style={{ padding: "0.75rem" }}>
                      <span style={{
                        background: statusBg[s.status] || "#f3f0ec",
                        color: statusColor[s.status] || "#7a7974",
                        padding: "2px 8px", borderRadius: "9999px",
                        fontSize: "0.7rem", fontWeight: 600
                      }}>
                        {statusLabel[s.status] || s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
