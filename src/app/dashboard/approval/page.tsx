"use client"

import { useState } from "react"

type StatusType = "PENDING" | "DISETUJUI" | "DITOLAK"

type SPPD = {
  id: string
  nomor: string
  pemohon: string
  tujuan: string
  keperluan: string
  tanggalMulai: string
  tanggalSelesai: string
  transport: string
  status: StatusType
}

const initialData: SPPD[] = [
  {
    id: "1",
    nomor: "SPPD-2025-003",
    pemohon: "Drs. Ahmad Fauzi",
    tujuan: "Yogyakarta",
    keperluan: "Rapat koordinasi persiapan Pilkada 2025",
    tanggalMulai: "20/01/2025",
    tanggalSelesai: "21/01/2025",
    transport: "Kereta",
    status: "PENDING",
  },
  {
    id: "2",
    nomor: "SPPD-2025-002",
    pemohon: "Budi Santoso",
    tujuan: "Semarang",
    keperluan: "Konsultasi pengadaan logistik pemilu",
    tanggalMulai: "15/01/2025",
    tanggalSelesai: "15/01/2025",
    transport: "Darat",
    status: "PENDING",
  },
  {
    id: "3",
    nomor: "SPPD-2025-001",
    pemohon: "Siti Rahayu",
    tujuan: "Jakarta",
    keperluan: "Bimtek pengelolaan data pemilih nasional",
    tanggalMulai: "10/01/2025",
    tanggalSelesai: "12/01/2025",
    transport: "Pesawat",
    status: "PENDING",
  },
]

