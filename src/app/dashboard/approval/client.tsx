"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

type PendingItem = {
  id: string
  nomorSppd: string
  tujuan: string
  maksud: string
  transport: string
  anggaran: number
  catatan: string | null
  status: string
  tglBerangkat: string
  tglKembali: string
  createdAt: string
  user: { nama: string; nip: string | null; jabatan: string | null; divisi: string | null }
}

type RiwayatItem = {
  id: string
  keputusan: string
  catatan: string | null
  approvedAt: string
  sppd: {
    nomorSppd: string
    tujuan: string
    anggaran: number
    tglBerangkat: string
    tglKembali: string
    user: { nama: string }
  }
}

const TRANSPORT_ICON: Record<string, React.ReactNode> = {
  DARAT: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <path d="M16 8h4l3 5v3h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  UDARA: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5 18 1 16 1 14.5 2.5L11 6 2.8 4.2 1 6l7.5 5L6 14H4l-1 1 3.5 1.5L8 20l1-1v-2l2.5-2.5 5 7.5 2-1.8z" />
    </svg>
  ),
  KERETA: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="3" width="16" height="16" rx="2" />
      <path d="M4 11h16M12 3v8" />
      <circle cx="8.5" cy="19" r="1.5" />
      <circle cx="15.5" cy="19" r="1.5" />
      <path d="M8 19H5l-2 2M16 19h3l2 2" />
    </svg>
  ),
  LAUT: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 20a2.4 2.4 0 001.5.5c.8 0 1.5-.3 2-.8.5.5 1.2.8 2 .8s1.5-.3 2-.8c.5.5 1.2.8 2 .8s1.5-.3 2-.8c.5.5 1.2.8 2 .8.6 0 1.1-.2 1.5-.5" />
      <path d="M4 18l-1-5h18l-2 5M12 2v8M6.5 10l5.5-4 5.5 4" />
    </svg>
  ),
}

const TRANSPORT_LABEL: Record<string, string> = {
  DARAT: "Darat",
  UDARA: "Udara",
  KERETA: "Kereta",
  LAUT: "Laut",
}

const IconPin = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)
const IconClock = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)
const IconCalendar = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)
const IconMoney = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
)
const IconTransport = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="3" width="15" height="13" rx="2" />
    <path d="M16 8h4l3 5v3h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)

function formatRupiah(val: number) {
  return "Rp " + (val || 0).toLocaleString("id-ID")
}
function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}
function durasi(a: string, b: string) {
  return Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000) + 1)
}
function timeAgo(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  const h = Math.floor((Date.now() - new Date(iso).getTime()) / 3600000)
  if (d > 0) return `${d} hari lalu`
  if (h > 0) return `${h} jam lalu`
  return "Baru saja"
}
function getInitials(nama: string) {
  return nama
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function TransportBadge({ transport }: { transport: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "3px 9px",
        borderRadius: "6px",
        background: "#f3f4f6",
        color: "#374151",
        fontSize: "12px",
        fontWeight: 600,
      }}
    >
      {TRANSPORT_ICON[transport]}
      {TRANSPORT_LABEL[transport] ?? transport}
    </span>
  )
}

function InfoCell({
  label,
  value,
  valueNode,
  icon,
  noBorderRight,
  noBorderBottom,
}: {
  label: string
  value?: string
  valueNode?: React.ReactNode
  icon?: React.ReactNode
  noBorderRight?: boolean
  noBorderBottom?: boolean
}) {
  return (
    <div
      style={{
        padding: "13px 16px",
        borderRight: noBorderRight ? "none" : "1px solid #eef0f4",
        borderBottom: noBorderBottom ? "none" : "1px solid #eef0f4",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "10.5px",
          color: "#8f95a3",
          fontWeight: 600,
          letterSpacing: "0.05em",
          marginBottom: "6px",
        }}
      >
        {icon}
        {label}
      </div>
      {valueNode ?? (
        <div style={{ fontSize: "13px", color: "#1a1f36", fontWeight: 600 }}>{value}</div>
      )}
    </div>
  )
}

