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
    ? await prisma.pengajuanSPPD.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 })
    : await prisma.pengajuanSPPD.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { user: true } })

  const totalSppd      = role === "PEGAWAI" ? await prisma.pengajuanSPPD.count({ where: { userId } }) : await prisma.pengajuanSPPD.count()
  const totalDisetujui = role === "PEGAWAI" ? await prisma.pengajuanSPPD.count({ where: { userId, status: "APPROVED" } }) : await prisma.pengajuanSPPD.count({ where: { status: "APPROVED" } })
  const totalMenunggu  = role === "PEGAWAI" ? await prisma.pengajuanSPPD.count({ where: { userId, status: "PENDING" } }) : await prisma.pengajuanSPPD.count({ where: { status: "PENDING" } })
  const totalDitolak   = totalSppd - totalDisetujui - totalMenunggu

  const hour = new Date().getHours()
  const greet = hour < 12 ? "Selamat pagi" : hour < 17 ? "Selamat siang" : "Selamat sore"
  const firstName = session.user.name?.split(" ")[0]

  const kpiCards = [
    {
      label: "Total SPPD",
      value: totalSppd,
      iconBg: "#eef1fb",
      iconColor: "#00205b",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00205b" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
      valueColor: "#1a1f36",
      trend: null,
    },
    {
      label: "Disetujui",
      value: totalDisetujui,
      iconBg: "#edfbf3",
      iconColor: "#16a34a",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8"><polyline points="20 6 9 17 4 12"/></svg>,
      valueColor: "#16a34a",
      trend: "+",
    },
    {
      label: "Menunggu",
      value: totalMenunggu,
      iconBg: "#fffbeb",
      iconColor: "#d97706",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      valueColor: "#d97706",
      trend: null,
    },
    {
      label: "Ditolak",
      value: totalDitolak,
      iconBg: "#fff1f2",
      iconColor: "#dc2626",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
      valueColor: "#dc2626",
      trend: "-",
    },
  ]

  const statusStyle: Record<string, { color: string; bg: string; label: string }> = {
    APPROVED: { color: "#16a34a", bg: "#dcfce7", label: "Disetujui" },
    PENDING:  { color: "#d97706", bg: "#fef3c7", label: "Menunggu"  },
    REJECTED: { color: "#dc2626", bg: "#fee2e2", label: "Ditolak"   },
    DRAFT:    { color: "#6b7280", bg: "#f3f4f6", label: "Draft"     },
  }

  return (
    <div>
      {/* ── Page Title + Tab Filter ── */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "1.25rem",
        flexWrap: "wrap", gap: "0.75rem",
      }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1a1f36", margin: 0, letterSpacing: "-0.5px" }}>
            Dashboard
          </h1>
          <p style={{ fontSize: "0.8rem", color: "#8f95a3", margin: "4px 0 0" }}>
            {greet}, <strong style={{ color: "#00205b" }}>{firstName}</strong>
          </p>
        </div>

        {/* Tab Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ display: "flex", background: "white", borderRadius: "8px", border: "1px solid #eef0f4", overflow: "hidden" }}>
            {["Hari Ini", "Minggu Ini", "Bulan Ini"].map((tab, i) => (
              <button key={tab} style={{
                padding: "0.45rem 0.875rem",
                background: i === 0 ? "#00205b" : "transparent",
                color: i === 0 ? "white" : "#8f95a3",
                border: "none",
                fontSize: "0.78rem",
                fontWeight: i === 0 ? 600 : 400,
                cursor: "pointer",
                borderRight: i < 2 ? "1px solid #eef0f4" : "none",
              }}>
                {tab}
              </button>
            ))}
          </div>

          {(role === "PEGAWAI" || role === "ADMIN") && (
            <a href="/dashboard/pengajuan" style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              background: "#00205b", color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              fontSize: "0.8rem", fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(0,32,91,0.2)",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Ajukan SPPD
            </a>
          )}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "1rem",
        marginBottom: "1.25rem",
      }}>
        {kpiCards.map((kpi) => (
          <div key={kpi.label} style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "1.25rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            border: "1px solid #eef0f4",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}>
            <div style={{
              width: 48, height: 48,
              background: kpi.iconBg,
              borderRadius: "12px",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {kpi.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: kpi.valueColor, lineHeight: 1 }}>
                {kpi.value}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#8f95a3", marginTop: "4px", whiteSpace: "nowrap" }}>
                {kpi.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Konten Bawah: 2 Kolom ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 340px",
        gap: "1rem",
      }}>
        {/* Tabel Pengajuan Terbaru */}
        <div style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "1.25rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          border: "1px solid #eef0f4",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: "1rem",
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1f36" }}>
                Pengajuan Terbaru
              </div>
              <div style={{ fontSize: "0.72rem", color: "#8f95a3", marginTop: "2px" }}>
                5 pengajuan terakhir
              </div>
            </div>
            <a href="/dashboard/sppd" style={{
              fontSize: "0.75rem", color: "#00205b",
              textDecoration: "none", fontWeight: 600,
              display: "flex", alignItems: "center", gap: "3px",
            }}>
              Lihat semua
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {(["No SPPD", role !== "PEGAWAI" ? "Pegawai" : null, "Tujuan", "Tanggal", "Status"] as (string|null)[])
                  .filter((h): h is string => h !== null)
                  .map((h) => (
                    <th key={h} style={{
                      fontSize: "0.68rem", fontWeight: 600, color: "#aab0c0",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      padding: "0.5rem 0.75rem", textAlign: "left",
                      borderBottom: "1px solid #f0f2f7",
                    }}>
                      {h}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {sppd.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#aab0c0", fontSize: "0.85rem" }}>
                    Belum ada pengajuan
                  </td>
                </tr>
              ) : sppd.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f7f8fc" }}>
                  <td style={{ padding: "0.75rem", fontSize: "0.83rem", fontWeight: 600, color: "#00205b" }}>
                    {s.nomorSppd}
                  </td>
                  {role !== "PEGAWAI" && (
                    <td style={{ padding: "0.75rem", fontSize: "0.83rem", color: "#374151" }}>
                      {s.user?.nama}
                    </td>
                  )}
                  <td style={{ padding: "0.75rem", fontSize: "0.83rem", color: "#374151" }}>
                    {s.tujuan}
                  </td>
                  <td style={{ padding: "0.75rem", fontSize: "0.83rem", color: "#aab0c0" }}>
                    {new Date(s.tglBerangkat).toLocaleDateString("id-ID")}
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <span style={{
                      background: statusStyle[s.status]?.bg || "#f3f4f6",
                      color: statusStyle[s.status]?.color || "#6b7280",
                      padding: "3px 10px", borderRadius: "9999px",
                      fontSize: "0.68rem", fontWeight: 600,
                    }}>
                      {statusStyle[s.status]?.label || s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Panel Kanan: Rekap Status */}
        <div style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "1.25rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          border: "1px solid #eef0f4",
        }}>
          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a1f36", marginBottom: "4px" }}>
            Rekap Status
          </div>
          <div style={{ fontSize: "0.72rem", color: "#8f95a3", marginBottom: "1.25rem" }}>
            Distribusi pengajuan SPPD
          </div>

          {/* Progress bars */}
          {[
            { label: "Disetujui", value: totalDisetujui, total: totalSppd, color: "#16a34a", bg: "#dcfce7" },
            { label: "Menunggu",  value: totalMenunggu,  total: totalSppd, color: "#d97706", bg: "#fef3c7" },
            { label: "Ditolak",   value: totalDitolak,   total: totalSppd, color: "#dc2626", bg: "#fee2e2" },
          ].map((item) => {
            const pct = totalSppd > 0 ? Math.round((item.value / totalSppd) * 100) : 0
            return (
              <div key={item.label} style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "#374151" }}>{item.label}</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: item.color }}>{item.value}</span>
                </div>
                <div style={{ background: item.bg, borderRadius: "9999px", height: 8, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: item.color,
                    borderRadius: "9999px",
                    transition: "width 0.5s ease",
                    minWidth: item.value > 0 ? "8px" : "0",
                  }} />
                </div>
                <div style={{ fontSize: "0.7rem", color: "#aab0c0", marginTop: "4px", textAlign: "right" }}>
                  {pct}% dari total
                </div>
              </div>
            )
          })}

          {/* Divider */}
          <div style={{ borderTop: "1px solid #f0f2f7", marginTop: "1rem", paddingTop: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "#8f95a3" }}>Total Pengajuan</span>
              <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#00205b" }}>{totalSppd}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}