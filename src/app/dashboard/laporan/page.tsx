"use client"

import { useState } from "react"

type StatusType = "DISETUJUI" | "MENUNGGU" | "DITOLAK"

type SPPD = {
  nomor: string
  pemohon: string
  tujuan: string
  tanggalBerangkat: string
  tanggalKembali: string
  transport: string
  status: StatusType
  keperluan: string
}

const dataSPPD: SPPD[] = [
  { nomor: "SPPD-2025-003", pemohon: "Drs. Ahmad Fauzi",  tujuan: "Yogyakarta", tanggalBerangkat: "20/01/2025", tanggalKembali: "21/01/2025", transport: "Kereta",  status: "MENUNGGU",  keperluan: "Rapat koordinasi persiapan Pilkada 2025" },
  { nomor: "SPPD-2025-002", pemohon: "Budi Santoso",      tujuan: "Semarang",   tanggalBerangkat: "15/01/2025", tanggalKembali: "15/01/2025", transport: "Darat",    status: "MENUNGGU",  keperluan: "Konsultasi pengadaan logistik pemilu" },
  { nomor: "SPPD-2025-001", pemohon: "Siti Rahayu",       tujuan: "Jakarta",    tanggalBerangkat: "10/01/2025", tanggalKembali: "12/01/2025", transport: "Pesawat",  status: "DISETUJUI", keperluan: "Bimtek pengelolaan data pemilih nasional" },
  { nomor: "SPPD-2024-012", pemohon: "Rudi Hartono",      tujuan: "Bandung",    tanggalBerangkat: "28/12/2024", tanggalKembali: "30/12/2024", transport: "Kereta",   status: "DISETUJUI", keperluan: "Workshop sistem informasi KPU" },
  { nomor: "SPPD-2024-011", pemohon: "Endah Puspita",     tujuan: "Surabaya",   tanggalBerangkat: "20/12/2024", tanggalKembali: "21/12/2024", transport: "Darat",    status: "DITOLAK",   keperluan: "Koordinasi logistik daerah" },
  { nomor: "SPPD-2024-010", pemohon: "Ahmad Mukhlisin",   tujuan: "Solo",       tanggalBerangkat: "15/12/2024", tanggalKembali: "15/12/2024", transport: "Darat",    status: "DISETUJUI", keperluan: "Rapat evaluasi akhir tahun" },
]

// ── Icons ──
const IconBarChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)
const IconDownload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
)
const IconFilter = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
)
const IconTotal = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
)
const IconCheck2 = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
)
const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconXCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
)

const statusConfig: Record<StatusType, { label: string; bg: string; color: string }> = {
  DISETUJUI: { label: "Disetujui", bg: "#f0fdf4", color: "#15803d" },
  MENUNGGU:  { label: "Menunggu",  bg: "#fff7ed", color: "#c2410c" },
  DITOLAK:   { label: "Ditolak",   bg: "#fef2f2", color: "#b91c1c" },
}

