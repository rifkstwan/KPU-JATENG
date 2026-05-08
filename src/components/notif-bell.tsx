"use client"

import { useEffect, useState, useRef, useCallback } from "react"

type Notif = {
  id: string
  pesan: string
  tipe: string
  isRead: boolean
  createdAt: string
}

export default function NotifBell() {
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetchNotifs = useCallback(async () => {
    const res = await fetch("/api/notifikasi")
    if (res.ok) {
      const data = await res.json()
      setNotifs(data)
    }
  }, [])

  useEffect(() => {
    void fetchNotifs()
    const interval = setInterval(() => void fetchNotifs(), 30000)
    return () => clearInterval(interval)
  }, [fetchNotifs])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const unread = notifs.filter(n => !n.isRead).length

  const handleOpen = async () => {
    setOpen(prev => !prev)
    if (!open && unread > 0) {
      await fetch("/api/notifikasi", { method: "PATCH" })
      setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))
    }
  }

  const tipeIcon: Record<string, string> = {
    APPROVED: "✅",
    REJECTED: "❌",
    PENDING: "⏳",
    INFO: "ℹ️",
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => void handleOpen()}
        style={{
          background: "none", border: "none", cursor: "pointer",
          padding: "6px", position: "relative", fontSize: "1.2rem",
        }}
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: "absolute", top: "0", right: "0",
            background: "#dc2626", color: "white",
            borderRadius: "9999px", fontSize: "0.65rem",
            fontWeight: 700, minWidth: "16px", height: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px",
          }}>
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "36px",
          width: "320px", background: "white",
          border: "1px solid #e5e7eb", borderRadius: "8px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 100,
        }}>
          <div style={{
            padding: "12px 16px", borderBottom: "1px solid #e5e7eb",
            fontWeight: 700, fontSize: "0.9rem",
          }}>
            Notifikasi
          </div>
          {notifs.length === 0 ? (
            <div style={{
              padding: "16px", color: "#888",
              fontSize: "0.85rem", textAlign: "center",
            }}>
              Tidak ada notifikasi
            </div>
          ) : (
            notifs.map(n => (
              <div key={n.id} style={{
                padding: "12px 16px",
                borderBottom: "1px solid #f0f0f0",
                background: n.isRead ? "white" : "#eff6ff",
                fontSize: "0.85rem",
              }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <span>{tipeIcon[n.tipe] || "ℹ️"}</span>
                  <div>
                    <p style={{ margin: 0, color: "#333" }}>{n.pesan}</p>
                    <p style={{ margin: "2px 0 0", color: "#999", fontSize: "0.75rem" }}>
                      {new Date(n.createdAt).toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}