// ── Icons ──
const IconUser = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)
const IconCalendar = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const IconTruck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="3" width="15" height="13"/>
    <path d="M16 8h4l3 3v5h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
)
const IconDoc = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
)
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export default function ApprovalPage() {
  const [list, setList] = useState<SPPD[]>(initialData)
  const [filter, setFilter] = useState<"SEMUA" | StatusType>("PENDING")
  const [modalId, setModalId] = useState<string | null>(null)
  const [modalAction, setModalAction] = useState<"DISETUJUI" | "DITOLAK" | null>(null)
  const [catatan, setCatatan] = useState("")

  const pending = list.filter(s => s.status === "PENDING").length
  const disetujui = list.filter(s => s.status === "DISETUJUI").length
  const ditolak = list.filter(s => s.status === "DITOLAK").length

  const filtered = filter === "SEMUA" ? list : list.filter(s => s.status === filter)

  const openModal = (id: string, action: "DISETUJUI" | "DITOLAK") => {
    setModalId(id)
    setModalAction(action)
    setCatatan("")
  }

  const confirmAction = () => {
    if (!modalId || !modalAction) return
    setList(prev => prev.map(s => s.id === modalId ? { ...s, status: modalAction } : s))
    setModalId(null)
    setModalAction(null)
    setCatatan("")
  }

  const statusBadge = (status: StatusType) => {
    const cfg = {
      PENDING:   { bg: "#fff7ed", color: "#c2410c", label: "Menunggu" },
      DISETUJUI: { bg: "#f0fdf4", color: "#15803d", label: "Disetujui" },
      DITOLAK:   { bg: "#fef2f2", color: "#b91c1c", label: "Ditolak" },
    }[status]
    return (
      <span style={{
        padding: "3px 10px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 600,
        background: cfg.bg,
        color: cfg.color,
        letterSpacing: "0.3px",
      }}>
        {cfg.label}
      </span>
    )
  }

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#1a1f36", marginBottom: "4px" }}>
          Review Pengajuan SPPD
        </h1>
        <p style={{ fontSize: "13px", color: "#8f95a3" }}>
          Tinjau dan berikan keputusan untuk setiap pengajuan yang masuk.
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Menunggu", value: pending, color: "#c2410c", bg: "#fff7ed", borderColor: "#fed7aa" },
          { label: "Disetujui", value: disetujui, color: "#15803d", bg: "#f0fdf4", borderColor: "#bbf7d0" },
          { label: "Ditolak", value: ditolak, color: "#b91c1c", bg: "#fef2f2", borderColor: "#fecaca" },
        ].map(item => (
          <div key={item.label} style={{
            background: "#fff",
            borderRadius: "12px",
            border: "1px solid #eef0f4",
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "10px",
              background: item.bg, border: `1px solid ${item.borderColor}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", fontWeight: 700, color: item.color,
              flexShrink: 0,
            }}>
              {item.value}
            </div>
            <div>
              <div style={{ fontSize: "13px", color: "#8f95a3" }}>{item.label}</div>
              <div style={{ fontSize: "12px", color: "#aab0c0", marginTop: "1px" }}>
                pengajuan
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Tab ── */}
      <div style={{
        display: "flex",
        gap: "4px",
        background: "#f5f6fa",
        borderRadius: "10px",
        padding: "4px",
        width: "fit-content",
        marginBottom: "20px",
      }}>
        {(["SEMUA", "PENDING", "DISETUJUI", "DITOLAK"] as const).map(f => {
          const labels = { SEMUA: "Semua", PENDING: "Menunggu", DISETUJUI: "Disetujui", DITOLAK: "Ditolak" }
          const active = filter === f
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: active ? 600 : 400,
              background: active ? "#fff" : "transparent",
              color: active ? "#1a1f36" : "#8f95a3",
              boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s",
            }}>
              {labels[f]}
            </button>
          )
        })}
      </div>

      {/* ── List Kartu ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.length === 0 && (
          <div style={{
            background: "#fff", borderRadius: "12px", border: "1px solid #eef0f4",
            padding: "48px", textAlign: "center", color: "#8f95a3", fontSize: "13px",
          }}>
            Tidak ada data pengajuan.
          </div>
        )}
        {filtered.map(sppd => (
          <div key={sppd.id} style={{
            background: "#fff",
            borderRadius: "12px",
            border: "1px solid #eef0f4",
            overflow: "hidden",
            transition: "box-shadow 0.15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)")}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
          >
            {/* Card Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid #f0f2f5",
              background: "#fafbfc",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "8px",
                  background: "#00205b", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <IconDoc />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1f36" }}>
                    {sppd.nomor}
                  </div>
                  <div style={{ fontSize: "11px", color: "#8f95a3", marginTop: "1px" }}>
                    Diajukan oleh {sppd.pemohon}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {statusBadge(sppd.status)}
                {sppd.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => openModal(sppd.id, "DISETUJUI")}
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "7px 14px", border: "none", borderRadius: "8px",
                        background: "#16a34a", color: "#fff",
                        fontSize: "12px", fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      <IconCheck /> Setujui
                    </button>
                    <button
                      onClick={() => openModal(sppd.id, "DITOLAK")}
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "7px 14px", border: "none", borderRadius: "8px",
                        background: "#dc2626", color: "#fff",
                        fontSize: "12px", fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      <IconX /> Tolak
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Card Body */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              gap: "0",
              padding: "0",
            }}>
              {[
                { icon: <IconUser />, label: "Pemohon", value: sppd.pemohon },
                { icon: <IconPin />, label: "Tujuan", value: sppd.tujuan },
                { icon: <IconCalendar />, label: "Tanggal", value: `${sppd.tanggalMulai} → ${sppd.tanggalSelesai}` },
                { icon: <IconTruck />, label: "Transport", value: sppd.transport },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: "14px 20px",
                  borderRight: i < 3 ? "1px solid #f0f2f5" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#8f95a3", marginBottom: "4px" }}>
                    {item.icon}
                    <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.4px", fontWeight: 600 }}>
                      {item.label}
                    </span>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 500, color: "#1a1f36" }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Keperluan */}
            <div style={{
              padding: "12px 20px",
              borderTop: "1px solid #f0f2f5",
              background: "#fafbfc",
              fontSize: "13px",
              color: "#5a6272",
            }}>
              <span style={{ fontWeight: 600, color: "#8f95a3", marginRight: "8px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.4px" }}>Keperluan:</span>
              {sppd.keperluan}
            </div>
          </div>
        ))}
      </div>

      {/* ── Modal Konfirmasi ── */}
      {modalId && modalAction && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 999,
          backdropFilter: "blur(2px)",
        }}
        onClick={() => setModalId(null)}
        >
          <div style={{
            background: "#fff",
            borderRadius: "14px",
            width: 420,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            overflow: "hidden",
          }}
          onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: "20px 24px 16px",
              borderBottom: "1px solid #eef0f4",
            }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#1a1f36" }}>
                {modalAction === "DISETUJUI" ? "Konfirmasi Persetujuan" : "Konfirmasi Penolakan"}
              </div>
              <div style={{ fontSize: "13px", color: "#8f95a3", marginTop: "4px" }}>
                {list.find(s => s.id === modalId)?.nomor}
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px 24px" }}>
              <p style={{ fontSize: "13px", color: "#5a6272", marginBottom: "16px" }}>
                {modalAction === "DISETUJUI"
                  ? "Apakah Anda yakin ingin menyetujui pengajuan ini?"
                  : "Apakah Anda yakin ingin menolak pengajuan ini? Berikan catatan penolakan."}
              </p>

              {modalAction === "DITOLAK" && (
                <div>
                  <label style={{
                    display: "block", fontSize: "12px", fontWeight: 600,
                    color: "#5a6272", marginBottom: "6px",
                    textTransform: "uppercase", letterSpacing: "0.4px",
                  }}>
                    Catatan Penolakan
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tuliskan alasan penolakan..."
                    value={catatan}
                    onChange={e => setCatatan(e.target.value)}
                    style={{
                      width: "100%", padding: "10px 12px",
                      border: "1px solid #e2e5ec", borderRadius: "8px",
                      fontSize: "13px", color: "#1a1f36",
                      outline: "none", resize: "none", boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                    onFocus={e => (e.target.style.borderColor = "#00205b")}
                    onBlur={e => (e.target.style.borderColor = "#e2e5ec")}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: "16px 24px",
              borderTop: "1px solid #eef0f4",
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}>
              <button onClick={() => setModalId(null)} style={{
                padding: "8px 18px", border: "1px solid #e2e5ec",
                borderRadius: "8px", background: "#fff",
                color: "#5a6272", fontSize: "13px", fontWeight: 500, cursor: "pointer",
              }}>
                Batal
              </button>
              <button onClick={confirmAction} style={{
                padding: "8px 18px", border: "none", borderRadius: "8px",
                background: modalAction === "DISETUJUI" ? "#16a34a" : "#dc2626",
                color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer",
              }}>
                {modalAction === "DISETUJUI" ? "Ya, Setujui" : "Ya, Tolak"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}