"use client"

import { useState, useMemo } from "react"

type LaporanItem = {
  id: string
  nomorSppd: string
  tujuan: string
  maksud: string
  transport: string
  anggaran: number
  status: string
  tglBerangkat: string
  tglKembali: string
  createdAt: string
  user: { nama: string; nip: string | null; jabatan: string | null; divisi: string | null }
  approver: string | null
  approvedAt: string | null
}

function formatRupiah(val: number) {
  if (!val) return "Rp 0"
  return "Rp " + val.toLocaleString("id-ID")
}

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  })
}

function durasi(a: string, b: string) {
  const diff = new Date(b).getTime() - new Date(a).getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24)) + 1
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  APPROVED: { label: "Disetujui", bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e" },
  REJECTED: { label: "Ditolak",   bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
}

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
]

const TAHUN_OPTIONS = Array.from(
  { length: 4 },
  (_, i) => (new Date().getFullYear() - i).toString()
)

export default function LaporanClient({ data }: { data: LaporanItem[] }) {
  const now = new Date()
  const [bulan, setBulan] = useState<string>((now.getMonth() + 1).toString())
  const [tahun, setTahun] = useState<string>(now.getFullYear().toString())
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const tgl = new Date(item.tglBerangkat)
      const matchBulan = tgl.getMonth() + 1 === parseInt(bulan)
      const matchTahun = tgl.getFullYear() === parseInt(tahun)
      const matchStatus = statusFilter === "ALL" || item.status === statusFilter
      const matchSearch =
        item.nomorSppd.toLowerCase().includes(search.toLowerCase()) ||
        item.tujuan.toLowerCase().includes(search.toLowerCase()) ||
        item.user.nama.toLowerCase().includes(search.toLowerCase())
      return matchBulan && matchTahun && matchStatus && matchSearch
    })
  }, [data, bulan, tahun, statusFilter, search])

  // Statistik
  const totalApproved  = filtered.filter(d => d.status === "APPROVED").length
  const totalRejected  = filtered.filter(d => d.status === "REJECTED").length
  const totalAnggaran  = filtered
    .filter(d => d.status === "APPROVED")
    .reduce((sum, d) => sum + d.anggaran, 0)
  const totalHari      = filtered
    .filter(d => d.status === "APPROVED")
    .reduce((sum, d) => sum + durasi(d.tglBerangkat, d.tglKembali), 0)

  const stats = [
    { label: "Disetujui",      value: totalApproved,          sub: "SPPD bulan ini",      color: "#16a34a" },
    { label: "Ditolak",        value: totalRejected,          sub: "SPPD bulan ini",      color: "#dc2626" },
    { label: "Total Anggaran", value: formatRupiah(totalAnggaran), sub: "SPPD disetujui", color: "#7c3aed" },
    { label: "Total Hari",     value: `${totalHari} hari`,    sub: "Perjalanan dinas",    color: "#d97706" },
  ]

  return (
    <div>
      {/* Filter Bar */}
      <div style={{
        background: "#fff", borderRadius: "14px",
        border: "1px solid #eef0f4",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        padding: "14px 20px", marginBottom: "20px",
        display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap",
      }}>
        {/* Bulan */}
        <select value={bulan} onChange={e => setBulan(e.target.value)}
          style={{
            padding: "8px 12px", borderRadius: "8px",
            border: "1.5px solid #e2e5ed", fontSize: "13px",
            outline: "none", fontFamily: "inherit", cursor: "pointer",
            background: "#fff", color: "#1a1f36",
          }}>
          {BULAN.map((b, i) => (
            <option key={i} value={i + 1}>{b}</option>
          ))}
        </select>

        {/* Tahun */}
        <select value={tahun} onChange={e => setTahun(e.target.value)}
          style={{
            padding: "8px 12px", borderRadius: "8px",
            border: "1.5px solid #e2e5ed", fontSize: "13px",
            outline: "none", fontFamily: "inherit", cursor: "pointer",
            background: "#fff", color: "#1a1f36",
          }}>
          {TAHUN_OPTIONS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* Status Pills */}
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { label: "Semua",     value: "ALL" },
            { label: "Disetujui", value: "APPROVED" },
            { label: "Ditolak",   value: "REJECTED" },
          ].map(f => {
            const isActive = statusFilter === f.value
            const cfg = f.value !== "ALL" ? STATUS_CONFIG[f.value] : null
            return (
              <button key={f.value} onClick={() => setStatusFilter(f.value)}
                style={{
                  padding: "7px 14px", borderRadius: "20px",
                  border: `1.5px solid ${isActive ? "#00205b" : "#e2e5ed"}`,
                  background: isActive ? "#00205b" : "#fff",
                  color: isActive ? "#fff" : "#6b7280",
                  fontSize: "12px", fontWeight: isActive ? 700 : 500,
                  cursor: "pointer", outline: "none",
                  display: "flex", alignItems: "center", gap: "5px",
                  transition: "all 150ms ease",
                }}>
                {cfg && (
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: isActive ? "#fff" : cfg.dot,
                  }} />
                )}
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div style={{ flex: 1, minWidth: "180px", position: "relative" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aab0c0" strokeWidth="2"
            style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Cari nomor, tujuan, nama..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "8px 12px 8px 30px",
              borderRadius: "8px", border: "1.5px solid #e2e5ed",
              fontSize: "13px", outline: "none", boxSizing: "border-box",
              fontFamily: "inherit", transition: "border-color 150ms ease",
            }}
            onFocus={e => e.currentTarget.style.borderColor = "#00205b"}
            onBlur={e => e.currentTarget.style.borderColor = "#e2e5ed"}
          />
        </div>

        {/* Label periode */}
        <div style={{
          marginLeft: "auto", fontSize: "12px", color: "#8f95a3", whiteSpace: "nowrap",
        }}>
          {filtered.length} data · {BULAN[parseInt(bulan) - 1]} {tahun}
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: "#fff", borderRadius: "14px",
            border: "1px solid #eef0f4",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            padding: "16px 20px",
          }}>
            <div style={{ fontSize: "11.5px", color: "#8f95a3", fontWeight: 600, marginBottom: "6px" }}>{s.label.toUpperCase()}</div>
            <div style={{ fontSize: "24px", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: "11.5px", color: "#aab0c0", marginTop: "4px" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabel */}
      <div style={{
        background: "#fff", borderRadius: "14px",
        border: "1px solid #eef0f4",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}>
        {filtered.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "64px 24px",
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5"
              style={{ marginBottom: "14px" }}>
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Tidak ada data
            </div>
            <div style={{ fontSize: "13px", color: "#8f95a3" }}>
              Belum ada SPPD selesai diproses untuk {BULAN[parseInt(bulan) - 1]} {tahun}
            </div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #eef0f4" }}>
                {[
                  { label: "NOMOR SPPD",  align: "left" },
                  { label: "PEGAWAI",     align: "left" },
                  { label: "TUJUAN",      align: "left" },
                  { label: "TANGGAL",     align: "left" },
                  { label: "DURASI",      align: "left" },
                  { label: "ANGGARAN",    align: "left" },
                  { label: "STATUS",      align: "left" },
                  { label: "APPROVER",    align: "left" },
                ].map(h => (
                  <th key={h.label} style={{
                    padding: "11px 16px",
                    textAlign: h.align as "left",
                    fontSize: "11px", fontWeight: 700,
                    color: "#9ca3af", letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                  }}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => {
                const cfg = STATUS_CONFIG[item.status]
                const isLast = idx === filtered.length - 1
                const hari = durasi(item.tglBerangkat, item.tglKembali)
                return (
                  <tr key={item.id}
                    style={{ borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafbfc")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Nomor */}
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#00205b" }}>
                        {item.nomorSppd}
                      </div>
                    </td>

                    {/* Pegawai */}
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a1f36" }}>
                        {item.user.nama}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#8f95a3", marginTop: "1px" }}>
                        {item.user.jabatan ?? "—"}
                      </div>
                    </td>

                    {/* Tujuan */}
                    <td style={{ padding: "13px 16px", maxWidth: "180px" }}>
                      <div style={{
                        fontSize: "13px", color: "#1a1f36",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {item.tujuan}
                      </div>
                      <div style={{
                        fontSize: "11.5px", color: "#8f95a3", marginTop: "1px",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {item.maksud}
                      </div>
                    </td>

                    {/* Tanggal */}
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "12px", color: "#1a1f36" }}>
                        {formatTanggal(item.tglBerangkat)}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#8f95a3" }}>
                        s.d. {formatTanggal(item.tglKembali)}
                      </div>
                    </td>

                    {/* Durasi */}
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <span style={{
                        fontSize: "12px", fontWeight: 600,
                        color: hari > 3 ? "#d97706" : "#1a1f36",
                      }}>
                        {hari} hari
                      </span>
                    </td>

                    {/* Anggaran */}
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#1a1f36" }}>
                        {item.status === "APPROVED" ? formatRupiah(item.anggaran) : "—"}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "4px 10px", borderRadius: "20px",
                        background: cfg.bg, color: cfg.color,
                        fontSize: "11.5px", fontWeight: 700, whiteSpace: "nowrap",
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot }} />
                        {cfg.label}
                      </span>
                    </td>

                    {/* Approver */}
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "12px", color: "#1a1f36" }}>{item.approver ?? "—"}</div>
                      {item.approvedAt && (
                        <div style={{ fontSize: "11px", color: "#aab0c0", marginTop: "1px" }}>
                          {formatTanggal(item.approvedAt)}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>

            {/* Footer Total */}
            {filtered.filter(d => d.status === "APPROVED").length > 0 && (
              <tfoot>
                <tr style={{ background: "#f8f9fb", borderTop: "2px solid #eef0f4" }}>
                  <td colSpan={5} style={{ padding: "12px 16px", fontSize: "12px", fontWeight: 700, color: "#1a1f36" }}>
                    Total ({filtered.filter(d => d.status === "APPROVED").length} SPPD disetujui)
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 800, color: "#7c3aed", whiteSpace: "nowrap" }}>
                    {formatRupiah(totalAnggaran)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  )
}