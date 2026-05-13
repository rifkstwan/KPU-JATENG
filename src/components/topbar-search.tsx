"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"

type SppdResult = {
  id: string
  nomorSppd: string
  tujuan: string
  status: string
  user: { nama: string; jabatan: string | null }
}
type UserResult = {
  id: string
  nama: string
  nip: string | null
  jabatan: string | null
  divisi: string | null
  role: string
}
type ApprovalResult = {
  id: string
  keputusan: string
  sppd: { nomorSppd: string; tujuan: string; user: { nama: string } }
}

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  DRAFT:    { bg: "#f3f4f6", color: "#6b7280" },
  PENDING:  { bg: "#fffbeb", color: "#d97706" },
  APPROVED: { bg: "#f0fdf4", color: "#16a34a" },
  REJECTED: { bg: "#fef2f2", color: "#dc2626" },
}
const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft", PENDING: "Menunggu", APPROVED: "Disetujui", REJECTED: "Ditolak",
}

export default function TopbarSearch() {
  const [keyword, setKeyword] = useState("")
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{
    sppd: SppdResult[]
    users: UserResult[]
    approvals: ApprovalResult[]
  }>({ sppd: [], users: [], approvals: [] })

  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalResults = results.sppd.length + results.users.length + results.approvals.length

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

  // Debounce search otomatis saat mengetik
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults({ sppd: [], users: [], approvals: [] })
      setOpen(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data)
      setOpen(true)
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setKeyword(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 350)
  }

  const handleClear = () => {
    setKeyword("")
    setOpen(false)
    setResults({ sppd: [], users: [], approvals: [] })
  }

  const goTo = (path: string) => {
    setOpen(false)
    router.push(path)
  }

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      {/* Input */}
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        background: open ? "#fff" : "#f5f6fa",
        borderRadius: "10px", padding: "0 14px",
        width: 280, height: 42,
        border: `1.5px solid ${open ? "#00205b" : "#eef0f4"}`,
        transition: "all 150ms ease",
      }}>
        {loading ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aab0c0" strokeWidth="2.5"
            style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}>
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aab0c0" strokeWidth="2.5" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        )}
        <input
          type="text"
          value={keyword}
          onChange={handleChange}
          onFocus={() => keyword.length >= 2 && setOpen(true)}
          placeholder="Cari SPPD, pegawai, tujuan..."
          style={{
            border: "none", outline: "none", background: "transparent",
            width: "100%", fontSize: "13px", color: "#1a1f36",
          }}
        />
        {keyword && (
          <button onClick={handleClear} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 0, display: "flex", color: "#aab0c0", flexShrink: 0,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Hasil */}
      {open && keyword.length >= 2 && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0,
          width: 380, background: "#fff",
          borderRadius: "14px", border: "1px solid #eef0f4",
          boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
          zIndex: 1000, overflow: "hidden",
          maxHeight: "70vh", overflowY: "auto",
        }}>
          {totalResults === 0 && !loading ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: "#8f95a3", fontSize: "13px" }}>
              <div style={{ fontSize: "24px", marginBottom: "8px" }}>🔍</div>
              Tidak ada hasil untuk <strong>"{keyword}"</strong>
            </div>
          ) : (
            <>
              {/* Hasil SPPD */}
              {results.sppd.length > 0 && (
                <div>
                  <div style={{
                    padding: "10px 16px 6px",
                    fontSize: "10.5px", fontWeight: 700,
                    color: "#9ca3af", letterSpacing: "0.07em",
                    borderBottom: "1px solid #f3f4f6",
                  }}>
                    📄 SPPD ({results.sppd.length} hasil)
                  </div>
                  {results.sppd.map((s) => {
                    const sc = STATUS_COLOR[s.status] ?? STATUS_COLOR.DRAFT
                    return (
                      <button key={s.id} onClick={() => goTo(`/dashboard/sppd`)}
                        style={{
                          width: "100%", padding: "10px 16px",
                          display: "flex", alignItems: "center", gap: "10px",
                          background: "none", border: "none", cursor: "pointer",
                          borderBottom: "1px solid #f9fafb", textAlign: "left",
                          transition: "background 100ms ease",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f8f9fb"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}
                      >
                        <div style={{
                          width: 34, height: 34, borderRadius: "8px",
                          background: "#eef1f8", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00205b" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                          </svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#00205b" }}>
                            {s.nomorSppd}
                          </div>
                          <div style={{ fontSize: "12px", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {s.user.nama} · {s.tujuan}
                          </div>
                        </div>
                        <span style={{
                          fontSize: "11px", fontWeight: 700,
                          padding: "2px 8px", borderRadius: "20px",
                          background: sc.bg, color: sc.color, flexShrink: 0,
                        }}>
                          {STATUS_LABEL[s.status]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Hasil Approval */}
              {results.approvals.length > 0 && (
                <div>
                  <div style={{
                    padding: "10px 16px 6px",
                    fontSize: "10.5px", fontWeight: 700,
                    color: "#9ca3af", letterSpacing: "0.07em",
                    borderBottom: "1px solid #f3f4f6",
                  }}>
                    ✅ Approval ({results.approvals.length} hasil)
                  </div>
                  {results.approvals.map((a) => (
                    <button key={a.id} onClick={() => goTo(`/dashboard/approval`)}
                      style={{
                        width: "100%", padding: "10px 16px",
                        display: "flex", alignItems: "center", gap: "10px",
                        background: "none", border: "none", cursor: "pointer",
                        borderBottom: "1px solid #f9fafb", textAlign: "left",
                        transition: "background 100ms ease",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f8f9fb"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: "8px",
                        background: a.keputusan === "APPROVED" ? "#f0fdf4" : "#fef2f2",
                        flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke={a.keputusan === "APPROVED" ? "#16a34a" : "#dc2626"} strokeWidth="2.5">
                          {a.keputusan === "APPROVED"
                            ? <polyline points="20 6 9 17 4 12"/>
                            : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                          }
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#00205b" }}>
                          {a.sppd.nomorSppd}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {a.sppd.user.nama} · {a.sppd.tujuan}
                        </div>
                      </div>
                      <span style={{
                        fontSize: "11px", fontWeight: 700, padding: "2px 8px",
                        borderRadius: "20px", flexShrink: 0,
                        background: a.keputusan === "APPROVED" ? "#f0fdf4" : "#fef2f2",
                        color: a.keputusan === "APPROVED" ? "#16a34a" : "#dc2626",
                      }}>
                        {a.keputusan === "APPROVED" ? "Disetujui" : "Ditolak"}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Hasil User (Admin only) */}
              {results.users.length > 0 && (
                <div>
                  <div style={{
                    padding: "10px 16px 6px",
                    fontSize: "10.5px", fontWeight: 700,
                    color: "#9ca3af", letterSpacing: "0.07em",
                    borderBottom: "1px solid #f3f4f6",
                  }}>
                    👤 Pegawai ({results.users.length} hasil)
                  </div>
                  {results.users.map((u) => (
                    <button key={u.id} onClick={() => goTo(`/dashboard/admin`)}
                      style={{
                        width: "100%", padding: "10px 16px",
                        display: "flex", alignItems: "center", gap: "10px",
                        background: "none", border: "none", cursor: "pointer",
                        borderBottom: "1px solid #f9fafb", textAlign: "left",
                        transition: "background 100ms ease",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f8f9fb"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                      <div style={{
                        width: 34, height: 34, borderRadius: "8px",
                        background: "#eef1f8", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "12px", fontWeight: 700, color: "#00205b",
                      }}>
                        {u.nama.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1f36" }}>{u.nama}</div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>
                          {[u.jabatan, u.divisi].filter(Boolean).join(" · ") || u.role}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Footer */}
          <div style={{
            padding: "10px 16px", borderTop: "1px solid #f3f4f6",
            fontSize: "11px", color: "#aab0c0", textAlign: "center",
          }}>
            Tekan Enter atau klik hasil untuk membuka halaman
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}