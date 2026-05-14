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

function formatTanggalLong(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
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
  const [printing, setPrinting] = useState(false)

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

  const totalApproved = filtered.filter(d => d.status === "APPROVED").length
  const totalRejected = filtered.filter(d => d.status === "REJECTED").length
  const totalAnggaran = filtered
    .filter(d => d.status === "APPROVED")
    .reduce((sum, d) => sum + d.anggaran, 0)
  const totalHari = filtered
    .filter(d => d.status === "APPROVED")
    .reduce((sum, d) => sum + durasi(d.tglBerangkat, d.tglKembali), 0)

  const stats = [
    { label: "Disetujui",      value: totalApproved,              sub: "SPPD bulan ini",   color: "#16a34a" },
    { label: "Ditolak",        value: totalRejected,              sub: "SPPD bulan ini",   color: "#dc2626" },
    { label: "Total Anggaran", value: formatRupiah(totalAnggaran), sub: "SPPD disetujui",  color: "#7c3aed" },
    { label: "Total Hari",     value: `${totalHari} hari`,        sub: "Perjalanan dinas", color: "#d97706" },
  ]

  // ─── Fungsi Cetak ────────────────────────────────────────────────────────────
  const handlePrint = () => {
    setPrinting(true)
    const namaBulan    = BULAN[parseInt(bulan) - 1]
    const statusLabel  = statusFilter === "ALL" ? "Semua Status" : statusFilter === "APPROVED" ? "Disetujui" : "Ditolak"
    const tanggalCetak = formatTanggalLong(new Date().toISOString())

    const rows = filtered.map((item, idx) => {
      const cfg  = STATUS_CONFIG[item.status]
      const hari = durasi(item.tglBerangkat, item.tglKembali)
      return `
        <tr>
          <td style="text-align:center">${idx + 1}</td>
          <td><strong>${item.nomorSppd}</strong></td>
          <td>
            <div style="font-weight:600">${item.user.nama}</div>
            <div style="color:#6b7280;font-size:10px">${item.user.nip ?? "—"}</div>
            <div style="color:#6b7280;font-size:10px">${item.user.jabatan ?? "—"}</div>
          </td>
          <td>
            <div>${item.tujuan}</div>
            <div style="color:#6b7280;font-size:10px">${item.maksud}</div>
          </td>
          <td style="white-space:nowrap">
            ${formatTanggal(item.tglBerangkat)}<br>
            <span style="color:#6b7280;font-size:10px">s.d. ${formatTanggal(item.tglKembali)}</span>
          </td>
          <td style="text-align:center">${hari} hari</td>
          <td style="text-align:right">${item.status === "APPROVED" ? formatRupiah(item.anggaran) : "—"}</td>
          <td style="text-align:center">
            <span style="padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;background:${cfg.bg};color:${cfg.color}">
              ${cfg.label}
            </span>
          </td>
          <td>
            <div>${item.approver ?? "—"}</div>
            ${item.approvedAt ? `<div style="color:#9ca3af;font-size:10px">${formatTanggal(item.approvedAt)}</div>` : ""}
          </td>
        </tr>
      `
    }).join("")

    const footerRow = totalApproved > 0 ? `
      <tr style="background:#f0f4ff;font-weight:700;border-top:2px solid #00205b">
        <td colspan="6" style="padding:10px 12px;font-size:12px">
          Total (${totalApproved} SPPD disetujui)
        </td>
        <td style="padding:10px 12px;font-size:13px;color:#7c3aed;text-align:right">
          ${formatRupiah(totalAnggaran)}
        </td>
        <td colspan="2"></td>
      </tr>
    ` : ""

    const printHTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>Rekap Laporan SPPD — ${namaBulan} ${tahun}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1a1f36; padding: 28px 32px; }
    .kop { display:flex; align-items:center; gap:16px; border-bottom:3px solid #00205b; padding-bottom:14px; margin-bottom:20px; }
    .kop-logo { width:54px; height:54px; background:#00205b; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-weight:900; font-size:18px; flex-shrink:0; }
    .kop-text h1 { font-size:15px; font-weight:800; color:#00205b; }
    .kop-text p  { font-size:11px; color:#6b7280; margin-top:2px; }
    .judul { text-align:center; margin-bottom:18px; }
    .judul h2 { font-size:15px; font-weight:800; color:#00205b; text-transform:uppercase; letter-spacing:0.5px; }
    .judul p  { font-size:11px; color:#6b7280; margin-top:4px; }
    .stats { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; margin-bottom:18px; }
    .stat-card { border:1px solid #e5e7eb; border-radius:8px; padding:10px 14px; }
    .stat-label { font-size:9px; color:#9ca3af; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; }
    .stat-value { font-size:20px; font-weight:800; margin-top:2px; line-height:1; }
    .stat-sub   { font-size:10px; color:#aab0c0; margin-top:3px; }
    table { width:100%; border-collapse:collapse; font-size:11px; }
    thead tr { background:#00205b; color:#fff; }
    thead th { padding:9px 10px; text-align:left; font-size:10px; font-weight:700; letter-spacing:0.05em; white-space:nowrap; }
    tbody tr { border-bottom:1px solid #f3f4f6; }
    tbody tr:nth-child(even) { background:#fafbfc; }
    tbody td { padding:9px 10px; vertical-align:top; }
    tfoot td  { padding:10px; }
    .print-footer { margin-top:24px; display:flex; justify-content:space-between; align-items:flex-end; }
    .ttd-block { text-align:center; }
    .ttd-block p { font-size:11px; }
    .ttd-space { height:60px; }
    .ttd-nama { font-weight:700; border-top:1px solid #1a1f36; padding-top:4px; font-size:11px; }
    .ttd-nip  { font-size:10px; color:#6b7280; margin-top:2px; }
    @media print {
      body { padding: 0; }
      @page { size: A4 landscape; margin: 15mm; }
    }
  </style>
</head>
<body>
  <div class="kop">
    <div class="kop-logo">KPU</div>
    <div class="kop-text">
      <h1>KOMISI PEMILIHAN UMUM</h1>
      <p>Sistem Informasi Manajemen Surat Perintah Perjalanan Dinas (SPPD)</p>
    </div>
  </div>

  <div class="judul">
    <h2>Rekap Laporan SPPD — ${namaBulan} ${tahun}</h2>
    <p>Filter: ${statusLabel} &nbsp;|&nbsp; Total: ${filtered.length} data &nbsp;|&nbsp; Dicetak: ${tanggalCetak}</p>
  </div>

  <div class="stats">
    <div class="stat-card">
      <div class="stat-label">Disetujui</div>
      <div class="stat-value" style="color:#16a34a">${totalApproved}</div>
      <div class="stat-sub">SPPD bulan ini</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Ditolak</div>
      <div class="stat-value" style="color:#dc2626">${totalRejected}</div>
      <div class="stat-sub">SPPD bulan ini</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Anggaran</div>
      <div class="stat-value" style="color:#7c3aed;font-size:14px">${formatRupiah(totalAnggaran)}</div>
      <div class="stat-sub">SPPD disetujui</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Hari</div>
      <div class="stat-value" style="color:#d97706">${totalHari}</div>
      <div class="stat-sub">Hari perjalanan dinas</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:28px">No</th>
        <th>Nomor SPPD</th>
        <th>Pegawai</th>
        <th>Tujuan / Maksud</th>
        <th>Tanggal</th>
        <th style="text-align:center">Durasi</th>
        <th style="text-align:right">Anggaran</th>
        <th style="text-align:center">Status</th>
        <th>Approver</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan="9" style="text-align:center;padding:24px;color:#9ca3af">Tidak ada data untuk periode ini</td></tr>`}
    </tbody>
    ${footerRow ? `<tfoot>${footerRow}</tfoot>` : ""}
  </table>

  <div class="print-footer">
    <div style="font-size:10px;color:#9ca3af">
      <p>Dokumen ini digenerate otomatis oleh sistem SPPD-KPU.</p>
      <p style="margin-top:2px">Dicetak pada: ${tanggalCetak}</p>
    </div>
    <div class="ttd-block">
      <p>Mengetahui,</p>
      <div class="ttd-space"></div>
      <div class="ttd-nama">( _________________________________ )</div>
      <div class="ttd-nip">NIP. _____________________________</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print()
      window.onafterprint = function() { window.close() }
    }
  </script>
</body>
</html>`

    const win = window.open("", "_blank", "width=1100,height=750")
    if (win) {
      win.document.write(printHTML)
      win.document.close()
    }
    setTimeout(() => setPrinting(false), 1500)
  }
  // ─────────────────────────────────────────────────────────────────────────────

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
        <div style={{ fontSize: "12px", color: "#8f95a3", whiteSpace: "nowrap" }}>
          {filtered.length} data · {BULAN[parseInt(bulan) - 1]} {tahun}
        </div>

        {/* Tombol Cetak Rekap */}
        <button
          onClick={handlePrint}
          disabled={printing || filtered.length === 0}
          style={{
            padding: "8px 16px", borderRadius: "8px",
            border: "1.5px solid #bfdbfe",
            background: printing || filtered.length === 0 ? "#f3f4f6" : "#eff6ff",
            color: printing || filtered.length === 0 ? "#9ca3af" : "#1d4ed8",
            fontSize: "12px", fontWeight: 700,
            cursor: printing || filtered.length === 0 ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", gap: "6px",
            transition: "all 150ms ease", whiteSpace: "nowrap",
          }}
          onMouseEnter={e => {
            if (!printing && filtered.length > 0) {
              e.currentTarget.style.background = "#dbeafe"
              e.currentTarget.style.borderColor = "#93c5fd"
            }
          }}
          onMouseLeave={e => {
            if (!printing && filtered.length > 0) {
              e.currentTarget.style.background = "#eff6ff"
              e.currentTarget.style.borderColor = "#bfdbfe"
            }
          }}
        >
          {printing ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ animation: "spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              Membuka...
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Cetak Rekap
            </>
          )}
        </button>
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
                  { label: "NOMOR SPPD", align: "left" },
                  { label: "PEGAWAI",    align: "left" },
                  { label: "TUJUAN",     align: "left" },
                  { label: "TANGGAL",    align: "left" },
                  { label: "DURASI",     align: "left" },
                  { label: "ANGGARAN",   align: "left" },
                  { label: "STATUS",     align: "left" },
                  { label: "APPROVER",   align: "left" },
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
                const cfg    = STATUS_CONFIG[item.status]
                const isLast = idx === filtered.length - 1
                const hari   = durasi(item.tglBerangkat, item.tglKembali)
                return (
                  <tr key={item.id}
                    style={{ borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafbfc")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#00205b" }}>
                        {item.nomorSppd}
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a1f36" }}>
                        {item.user.nama}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#8f95a3", marginTop: "1px" }}>
                        {item.user.jabatan ?? "—"}
                      </div>
                    </td>
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
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "12px", color: "#1a1f36" }}>
                        {formatTanggal(item.tglBerangkat)}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#8f95a3" }}>
                        s.d. {formatTanggal(item.tglKembali)}
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <span style={{
                        fontSize: "12px", fontWeight: 600,
                        color: hari > 3 ? "#d97706" : "#1a1f36",
                      }}>
                        {hari} hari
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#1a1f36" }}>
                        {item.status === "APPROVED" ? formatRupiah(item.anggaran) : "—"}
                      </span>
                    </td>
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

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}