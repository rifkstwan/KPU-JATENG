"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

type Notif = {
  id: string
  pesan: string
  tipe: string
  isRead: boolean
  createdAt: string
  sppd?: { nomorSppd: string } | null
}

const TIPE_CONFIG: Record<string, { bg: string; color: string; icon: React.ReactNode }> = {
  APPROVED: {
    bg: "#f0fdf4", color: "#16a34a",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
  },
  REJECTED: {
    bg: "#fef2f2", color: "#dc2626",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
  },
  PENDING: {
    bg: "#fffbeb", color: "#d97706",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  },
  INFO: {
    bg: "#eff6ff", color: "#2563eb",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  },
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (d > 0) return `${d} hari lalu`
  if (h > 0) return `${h} jam lalu`
  if (m > 0) return `${m} mnt lalu`
  return "Baru saja"
}

export default function NotifBell() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const unreadCount = notifs.filter(n => !n.isRead).length

  // Fetch notifikasi saat komponen mount
  useEffect(() => {
    fetchNotifs()
  }, [])

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function fetchNotifs() {
    setLoading(true)
    try {
      const res = await fetch("/api/notifikasi?limit=5")
      if (res.ok) {
        const data = await res.json()
        setNotifs(Array.isArray(data) ? data : data.data ?? [])
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  async function markAllRead() {
    try {
      await fetch("/api/notifikasi/mark-all-read", { method: "POST" })
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch {
      // silent
    }
  }

  function handleOpen() {
    setOpen(prev => !prev)
    if (!open) fetchNotifs() // refresh tiap buka
  }

  function goToNotifikasi() {
    setOpen(false)
    router.push("/dashboard/notifikasi")
  }

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      {/* Tombol lonceng */}
      <button
        onClick={handleOpen}
        style={{
          background: "none", border: "none", cursor: "pointer",
          padding: "8px", borderRadius: "8px",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "background 150ms ease", position: "relative",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
        onMouseLeave={e => e.currentTarget.style.background = "none"}
        title="Notifikasi"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={unreadCount > 0 ? "#00205b" : "#374151"} strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>

        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: "4px", right: "4px",
            background: "#ef4444", color: "#fff",
            fontSize: "10px", fontWeight: 700,
            minWidth: "16px", height: "16px",
            borderRadius: "9999px", padding: "0 3px",
            display: "flex", alignItems: "center", justifyContent: "center",
            lineHeight: 1, border: "2px solid #fff",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)",
          width: 340, background: "#fff",
          borderRadius: "14px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
          border: "1px solid #eef0f4",
          zIndex: 200, overflow: "hidden",
        }}>
          {/* Header dropdown */}
          <div style={{
            padding: "14px 18px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
              Notifikasi
            </span>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {unreadCount > 0 && (
                <button onClick={markAllRead} style={{
                  fontSize: "11px", color: "#00205b", fontWeight: 600,
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                }}>
                  Tandai semua dibaca
                </button>
              )}
              {unreadCount > 0 && (
                <span style={{
                  fontSize: "11px", color: "#fff", background: "#ef4444",
                  borderRadius: "9999px", padding: "1px 7px", fontWeight: 700,
                }}>
                  {unreadCount} baru
                </span>
              )}
            </div>
          </div>

          {/* List notifikasi */}
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                Memuat...
              </div>
            ) : notifs.length === 0 ? (
              <div style={{ padding: "32px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>🔔</div>
                <div style={{ fontSize: 13, color: "#9ca3af" }}>Belum ada notifikasi</div>
              </div>
            ) : (
              notifs.map((n) => {
                const cfg = TIPE_CONFIG[n.tipe] ?? TIPE_CONFIG.INFO
                return (
                  <div key={n.id} style={{
                    padding: "12px 18px",
                    borderBottom: "1px solid #f9fafb",
                    display: "flex", gap: "10px", alignItems: "flex-start",
                    background: n.isRead ? "#fff" : "#f8faff",
                    transition: "background 100ms ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
                  onMouseLeave={e => e.currentTarget.style.background = n.isRead ? "#fff" : "#f8faff"}
                  onClick={goToNotifikasi}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: "8px",
                      background: cfg.bg, color: cfg.color, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {cfg.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: "12.5px", color: "#1a1f36", lineHeight: 1.5,
                        fontWeight: n.isRead ? 400 : 600,
                        overflow: "hidden", display: "-webkit-box",
                        WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      }}>
                        {n.pesan}
                      </div>
                      <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "3px" }}>
                        {timeAgo(n.createdAt)}
                        {n.sppd?.nomorSppd && (
                          <span style={{ marginLeft: 6, color: "#00205b", fontWeight: 600 }}>
                            · {n.sppd.nomorSppd}
                          </span>
                        )}
                      </div>
                    </div>
                    {!n.isRead && (
                      <div style={{
                        width: 7, height: 7, borderRadius: "50%",
                        background: "#3b82f6", flexShrink: 0, marginTop: 5,
                      }} />
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Footer — lihat semua */}
          <button onClick={goToNotifikasi} style={{
            width: "100%", padding: "12px",
            background: "#f8f9fb", border: "none",
            borderTop: "1px solid #f3f4f6",
            fontSize: "13px", fontWeight: 600, color: "#00205b",
            cursor: "pointer", textAlign: "center",
            transition: "background 150ms ease",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "#eef1f8"}
          onMouseLeave={e => e.currentTarget.style.background = "#f8f9fb"}
          >
            Lihat semua notifikasi →
          </button>
        </div>
      )}
    </div>
  )
}