export default function ApprovalClient({
  pending: initialPending,
  riwayat: initialRiwayat,
}: {
  pending: PendingItem[]
  riwayat: RiwayatItem[]
}) {
  const router = useRouter()
  const [pending, setPending] = useState(initialPending)
  const [riwayat, setRiwayat] = useState(initialRiwayat)
  const [selected, setSelected] = useState<PendingItem | null>(null)
  const [tab, setTab] = useState<"antrian" | "riwayat">("antrian")
  const [isPending, startTransition] = useTransition()
  const [catatan, setCatatan] = useState("")
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED" | null>(null)
  const [error, setError] = useState<string | null>(null)

  function openReview(item: PendingItem) {
    setSelected(item)
    setCatatan("")
    setActionType(null)
    setError(null)
  }
  function closeModal() {
    setSelected(null)
    setCatatan("")
    setActionType(null)
    setError(null)
  }

  function handleKeputusan(keputusan: "APPROVED" | "REJECTED") {
    if (!selected) return
    if (keputusan === "REJECTED" && !catatan.trim()) {
      setError("Catatan wajib diisi saat menolak pengajuan")
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch(`/api/approval/${selected.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keputusan, catatan: catatan.trim() || null }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? "Gagal memproses")
        setPending(prev => prev.filter(p => p.id !== selected.id))
        setRiwayat(prev => [
          {
            id: json.approvalId,
            keputusan,
            catatan: catatan.trim() || null,
            approvedAt: new Date().toISOString(),
            sppd: {
              nomorSppd: selected.nomorSppd,
              tujuan: selected.tujuan,
              anggaran: selected.anggaran,
              tglBerangkat: selected.tglBerangkat,
              tglKembali: selected.tglKembali,
              user: selected.user,
            },
          },
          ...prev,
        ])
        closeModal()
        router.refresh()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan")
      }
    })
  }

  const hariSelected = selected ? durasi(selected.tglBerangkat, selected.tglKembali) : 0

  return (
    <div>
      {/* Tab Switcher */}
      <div
        style={{
          display: "flex",
          marginBottom: "16px",
          background: "#f3f4f6",
          borderRadius: "10px",
          padding: "4px",
          width: "fit-content",
        }}
      >
        {[
          { key: "antrian", label: `Antrian (${pending.length})` },
          { key: "riwayat", label: "Riwayat Keputusan" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as "antrian" | "riwayat")}
            style={{
              padding: "8px 18px",
              borderRadius: "7px",
              background: tab === t.key ? "#fff" : "transparent",
              color: tab === t.key ? "#00205b" : "#6b7280",
              fontSize: "13px",
              fontWeight: tab === t.key ? 700 : 500,
              border: "none",
              cursor: "pointer",
              boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 150ms ease",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Antrian */}
      {tab === "antrian" && (
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #eef0f4",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            overflow: "hidden",
          }}
        >
          {pending.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "64px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  background: "#f0fdf4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "14px",
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#16a34a"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#374151",
                  marginBottom: "4px",
                }}
              >
                Tidak ada antrian
              </div>
              <div style={{ fontSize: "13px", color: "#8f95a3" }}>
                Semua pengajuan sudah diproses
              </div>
            </div>
          ) : (
            pending.map((item, idx) => {
              const hariItem = durasi(item.tglBerangkat, item.tglKembali)
              const isLast = idx === pending.length - 1
              return (
                <div
                  key={item.id}
                  style={{
                    padding: "16px 20px",
                    borderBottom: isLast ? "none" : "1px solid #f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    transition: "background 120ms ease",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fafbfc")}
                  onMouseLeave={e =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "12px",
                      background: "#eef1f8",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#00205b",
                    }}
                  >
                    {getInitials(item.user.nama)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "3px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "#1a1f36",
                        }}
                      >
                        {item.user.nama}
                      </span>
                      {item.user.jabatan && (
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#8f95a3",
                            background: "#f3f4f6",
                            padding: "2px 7px",
                            borderRadius: "20px",
                            fontWeight: 500,
                          }}
                        >
                          {item.user.jabatan}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginBottom: "5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          color: "#00205b",
                        }}
                      >
                        {item.nomorSppd}
                      </span>
                      <span style={{ color: "#d1d5db" }}>·</span>
                      <span>{item.tujuan}</span>
                      <span style={{ color: "#d1d5db" }}>·</span>
                      <span>
                        {formatTanggal(item.tglBerangkat)} —{" "}
                        {formatTanggal(item.tglKembali)}
                      </span>
                      <span
                        style={{
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          padding: "1px 6px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        {hariItem} hari
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <TransportBadge transport={item.transport} />
                      <span
                        style={{ fontSize: "12px", color: "#8f95a3" }}
                      >
                        {formatRupiah(item.anggaran)}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#aab0c0",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {timeAgo(item.createdAt)}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      flexShrink: 0,
                    }}
                  >
                    <button
                      onClick={() => openReview(item)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "8px",
                        border: "1.5px solid #e2e5ec",
                        background: "#fff",
                        color: "#1a1f36",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        transition: "border-color 150ms ease",
                      }}
                      onMouseEnter={e =>
                        (e.currentTarget.style.borderColor = "#00205b")
                      }
                      onMouseLeave={e =>
                        (e.currentTarget.style.borderColor = "#e2e5ec")
                      }
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Review
                    </button>
                    <button
                      onClick={() => {
                        setSelected(item)
                        setActionType("APPROVED")
                      }}
                      title="Setujui"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "8px",
                        border: "1.5px solid #bbf7d0",
                        background: "#f0fdf4",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#16a34a",
                        transition: "background 150ms ease",
                      }}
                      onMouseEnter={e =>
                        (e.currentTarget.style.background = "#dcfce7")
                      }
                      onMouseLeave={e =>
                        (e.currentTarget.style.background = "#f0fdf4")
                      }
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setSelected(item)
                        setActionType("REJECTED")
                      }}
                      title="Tolak"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "8px",
                        border: "1.5px solid #fecaca",
                        background: "#fef2f2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#dc2626",
                        transition: "background 150ms ease",
                      }}
                      onMouseEnter={e =>
                        (e.currentTarget.style.background = "#fee2e2")
                      }
                      onMouseLeave={e =>
                        (e.currentTarget.style.background = "#fef2f2")
                      }
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Tab Riwayat */}
      {tab === "riwayat" && (
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #eef0f4",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            overflow: "hidden",
          }}
        >
          {riwayat.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "64px 24px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Belum ada riwayat keputusan
              </div>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: "#f8f9fb",
                    borderBottom: "1px solid #eef0f4",
                  }}
                >
                  {[
                    "NOMOR SPPD",
                    "PEGAWAI",
                    "TUJUAN",
                    "ANGGARAN",
                    "KEPUTUSAN",
                    "TANGGAL PROSES",
                  ].map(h => (
                    <th
                      key={h}
                      style={{
                        padding: "11px 16px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#9ca3af",
                        letterSpacing: "0.06em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {riwayat.map((r, idx) => {
                  const isApproved = r.keputusan === "APPROVED"
                  const isLast = idx === riwayat.length - 1
                  return (
                    <tr
                      key={r.id}
                      style={{
                        borderBottom: isLast ? "none" : "1px solid #f3f4f6",
                      }}
                      onMouseEnter={e =>
                        (e.currentTarget.style.background = "#fafbfc")
                      }
                      onMouseLeave={e =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={{ padding: "13px 16px" }}>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#00205b",
                          }}
                        >
                          {r.sppd.nomorSppd}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: "13px",
                          color: "#1a1f36",
                        }}
                      >
                        {r.sppd.user.nama}
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: "13px",
                          color: "#6b7280",
                        }}
                      >
                        {r.sppd.tujuan}
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#1a1f36",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatRupiah(r.sppd.anggaran)}
                      </td>
                      <td style={{ padding: "13px 16px" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "3px",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              padding: "3px 10px",
                              borderRadius: "20px",
                              background: isApproved
                                ? "#f0fdf4"
                                : "#fef2f2",
                              color: isApproved
                                ? "#16a34a"
                                : "#dc2626",
                              fontSize: "11.5px",
                              fontWeight: 700,
                              width: "fit-content",
                            }}
                          >
                            <span
                              style={{
                                width: 5,
                                height: 5,
                                borderRadius: "50%",
                                background: isApproved
                                  ? "#22c55e"
                                  : "#ef4444",
                              }}
                            />
                            {isApproved ? "Disetujui" : "Ditolak"}
                          </span>
                          {r.catatan && (
                            <span
                              style={{
                                fontSize: "11px",
                                color: "#8f95a3",
                                fontStyle: "italic",
                                maxWidth: "200px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              "{r.catatan}"
                            </span>
                          )}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "13px 16px",
                          fontSize: "12px",
                          color: "#6b7280",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatTanggal(r.approvedAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal Review */}
      {selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            overflowY: "auto",
            padding: "88px 20px 24px",
            boxSizing: "border-box",
          }}
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              width: "100%",
              maxWidth: "540px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              maxHeight: "calc(100vh - 112px)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #eef0f4",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "sticky",
                top: 0,
                background: "#fff",
                zIndex: 1,
                borderRadius: "20px 20px 0 0",
                flexShrink: 0,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "#1a1f36",
                  }}
                >
                  {selected.nomorSppd}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#8f95a3",
                    marginTop: "2px",
                  }}
                >
                  Review Pengajuan SPPD
                </div>
              </div>

              <button
                onClick={closeModal}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  border: "1.5px solid #e2e5ec",
                  background: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6b7280",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div
              style={{
                padding: "20px 24px 24px",
                overflowY: "auto",
              }}
            >
              {/* Pengaju Card */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "14px",
                  borderRadius: "12px",
                  background: "#f8f9fb",
                  border: "1px solid #eef0f4",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    background: "#00205b",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {getInitials(selected.user.nama)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#1a1f36",
                    }}
                  >
                    {selected.user.nama}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#8f95a3",
                      marginTop: "2px",
                      lineHeight: 1.5,
                    }}
                  >
                    {[selected.user.jabatan, selected.user.divisi]
                      .filter(Boolean)
                      .join(" · ")}
                    {selected.user.nip && (
                      <span style={{ color: "#aab0c0" }}>
                        {" "}
                        · NIP: {selected.user.nip}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  borderRadius: "12px",
                  boxShadow: "0 0 0 1px #eef0f4",
                  overflow: "hidden",
                  marginBottom: "16px",
                }}
              >
                <InfoCell
                  label="KOTA TUJUAN"
                  value={selected.tujuan}
                  icon={IconPin}
                />
                <InfoCell
                  label="TRANSPORTASI"
                  valueNode={<TransportBadge transport={selected.transport} />}
                  icon={IconTransport}
                  noBorderRight
                />
                <InfoCell
                  label="TGL BERANGKAT"
                  value={formatTanggal(selected.tglBerangkat)}
                  icon={IconCalendar}
                />
                <InfoCell
                  label="TGL KEMBALI"
                  value={formatTanggal(selected.tglKembali)}
                  icon={IconCalendar}
                  noBorderRight
                />
                <InfoCell
                  label="DURASI"
                  noBorderBottom
                  icon={IconClock}
                  valueNode={
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "13px",
                        fontWeight: 700,
                        color:
                          hariSelected > 3 ? "#d97706" : "#1a1f36",
                      }}
                    >
                      {hariSelected} hari
                      {hariSelected > 3 && (
                        <span
                          style={{
                            fontSize: "10px",
                            color: "#d97706",
                            background: "#fffbeb",
                            border: "1px solid #fde68a",
                            padding: "1px 5px",
                            borderRadius: "4px",
                            fontWeight: 600,
                          }}
                        >
                          Panjang
                        </span>
                      )}
                    </span>
                  }
                />
                <InfoCell
                  label="ESTIMASI ANGGARAN"
                  noBorderRight
                  noBorderBottom
                  icon={IconMoney}
                  valueNode={
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#1a1f36",
                      }}
                    >
                      {formatRupiah(selected.anggaran)}
                    </span>
                  }
                />
              </div>

              {/* Keperluan */}
              <div style={{ marginBottom: "12px" }}>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#8f95a3",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    marginBottom: "6px",
                  }}
                >
                  KEPERLUAN
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#1a1f36",
                    lineHeight: 1.65,
                    background: "#f9fafb",
                    padding: "11px 14px",
                    borderRadius: "10px",
                    border: "1px solid #eef0f4",
                  }}
                >
                  {selected.maksud}
                </div>
              </div>

              {/* Catatan Pengaju */}
              {selected.catatan && (
                <div style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#8f95a3",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                      marginBottom: "6px",
                    }}
                  >
                    CATATAN PENGAJU
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#1a1f36",
                      lineHeight: 1.65,
                      background: "#f9fafb",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      border: "1px solid #eef0f4",
                      fontStyle: "italic",
                    }}
                  >
                    {selected.catatan}
                  </div>
                </div>
              )}

              <div
                style={{
                  borderTop: "1px solid #eef0f4",
                  margin: "16px 0",
                }}
              />

              {/* Catatan Keputusan */}
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "6px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    CATATAN KEPUTUSAN
                  </label>
                  {actionType === "REJECTED" && (
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#dc2626",
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        padding: "1px 7px",
                        borderRadius: "4px",
                        fontWeight: 600,
                      }}
                    >
                      Wajib diisi
                    </span>
                  )}
                </div>

                <textarea
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  rows={3}
                  placeholder={
                    actionType === "REJECTED"
                      ? "Jelaskan alasan penolakan pengajuan ini..."
                      : "Catatan tambahan untuk pengaju (opsional)"
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: `1.5px solid ${
                      actionType === "REJECTED" &&
                      !catatan.trim() &&
                      error
                        ? "#fca5a5"
                        : "#e2e5ec"
                    }`,
                    fontSize: "13px",
                    outline: "none",
                    fontFamily: "inherit",
                    resize: "vertical",
                    lineHeight: 1.6,
                    boxSizing: "border-box",
                    color: "#1a1f36",
                    transition: "border-color 150ms ease",
                  }}
                  onFocus={e =>
                    (e.currentTarget.style.borderColor = "#00205b")
                  }
                  onBlur={e =>
                    (e.currentTarget.style.borderColor = "#e2e5ec")
                  }
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    marginBottom: "14px",
                    background: "#fef2f2",
                    color: "#dc2626",
                    fontSize: "13px",
                    fontWeight: 600,
                    border: "1px solid #fecaca",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                <button
                  onClick={() => handleKeputusan("REJECTED")}
                  disabled={isPending}
                  style={{
                    padding: "11px 16px",
                    borderRadius: "10px",
                    border: "1.5px solid #fecaca",
                    background: "#fff",
                    color: "#dc2626",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: isPending ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "7px",
                    transition: "background 150ms ease",
                    opacity: isPending ? 0.6 : 1,
                  }}
                  onMouseEnter={e => {
                    if (!isPending)
                      e.currentTarget.style.background = "#fef2f2"
                  }}
                  onMouseLeave={e =>
                    (e.currentTarget.style.background = "#fff")
                  }
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Tolak Pengajuan
                </button>

                <button
                  onClick={() => handleKeputusan("APPROVED")}
                  disabled={isPending}
                  style={{
                    padding: "11px 16px",
                    borderRadius: "10px",
                    background: isPending ? "#93a8d4" : "#00205b",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 700,
                    border: "none",
                    cursor: isPending ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "7px",
                    transition: "background 150ms ease",
                  }}
                  onMouseEnter={e => {
                    if (!isPending)
                      e.currentTarget.style.background = "#003d9e"
                  }}
                  onMouseLeave={e => {
                    if (!isPending)
                      e.currentTarget.style.background = "#00205b"
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {isPending ? "Memproses..." : "Setujui Pengajuan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}