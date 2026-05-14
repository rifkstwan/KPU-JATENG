"use client"

import { useState, useTransition } from "react"

type NotifItem = {
  id: string
  pesan: string
  tipe: string
  isRead: boolean
  createdAt: string
  sppd: { nomorSppd: string; tujuan: string } | null
  userName?: string | null
}

const TIPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; bg: string; color: string; dot: string }> = {
  APPROVED: {
    label: "Disetujui",
    bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
  REJECTED: {
    label: "Ditolak",
    bg: "#fef2f2", color: "#dc2626", dot: "#ef4444",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
  },
  PENDING: {
    label: "Menunggu",
    bg: "#fffbeb", color: "#d97706", dot: "#f59e0b",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  SUBMITTED: {
    label: "Pengajuan",
    bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
    ),
  },
  REVISED: {
    label: "Revisi",
    bg: "#fff7ed", color: "#c2410c", dot: "#f97316",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
  INFO: {
    label: "Info",
    bg: "#f5f3ff", color: "#7c3aed", dot: "#8b5cf6",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
}

const SEMUA_TIPE = ["ALL", "APPROVED", "REJECTED", "PENDING", "SUBMITTED", "REVISED", "INFO"]

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (d > 0) return `${d} hari lalu`
  if (h > 0) return `${h} jam lalu`
  if (m > 0) return `${m} menit lalu`
  return "Baru saja"
}

export default function NotifikasiClient({
  data,
  isAdmin = false,
}: {
  data: NotifItem[]
  isAdmin?: boolean
}) {
  const [items, setItems]           = useState(data)
  const [filter, setFilter]         = useState<"ALL" | "UNREAD" | "READ">("ALL")
  const [tipeFilter, setTipeFilter] = useState("ALL")
  const [, startTransition]         = useTransition()

  const unreadCount = items.filter(n => !n.isRead).length

  const displayed = items.filter(n => {
    const matchRead =
      filter === "ALL"    ? true
      : filter === "UNREAD" ? !n.isRead
      : n.isRead
    const matchTipe = tipeFilter === "ALL" || n.tipe === tipeFilter
    return matchRead && matchTipe
  })

  function markRead(id: string) {
    setItems(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    startTransition(async () => {
      await fetch("/api/notifikasi/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
    })
  }

  function markAllRead() {
    setItems(prev => prev.map(n => ({ ...n, isRead: true })))
    startTransition(async () => {
      await fetch("/api/notifikasi/mark-all-read", { method: "POST" })
    })
  }

  const getCfg = (tipe: string) =>
    TIPE_CONFIG[tipe] ?? { label: tipe, bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af", icon: null }

  return (
    <div>
      {/* Filter Bar */}
      <div style={{
        background: "#fff", borderRadius: "14px",
        border: "1px solid #eef0f4",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        padding: "12px 16px", marginBottom: "14px",
        display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px",
      }}>
        {/* Filter Baca */}
        <div style={{ display: "flex", gap: "6px" }}>
          {([
            { label: "Semua", value: "ALL" },
            { label: `Belum Dibaca${unreadCount > 0 ? ` (${unreadCount})` : ""}`, value: "UNREAD" },
            { label: "Sudah Dibaca", value: "READ" },
          ] as { label: string; value: "ALL" | "UNREAD" | "READ" }[]).map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              style={{
                padding: "6px 13px", borderRadius: "20px",
                border: `1.5px solid ${filter === f.value ? "#00205b" : "#e2e5ed"}`,
                background: filter === f.value ? "#00205b" : "#fff",
                color: filter === f.value ? "#fff" : "#6b7280",
                fontSize: "12px", fontWeight: filter === f.value ? 700 : 500,
                cursor: "pointer", outline: "none",
                transition: "all 150ms ease",
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 22, background: "#e2e5ed", margin: "0 2px" }} />

        {/* Filter Tipe */}
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
          {SEMUA_TIPE.map(t => {
            const isActive = tipeFilter === t
            const cfg = t !== "ALL" ? getCfg(t) : null
            return (
              <button key={t} onClick={() => setTipeFilter(t)}
                style={{
                  padding: "5px 11px", borderRadius: "20px",
                  border: `1.5px solid ${isActive ? (cfg?.color ?? "#00205b") : "#e2e5ed"}`,
                  background: isActive ? (cfg?.bg ?? "#f0f4ff") : "#fff",
                  color: isActive ? (cfg?.color ?? "#00205b") : "#9ca3af",
                  fontSize: "11px", fontWeight: isActive ? 700 : 500,
                  cursor: "pointer", outline: "none",
                  display: "flex", alignItems: "center", gap: "4px",
                  transition: "all 150ms ease",
                }}>
                {cfg && (
                  <span style={{
                    width: 5, height: 5, borderRadius: "50%",
                    background: isActive ? cfg.dot : "#d1d5db",
                    flexShrink: 0,
                  }} />
                )}
                {t === "ALL" ? "Semua Tipe" : getCfg(t).label}
              </button>
            )
          })}
        </div>

        {/* Kanan: jumlah + tombol mark all (pegawai saja) */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "12px", color: "#aab0c0" }}>{displayed.length} notifikasi</span>
          {!isAdmin && unreadCount > 0 && (
            <button onClick={markAllRead}
              style={{
                padding: "6px 13px", borderRadius: "8px",
                border: "1.5px solid #bfdbfe", background: "#eff6ff",
                color: "#1d4ed8", fontSize: "12px", fontWeight: 700,
                cursor: "pointer", outline: "none",
                display: "flex", alignItems: "center", gap: "5px",
                whiteSpace: "nowrap",
              }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Tandai Semua Dibaca
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div style={{
        background: "#fff", borderRadius: "16px",
        border: "1px solid #eef0f4",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}>
        {displayed.length === 0 ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", padding: "64px 24px",
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5"
              style={{ marginBottom: "14px" }}>
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Tidak ada notifikasi
            </div>
            <div style={{ fontSize: "13px", color: "#8f95a3" }}>
              {filter === "UNREAD" ? "Semua notifikasi sudah dibaca" : "Belum ada notifikasi masuk"}
            </div>
          </div>
        ) : (
          displayed.map((n, idx) => {
            const cfg    = getCfg(n.tipe)
            const isLast = idx === displayed.length - 1
            return (
              <div key={n.id}
                onClick={() => { if (!n.isRead && !isAdmin) markRead(n.id) }}
                style={{
                  padding: "16px 20px",
                  borderBottom: isLast ? "none" : "1px solid #f3f4f6",
                  display: "flex", alignItems: "flex-start", gap: "14px",
                  background: n.isRead ? "#fff" : "#f8faff",
                  cursor: (!n.isRead && !isAdmin) ? "pointer" : "default",
                  transition: "background 150ms ease",
                }}>

                {/* Icon */}
                <div style={{
                  width: 38, height: 38, borderRadius: "10px",
                  background: cfg.bg, color: cfg.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: "1px",
                }}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>

                  {/* Badge row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px", flexWrap: "wrap" }}>

                    {/* Badge tipe */}
                    <span style={{
                      padding: "2px 8px", borderRadius: "20px",
                      background: cfg.bg, color: cfg.color,
                      fontSize: "10px", fontWeight: 700,
                      display: "flex", alignItems: "center", gap: "3px",
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot }} />
                      {cfg.label}
                    </span>

                    {/* Badge nama user (admin saja) */}
                    {isAdmin && n.userName && (
                      <span style={{
                        padding: "2px 8px", borderRadius: "20px",
                        background: "#f0f4ff", color: "#3b4fd8",
                        fontSize: "10px", fontWeight: 600,
                        display: "flex", alignItems: "center", gap: "4px",
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        {n.userName}
                      </span>
                    )}

                    {/* Badge BARU */}
                    {!n.isRead && (
                      <span style={{
                        padding: "1px 7px", borderRadius: "20px",
                        background: "#dbeafe", color: "#1d4ed8",
                        fontSize: "10px", fontWeight: 700,
                      }}>
                        BARU
                      </span>
                    )}
                  </div>

                  {/* Pesan */}
                  <p style={{
                    fontSize: "13px", color: "#1a1f36",
                    fontWeight: n.isRead ? 400 : 600,
                    margin: 0, lineHeight: 1.5,
                  }}>
                    {n.pesan}
                  </p>

                  {/* SPPD chip */}
                  {n.sppd && (
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      marginTop: "5px", padding: "2px 8px", borderRadius: "6px",
                      background: "#f3f4f6",
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#8f95a3" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <span style={{ fontSize: "11.5px", color: "#6b7280", fontWeight: 600 }}>
                        {n.sppd.nomorSppd}
                      </span>
                      <span style={{ fontSize: "11.5px", color: "#aab0c0" }}>·</span>
                      <span style={{ fontSize: "11.5px", color: "#6b7280" }}>{n.sppd.tujuan}</span>
                    </div>
                  )}

                  {/* Waktu + dot unread */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                    <span style={{ fontSize: "11px", color: "#aab0c0" }}>
                      {timeAgo(n.createdAt)}
                    </span>
                    {!n.isRead && (
                      <span style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: "#00205b", display: "block",
                      }} />
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}