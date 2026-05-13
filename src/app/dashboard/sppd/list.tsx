"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

type Approval = {
  id: string
  keputusan: string
  catatan: string | null
  approvedAt: string
  approver: { nama: string }
}

type SppdItem = {
  id: string
  nomorSppd: string
  tujuan: string
  maksud: string
  tglBerangkat: string
  tglKembali: string
  transport: string
  anggaran: string
  catatan: string | null
  status: string
  createdAt: string
  user: { nama: string; jabatan: string | null; divisi: string | null }
  approvals: Approval[]
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  DRAFT:    { label: "Draft",     bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af" },
  PENDING:  { label: "Menunggu",  bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
  APPROVED: { label: "Disetujui", bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e" },
  REJECTED: { label: "Ditolak",   bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
}

const FILTERS = [
  { label: "Semua",     value: "ALL" },
  { label: "Draft",     value: "DRAFT" },
  { label: "Menunggu",  value: "PENDING" },
  { label: "Disetujui", value: "APPROVED" },
  { label: "Ditolak",   value: "REJECTED" },
]

function TransportIcon({ type }: { type: string }) {
  const style = { width: 15, height: 15 }
  if (type === "UDARA") return (
    <svg {...style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
    </svg>
  )
  if (type === "KERETA") return (
    <svg {...style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="3" width="16" height="13" rx="2"/>
      <path d="M4 11h16M12 3v8"/>
      <circle cx="8.5" cy="19.5" r="1.5"/>
      <circle cx="15.5" cy="19.5" r="1.5"/>
      <path d="M6 19l-2 2M18 19l2 2"/>
    </svg>
  )
  if (type === "LAUT") return (
    <svg {...style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 20a2.4 2.4 0 002 1 2.4 2.4 0 002-1 2.4 2.4 0 012-1 2.4 2.4 0 012 1 2.4 2.4 0 002 1 2.4 2.4 0 002-1 2.4 2.4 0 012-1 2.4 2.4 0 012 1"/>
      <path d="M4 18l-1-5h18l-2 5"/>
      <path d="M12 2v3M8 7l4-2 4 2"/>
    </svg>
  )
  return (
    <svg {...style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="3" width="15" height="13" rx="2"/>
      <path d="M16 8h4l3 5v3h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  )
}

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  })
}

function formatRupiah(val: string) {
  const n = Number(val)
  if (!n) return "—"
  return "Rp " + n.toLocaleString("id-ID")
}

function durasi(tglBerangkat: string, tglKembali: string) {
  const diff = new Date(tglKembali).getTime() - new Date(tglBerangkat).getTime()
  const days = Math.round(diff / (1000 * 60 * 60 * 24))
  return `${days + 1} hari`
}

export default function SppdList({ data, role }: { data: SppdItem[]; role?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlSearch = searchParams.get("search") ?? ""
  const [filter, setFilter] = useState("ALL")
  const [search, setSearch] = useState(urlSearch)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const filtered = data.filter((item) => {
    const matchFilter = filter === "ALL" || item.status === filter
    const matchSearch =
      item.nomorSppd.toLowerCase().includes(search.toLowerCase()) ||
      item.tujuan.toLowerCase().includes(search.toLowerCase()) ||
      item.user.nama.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/sppd/${id}`, { method: "DELETE" })
      if (res.ok) {
        router.refresh()
      } else {
        alert("Gagal menghapus SPPD.")
      }
    } catch {
      alert("Terjadi kesalahan jaringan.")
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  const stats = [
    { label: "Total",     value: data.length,                                      color: "#1a1f36" },
    { label: "Menunggu",  value: data.filter(d => d.status === "PENDING").length,  color: "#d97706" },
    { label: "Disetujui", value: data.filter(d => d.status === "APPROVED").length, color: "#16a34a" },
    { label: "Ditolak",   value: data.filter(d => d.status === "REJECTED").length, color: "#dc2626" },
  ]

  return (
    <div>
      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            background: "#fff", borderRadius: "14px",
            border: "1px solid #eef0f4",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            padding: "16px 20px",
          }}>
            <div style={{ fontSize: "12px", color: "#8f95a3", marginBottom: "6px" }}>{s.label}</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter + Search */}
      <div style={{
        background: "#fff", borderRadius: "14px",
        border: "1px solid #eef0f4",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        padding: "14px 20px", marginBottom: "16px",
        display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {FILTERS.map((f) => {
            const isActive = filter === f.value
            const cfg = f.value !== "ALL" ? STATUS_CONFIG[f.value] : null
            return (
              <button key={f.value} onClick={() => setFilter(f.value)}
                style={{
                  padding: "6px 14px", borderRadius: "20px",
                  border: `1.5px solid ${isActive ? "#00205b" : "#e2e5ed"}`,
                  background: isActive ? "#00205b" : "#fff",
                  color: isActive ? "#fff" : "#6b7280",
                  fontSize: "12px", fontWeight: isActive ? 700 : 500,
                  cursor: "pointer", outline: "none",
                  transition: "all 150ms ease",
                  display: "flex", alignItems: "center", gap: "5px",
                }}>
                {cfg && (
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: isActive ? "#fff" : cfg.dot,
                    display: "inline-block",
                  }} />
                )}
                {f.label}
              </button>
            )
          })}
        </div>

        <div style={{ flex: 1, minWidth: "200px" }}>
          <div style={{ position: "relative" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aab0c0" strokeWidth="2"
              style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Cari nomor, tujuan, atau nama..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px 8px 32px",
                borderRadius: "8px", border: "1.5px solid #e2e5ed",
                fontSize: "13px", outline: "none", boxSizing: "border-box",
                transition: "border-color 150ms ease", fontFamily: "inherit",
              }}
              onFocus={e => e.currentTarget.style.borderColor = "#00205b"}
              onBlur={e => e.currentTarget.style.borderColor = "#e2e5ed"}
            />
          </div>
        </div>
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
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db"
              strokeWidth="1.5" style={{ marginBottom: "16px" }}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Tidak ada data SPPD
            </div>
            <div style={{ fontSize: "13px", color: "#8f95a3" }}>
              {search ? "Coba ubah kata kunci pencarian" : "Belum ada pengajuan SPPD"}
            </div>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #eef0f4" }}>
                {[
                  { label: "NOMOR SPPD", align: "left" },
                  { label: "TUJUAN",     align: "left" },
                  { label: "TANGGAL",    align: "left" },
                  { label: "TRANSPORT",  align: "left" },
                  { label: "ANGGARAN",   align: "left" },
                  { label: "STATUS",     align: "left" },
                  { label: "AKSI",       align: "right" },
                ].map((h) => (
                  <th key={h.label} style={{
                    padding: "11px 16px",
                    textAlign: h.align as "left" | "right",
                    fontSize: "11px", fontWeight: 700,
                    color: "#9ca3af", letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                  }}>
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => {
                const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.DRAFT
                const isLast = idx === filtered.length - 1
                return (
                  <tr key={item.id}
                    style={{ borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafbfc")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* Nomor SPPD */}
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#00205b" }}>
                        {item.nomorSppd}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#8f95a3", marginTop: "2px" }}>
                        {item.user.nama}
                      </div>
                    </td>

                    {/* Tujuan */}
                    <td style={{ padding: "14px 16px", maxWidth: "200px" }}>
                      <div style={{
                        fontSize: "13px", fontWeight: 600, color: "#1a1f36",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {item.tujuan}
                      </div>
                      <div style={{
                        fontSize: "11.5px", color: "#8f95a3", marginTop: "2px",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        maxWidth: "180px",
                      }}>
                        {item.maksud}
                      </div>
                    </td>

                    {/* Tanggal */}
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "12px", color: "#1a1f36" }}>
                        {formatTanggal(item.tglBerangkat)}
                      </div>
                      <div style={{ fontSize: "11.5px", color: "#8f95a3", marginTop: "2px" }}>
                        s.d. {formatTanggal(item.tglKembali)}
                      </div>
                      <div style={{ fontSize: "11px", color: "#aab0c0", marginTop: "1px" }}>
                        {durasi(item.tglBerangkat, item.tglKembali)}
                      </div>
                    </td>

                    {/* Transport */}
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6b7280" }}>
                        <TransportIcon type={item.transport} />
                        <span style={{ fontSize: "12px", fontWeight: 500 }}>
                          {item.transport.charAt(0) + item.transport.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </td>

                    {/* Anggaran */}
                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "13px", color: "#1a1f36", fontWeight: 500 }}>
                        {formatRupiah(item.anggaran)}
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "4px 10px", borderRadius: "20px",
                        background: cfg.bg, color: cfg.color,
                        fontSize: "11.5px", fontWeight: 700, whiteSpace: "nowrap",
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot }} />
                        {cfg.label}
                      </span>
                      {item.approvals[0] && item.status !== "PENDING" && (
                        <div style={{ fontSize: "11px", color: "#8f95a3", marginTop: "3px" }}>
                          oleh {item.approvals[0].approver.nama}
                        </div>
                      )}
                    </td>

                    {/* Aksi */}
                    <td style={{ padding: "14px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>

                        {item.status === "DRAFT" && (
                          <a href={`/dashboard/pengajuan/edit/${item.id}`}
                            style={{
                              padding: "6px 12px", borderRadius: "8px",
                              border: "1.5px solid #e2e5ed", background: "#fff",
                              color: "#1a1f36", fontSize: "12px", fontWeight: 600,
                              textDecoration: "none", display: "inline-flex",
                              alignItems: "center", gap: "4px",
                              transition: "all 150ms ease",
                            }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Edit
                          </a>
                        )}

                        {item.status === "DRAFT" && (
                          confirmId === item.id ? (
                            <div style={{ display: "flex", gap: "4px" }}>
                              <button
                                onClick={() => handleDelete(item.id)}
                                disabled={deletingId === item.id}
                                style={{
                                  padding: "6px 12px", borderRadius: "8px",
                                  border: "none", background: "#ef4444",
                                  color: "#fff", fontSize: "12px", fontWeight: 600,
                                  cursor: deletingId === item.id ? "not-allowed" : "pointer",
                                  outline: "none",
                                }}>
                                {deletingId === item.id ? "..." : "Hapus"}
                              </button>
                              <button
                                onClick={() => setConfirmId(null)}
                                style={{
                                  padding: "6px 10px", borderRadius: "8px",
                                  border: "1.5px solid #e2e5ed", background: "#fff",
                                  color: "#6b7280", fontSize: "12px", fontWeight: 600,
                                  cursor: "pointer", outline: "none",
                                }}>
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmId(item.id)}
                              style={{
                                padding: "6px 10px", borderRadius: "8px",
                                border: "1.5px solid #fca5a5", background: "#fff",
                                color: "#dc2626", fontSize: "12px",
                                cursor: "pointer", outline: "none",
                                display: "flex", alignItems: "center",
                                transition: "all 150ms ease",
                              }}>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6"/>
                              </svg>
                            </button>
                          )
                        )}

                        {/* ✅ TOMBOL UNDUH — hanya muncul jika status APPROVED */}
                        {item.status === "APPROVED" && (
                          <a
                            href={`/api/sppd/${item.id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: "6px 12px", borderRadius: "8px",
                              border: "1.5px solid #bbf7d0", background: "#f0fdf4",
                              color: "#16a34a", fontSize: "12px", fontWeight: 600,
                              textDecoration: "none", display: "inline-flex",
                              alignItems: "center", gap: "5px",
                              transition: "all 150ms ease",
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = "#dcfce7"
                              e.currentTarget.style.borderColor = "#86efac"
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = "#f0fdf4"
                              e.currentTarget.style.borderColor = "#bbf7d0"
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                              <polyline points="7 10 12 15 17 10"/>
                              <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Unduh
                          </a>
                        )}

                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}