export default function LaporanPage() {
  const [filterStatus, setFilterStatus] = useState<"SEMUA" | StatusType>("SEMUA")
  const [search, setSearch] = useState("")

  const total     = dataSPPD.length
  const disetujui = dataSPPD.filter(s => s.status === "DISETUJUI").length
  const menunggu  = dataSPPD.filter(s => s.status === "MENUNGGU").length
  const ditolak   = dataSPPD.filter(s => s.status === "DITOLAK").length

  const filtered = dataSPPD.filter(s => {
    const matchStatus = filterStatus === "SEMUA" || s.status === filterStatus
    const q = search.toLowerCase()
    const matchSearch = !q
      || s.nomor.toLowerCase().includes(q)
      || s.pemohon.toLowerCase().includes(q)
      || s.tujuan.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  // chart bar data
  const chartData = [
    { label: "Jan", disetujui: 1, menunggu: 2, ditolak: 0 },
    { label: "Feb", disetujui: 3, menunggu: 1, ditolak: 1 },
    { label: "Mar", disetujui: 2, menunggu: 0, ditolak: 0 },
    { label: "Apr", disetujui: 4, menunggu: 2, ditolak: 1 },
    { label: "Mei", disetujui: 2, menunggu: 3, ditolak: 0 },
    { label: "Jun", disetujui: 5, menunggu: 1, ditolak: 2 },
  ]
  const maxVal = Math.max(...chartData.map(d => d.disetujui + d.menunggu + d.ditolak))

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1f36", marginBottom: "4px" }}>
            Laporan SPPD
          </h1>
          <p style={{ fontSize: "13px", color: "#8f95a3" }}>
            Rekap dan analisis seluruh data perjalanan dinas.
          </p>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "9px 16px", background: "#00205b", color: "#fff",
          border: "none", borderRadius: "8px", fontSize: "13px",
          fontWeight: 600, cursor: "pointer",
        }}>
          <IconDownload /> Export PDF
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total SPPD",  value: total,     icon: <IconTotal />,   iconBg: "#eff6ff", iconColor: "#1d4ed8", border: "#bfdbfe" },
          { label: "Disetujui",   value: disetujui, icon: <IconCheck2 />,  iconBg: "#f0fdf4", iconColor: "#15803d", border: "#bbf7d0" },
          { label: "Menunggu",    value: menunggu,  icon: <IconClock />,   iconBg: "#fff7ed", iconColor: "#c2410c", border: "#fed7aa" },
          { label: "Ditolak",     value: ditolak,   icon: <IconXCircle />, iconBg: "#fef2f2", iconColor: "#b91c1c", border: "#fecaca" },
        ].map(item => (
          <div key={item.label} style={{
            background: "#fff", borderRadius: "12px",
            border: "1px solid #eef0f4", padding: "20px 22px",
            display: "flex", alignItems: "center", gap: "16px",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "10px",
              background: item.iconBg, border: `1px solid ${item.border}`,
              color: item.iconColor,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#1a1f36", lineHeight: 1 }}>
                {item.value}
              </div>
              <div style={{ fontSize: "12px", color: "#8f95a3", marginTop: "4px" }}>
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart + Distribusi ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px", marginBottom: "24px" }}>

        {/* Bar Chart */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eef0f4", padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <div style={{ color: "#00205b" }}><IconBarChart /></div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1f36" }}>
              Tren SPPD per Bulan
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: "16px" }}>
              {[
                { color: "#15803d", label: "Disetujui" },
                { color: "#c2410c", label: "Menunggu" },
                { color: "#b91c1c", label: "Ditolak" },
              ].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "2px", background: l.color }} />
                  <span style={{ fontSize: "11px", color: "#8f95a3" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bar Groups */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: "20px", height: "160px" }}>
            {chartData.map(d => {
              const totalBar = d.disetujui + d.menunggu + d.ditolak
              const pct = (v: number) => `${(v / maxVal) * 100}%`
              return (
                <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", height: "100%" }}>
                  <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "3px", width: "100%" }}>
                    {[
                      { val: d.disetujui, color: "#16a34a" },
                      { val: d.menunggu,  color: "#ea580c" },
                      { val: d.ditolak,   color: "#dc2626" },
                    ].map((bar, i) => (
                      <div key={i} style={{
                        flex: 1, height: pct(bar.val),
                        background: bar.color,
                        borderRadius: "3px 3px 0 0",
                        minHeight: bar.val > 0 ? "4px" : "0",
                        opacity: 0.85,
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: "11px", color: "#8f95a3", fontWeight: 500 }}>{d.label}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Distribusi Transport */}
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eef0f4", padding: "24px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1f36", marginBottom: "18px" }}>
            Distribusi Transport
          </div>
          {[
            { label: "Darat",   count: dataSPPD.filter(s => s.transport === "Darat").length,   color: "#1d4ed8" },
            { label: "Kereta",  count: dataSPPD.filter(s => s.transport === "Kereta").length,  color: "#7c3aed" },
            { label: "Pesawat", count: dataSPPD.filter(s => s.transport === "Pesawat").length, color: "#0891b2" },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", color: "#5a6272", fontWeight: 500 }}>{item.label}</span>
                <span style={{ fontSize: "13px", fontWeight: 700, color: "#1a1f36" }}>{item.count}</span>
              </div>
              <div style={{ height: "6px", background: "#f0f2f5", borderRadius: "999px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${(item.count / total) * 100}%`,
                  background: item.color,
                  borderRadius: "999px",
                  transition: "width 0.6s ease",
                }} />
              </div>
            </div>
          ))}

          <div style={{ marginTop: "24px", borderTop: "1px solid #f0f2f5", paddingTop: "16px" }}>
            <div style={{ fontSize: "12px", color: "#8f95a3", marginBottom: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px" }}>
              Tingkat Persetujuan
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#15803d" }}>
              {Math.round((disetujui / total) * 100)}%
            </div>
            <div style={{ fontSize: "12px", color: "#8f95a3", marginTop: "2px" }}>
              dari total {total} pengajuan
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabel ── */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #eef0f4", overflow: "hidden" }}>
        {/* Table Toolbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid #eef0f4",
        }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1f36" }}>
            Daftar SPPD
            <span style={{ marginLeft: "8px", fontSize: "12px", fontWeight: 400, color: "#8f95a3" }}>
              {filtered.length} data
            </span>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            {/* Search */}
            <div style={{
              display: "flex", alignItems: "center", gap: "8px",
              background: "#f5f6fa", borderRadius: "8px",
              padding: "7px 12px", border: "1px solid #eef0f4", width: 220,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aab0c0" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari nomor / pemohon..."
                style={{
                  border: "none", background: "transparent",
                  fontSize: "13px", color: "#1a1f36", outline: "none", width: "100%",
                }}
              />
            </div>

            {/* Filter Status */}
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "#f5f6fa", borderRadius: "8px",
              padding: "7px 12px", border: "1px solid #eef0f4", cursor: "pointer",
            }}>
              <IconFilter />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
                style={{
                  border: "none", background: "transparent",
                  fontSize: "13px", color: "#5a6272", outline: "none", cursor: "pointer",
                }}
              >
                <option value="SEMUA">Semua Status</option>
                <option value="DISETUJUI">Disetujui</option>
                <option value="MENUNGGU">Menunggu</option>
                <option value="DITOLAK">Ditolak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafbfc" }}>
                {["Nomor SPPD", "Pemohon", "Tujuan", "Keperluan", "Tgl Berangkat", "Kembali", "Transport", "Status"].map(h => (
                  <th key={h} style={{
                    padding: "11px 16px",
                    textAlign: "left",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#8f95a3",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    borderBottom: "1px solid #eef0f4",
                    whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: "#8f95a3", fontSize: "13px" }}>
                    Tidak ada data yang sesuai filter.
                  </td>
                </tr>
              ) : filtered.map((sppd, i) => {
                const cfg = statusConfig[sppd.status]
                return (
                  <tr key={sppd.nomor} style={{
                    background: i % 2 === 0 ? "#fff" : "#fafbfc",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f4ff")}
                  onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafbfc")}
                  >
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 600, color: "#00205b", fontSize: "13px" }}>
                        {sppd.nomor}
                      </span>
                    </td>
                    <td style={tdStyle}>{sppd.pemohon}</td>
                    <td style={tdStyle}>{sppd.tujuan}</td>
                    <td style={{ ...tdStyle, maxWidth: "200px" }}>
                      <span style={{
                        display: "block", whiteSpace: "nowrap",
                        overflow: "hidden", textOverflow: "ellipsis",
                        maxWidth: "200px",
                      }} title={sppd.keperluan}>
                        {sppd.keperluan}
                      </span>
                    </td>
                    <td style={tdStyle}>{sppd.tanggalBerangkat}</td>
                    <td style={tdStyle}>{sppd.tanggalKembali}</td>
                    <td style={tdStyle}>{sppd.transport}</td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "3px 10px", borderRadius: "999px",
                        fontSize: "11px", fontWeight: 600,
                        background: cfg.bg, color: cfg.color,
                      }}>
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div style={{
          padding: "12px 20px",
          borderTop: "1px solid #eef0f4",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#fafbfc",
        }}>
          <span style={{ fontSize: "12px", color: "#8f95a3" }}>
            Menampilkan {filtered.length} dari {dataSPPD.length} data
          </span>
          <button style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "7px 14px", background: "#f5f6fa",
            border: "1px solid #eef0f4", borderRadius: "8px",
            fontSize: "12px", fontWeight: 500, color: "#5a6272", cursor: "pointer",
          }}>
            <IconDownload /> Export Excel
          </button>
        </div>
      </div>
    </div>
  )
}

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: "13px",
  color: "#5a6272",
  borderBottom: "1px solid #f0f2f5",
  whiteSpace: "nowrap",
}