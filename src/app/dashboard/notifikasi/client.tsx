"use client"

import { useState, useTransition } from "react"

type NotifItem = {
  id: string
  pesan: string
  tipe: string
  isRead: boolean
  createdAt: string
  sppd: { nomorSppd: string; tujuan: string } | null
}

const TIPE_CONFIG: Record<string, { icon: React.ReactNode; bg: string; color: string }> = {
  APPROVED: {
    bg: "#f0fdf4", color: "#16a34a",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
  REJECTED: {
    bg: "#fef2f2", color: "#dc2626",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
  },
  PENDING: {
    bg: "#fffbeb", color: "#d97706",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  INFO: {
    bg: "#eff6ff", color: "#1d4ed8",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
}

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

export default function NotifikasiClient({ data }: { data: NotifItem[] }) {
  const [items, setItems] = useState(data)
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL")
  const [, startTransition] = useTransition()

  const displayed = filter === "UNREAD" ? items.filter(n => !n.isRead) : items
  const unreadCount = items.filter(n => !n.isRead).length

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

  return (
    <div>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "16px", flexWrap: "wrap", gap: "10px",
      }}>
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { label: "Semua",    value: "ALL" },
            { label: `Belum Dibaca (${unreadCount})`, value: "UNREAD" },
          ].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value as "ALL" | "UNREAD")}
              style={{
                padding: "7px 14px", borderRadius: "20px",
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
        {unreadCount > 0 && (
          <button onClick={markAllRead}
            style={{
              padding: "7px 14px", borderRadius: "8px",
              border: "1.5px solid #e2e5ed", background: "#fff",
              color: "#00205b", fontSize: "12px", fontWeight: 600,
              cursor: "pointer", outline: "none",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Tandai semua dibaca
          </button>
        )}
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
            const cfg = TIPE_CONFIG[n.tipe] ?? TIPE_CONFIG.INFO
            const isLast = idx === displayed.length - 1
            return (
              <div key={n.id}
                onClick={() => { if (!n.isRead) markRead(n.id) }}
                style={{
                  padding: "16px 20px",
                  borderBottom: isLast ? "none" : "1px solid #f3f4f6",
                  display: "flex", alignItems: "flex-start", gap: "14px",
                  background: n.isRead ? "#fff" : "#f8faff",
                  cursor: n.isRead ? "default" : "pointer",
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
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                    <div>
                      <p style={{
                        fontSize: "13px", color: "#1a1f36",
                        fontWeight: n.isRead ? 400 : 600,
                        margin: 0, lineHeight: 1.5,
                      }}>
                        {n.pesan}
                      </p>
                      {n.sppd && (
                        <div style={{
                          display: "inline-flex", alignItems: "center", gap: "5px",
                          marginTop: "4px", padding: "2px 8px", borderRadius: "6px",
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
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                      <span style={{ fontSize: "11px", color: "#aab0c0", whiteSpace: "nowrap" }}>
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
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}