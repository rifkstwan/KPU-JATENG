"use client"

import { useState, useTransition, useRef } from "react"

type SPPDItem = {
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
  approver: string | null
  catatanApprover: string | null
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  DRAFT:    { label: "Draft",     bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af" },
  PENDING:  { label: "Menunggu",  bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
  APPROVED: { label: "Disetujui", bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e" },
  REJECTED: { label: "Ditolak",   bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
}

const TRANSPORT_OPTS = [
  { value: "DARAT",  label: "🚗 Darat" },
  { value: "UDARA",  label: "✈️ Udara" },
  { value: "KERETA", label: "🚂 Kereta" },
  { value: "LAUT",   label: "🚢 Laut" },
]

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
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)) + 1)
}

function inputStyle(readOnly = false): React.CSSProperties {
  return {
    width: "100%", padding: "10px 12px", borderRadius: "10px",
    border: `1.5px solid ${readOnly ? "#f3f4f6" : "#e2e5ec"}`,
    fontSize: "13px", outline: "none",
    background: readOnly ? "#f9fafb" : "#fff",
    color: readOnly ? "#9ca3af" : "#1a1f36",
    fontFamily: "inherit", boxSizing: "border-box",
    cursor: readOnly ? "not-allowed" : "text",
  }
}

type ModalMode = "create" | "edit" | "detail" | null

export default function PengajuanClient({ data: initial, userId }: { data: SPPDItem[]; userId: string }) {
  const [data, setData] = useState(initial)
  const [mode, setMode] = useState<ModalMode>(null)
  const [selected, setSelected] = useState<SPPDItem | null>(null)
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [search, setSearch] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const displayed = data.filter(item => {
    const matchStatus = filterStatus === "ALL" || item.status === filterStatus
    const matchSearch =
      item.nomorSppd.toLowerCase().includes(search.toLowerCase()) ||
      item.tujuan.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  function openCreate() {
    setSelected(null)
    setError(null)
    setMode("create")
  }

  function openEdit(item: SPPDItem) {
    if (item.status !== "DRAFT" && item.status !== "REJECTED") return
    setSelected(item)
    setError(null)
    setMode("edit")
  }

  function openDetail(item: SPPDItem) {
    setSelected(item)
    setMode("detail")
  }

  function closeModal() {
    setMode(null)
    setSelected(null)
    setError(null)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const body = {
      tujuan: (fd.get("tujuan") as string).trim(),
      maksud: (fd.get("maksud") as string).trim(),
      tglBerangkat: fd.get("tglBerangkat") as string,
      tglKembali: fd.get("tglKembali") as string,
      transport: fd.get("transport") as string,
      anggaran: parseInt((fd.get("anggaran") as string).replace(/\D/g, "")) || 0,
      catatan: (fd.get("catatan") as string).trim() || null,
    }

    if (!body.tujuan || !body.maksud || !body.tglBerangkat || !body.tglKembali) {
      setError("Harap lengkapi semua field wajib")
      return
    }
    if (new Date(body.tglKembali) < new Date(body.tglBerangkat)) {
      setError("Tanggal kembali tidak boleh sebelum tanggal berangkat")
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        const url = mode === "edit" ? `/api/pengajuan/${selected?.id}` : "/api/pengajuan"
        const method = mode === "edit" ? "PUT" : "POST"
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan")

        if (mode === "create") {
          setData(prev => [json.data, ...prev])
        } else {
          setData(prev => prev.map(d => d.id === selected?.id ? { ...d, ...json.data } : d))
        }
        closeModal()
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan")
      }
    })
  }

  function handleSubmitPending(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/pengajuan/${id}/submit`, { method: "POST" })
      if (res.ok) {
        setData(prev => prev.map(d => d.id === id ? { ...d, status: "PENDING" } : d))
        closeModal()
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/pengajuan/${id}`, { method: "DELETE" })
      if (res.ok) {
        setData(prev => prev.filter(d => d.id !== id))
        setConfirmDelete(null)
      }
    })
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{
        background: "#fff", borderRadius: "14px",
        border: "1px solid #eef0f4",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        padding: "14px 20px", marginBottom: "16px",
        display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap",
      }}>
        {/* Status Pills */}
        <div style={{ display: "flex", gap: "6px" }}>
          {["ALL", "DRAFT", "PENDING", "APPROVED", "REJECTED"].map(s => {
            const isActive = filterStatus === s
            const cfg = s !== "ALL" ? STATUS_CONFIG[s] : null
            return (
              <button key={s} onClick={() => setFilterStatus(s)}
                style={{
                  padding: "7px 13px", borderRadius: "20px",
                  border: `1.5px solid ${isActive ? "#00205b" : "#e2e5ed"}`,
                  background: isActive ? "#00205b" : "#fff",
                  color: isActive ? "#fff" : "#6b7280",
                  fontSize: "12px", fontWeight: isActive ? 700 : 500,
                  cursor: "pointer", outline: "none",
                  display: "flex", alignItems: "center", gap: "5px",
                  transition: "all 150ms ease",
                }}>
                {cfg && <span style={{ width: 6, height: 6, borderRadius: "50%", background: isActive ? "#fff" : cfg.dot }} />}
                {s === "ALL" ? "Semua" : STATUS_CONFIG[s].label}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div style={{ flex: 1, minWidth: "160px", position: "relative" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aab0c0" strokeWidth="2"
            style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input placeholder="Cari nomor / tujuan..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle(), paddingLeft: "30px" }}
            onFocus={e => e.currentTarget.style.borderColor = "#00205b"}
            onBlur={e => e.currentTarget.style.borderColor = "#e2e5ec"}
          />
        </div>

        {/* Tombol Ajukan */}
        <button onClick={openCreate}
          style={{
            marginLeft: "auto", padding: "9px 18px", borderRadius: "10px",
            background: "#00205b", color: "#fff",
            fontSize: "13px", fontWeight: 700, border: "none",
            cursor: "pointer", display: "flex", alignItems: "center", gap: "7px",
            whiteSpace: "nowrap",
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Ajukan SPPD
        </button>
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
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "4px" }}>
              Belum ada pengajuan
            </div>
            <div style={{ fontSize: "13px", color: "#8f95a3", marginBottom: "16px" }}>
              Klik tombol "Ajukan SPPD" untuk membuat pengajuan baru
            </div>
            <button onClick={openCreate}
              style={{
                padding: "9px 20px", borderRadius: "10px",
                background: "#00205b", color: "#fff",
                fontSize: "13px", fontWeight: 700, border: "none", cursor: "pointer",
              }}>
              Ajukan SPPD Pertama
            </button>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #eef0f4" }}>
                {["NOMOR SPPD", "TUJUAN", "TANGGAL", "TRANSPORT", "ANGGARAN", "STATUS", "AKSI"].map(h => (
                  <th key={h} style={{
                    padding: "11px 16px", textAlign: "left",
                    fontSize: "11px", fontWeight: 700,
                    color: "#9ca3af", letterSpacing: "0.06em", whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayed.map((item, idx) => {
                const cfg = STATUS_CONFIG[item.status]
                const isLast = idx === displayed.length - 1
                return (
                  <tr key={item.id}
                    style={{ borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#fafbfc")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#00205b" }}>{item.nomorSppd}</div>
                      <div style={{ fontSize: "11px", color: "#aab0c0" }}>{formatTanggal(item.createdAt)}</div>
                    </td>
                    <td style={{ padding: "13px 16px", maxWidth: "200px" }}>
                      <div style={{ fontSize: "13px", color: "#1a1f36", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.tujuan}</div>
                      <div style={{ fontSize: "12px", color: "#8f95a3", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.maksud}</div>
                    </td>
                    <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "12px", color: "#1a1f36" }}>{formatTanggal(item.tglBerangkat)}</div>
                      <div style={{ fontSize: "11px", color: "#8f95a3" }}>{durasi(item.tglBerangkat, item.tglKembali)} hari</div>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: "12px", color: "#6b7280", whiteSpace: "nowrap" }}>
                      {TRANSPORT_OPTS.find(t => t.value === item.transport)?.label ?? item.transport}
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: "13px", fontWeight: 600, color: "#1a1f36", whiteSpace: "nowrap" }}>
                      {formatRupiah(item.anggaran)}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        padding: "3px 10px", borderRadius: "20px",
                        background: cfg.bg, color: cfg.color,
                        fontSize: "11.5px", fontWeight: 700,
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.dot }} />
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {/* Detail */}
                        <button onClick={() => openDetail(item)} title="Lihat Detail"
                          style={{
                            width: 32, height: 32, borderRadius: "8px",
                            border: "1.5px solid #e2e5ec", background: "#fff",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", color: "#6b7280",
                          }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                        {/* Edit — hanya DRAFT atau REJECTED */}
                        {(item.status === "DRAFT" || item.status === "REJECTED") && (
                          <button onClick={() => openEdit(item)} title="Edit"
                            style={{
                              width: 32, height: 32, borderRadius: "8px",
                              border: "1.5px solid #e2e5ec", background: "#fff",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              cursor: "pointer", color: "#00205b",
                            }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                        )}
                        {/* Hapus — hanya DRAFT */}
                        {item.status === "DRAFT" && (
                          <button onClick={() => setConfirmDelete(item.id)} title="Hapus"
                            style={{
                              width: 32, height: 32, borderRadius: "8px",
                              border: "1.5px solid #fee2e2", background: "#fff",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              cursor: "pointer", color: "#dc2626",
                            }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                            </svg>
                          </button>
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

      {/* ── MODAL CREATE / EDIT ── */}
      {(mode === "create" || mode === "edit") && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px",
        }} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={{
            background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "560px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            maxHeight: "90vh", overflow: "auto",
          }}>
            {/* Header */}
            <div style={{
              padding: "20px 24px 16px", borderBottom: "1px solid #eef0f4",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              position: "sticky", top: 0, background: "#fff", zIndex: 1,
            }}>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#1a1f36" }}>
                {mode === "create" ? "Ajukan SPPD Baru" : "Edit Pengajuan SPPD"}
              </div>
              <button onClick={closeModal}
                style={{ width: 32, height: 32, borderRadius: "8px", border: "1.5px solid #e2e5ec", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Form */}
            <form ref={formRef} onSubmit={handleSubmit} style={{ padding: "20px 24px 24px" }}>
              {error && (
                <div style={{
                  padding: "10px 14px", borderRadius: "8px", marginBottom: "16px",
                  background: "#fef2f2", color: "#dc2626", fontSize: "13px", fontWeight: 600,
                  border: "1px solid #fecaca",
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {/* Tujuan */}
                <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>
                    KOTA TUJUAN <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input name="tujuan" defaultValue={selected?.tujuan ?? ""}
                    placeholder="Contoh: Jakarta, Surabaya"
                    style={inputStyle()}
                    onFocus={e => e.currentTarget.style.borderColor = "#00205b"}
                    onBlur={e => e.currentTarget.style.borderColor = "#e2e5ec"}
                  />
                </div>

                {/* Maksud */}
                <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>
                    KEPERLUAN / MAKSUD <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <textarea name="maksud" defaultValue={selected?.maksud ?? ""}
                    rows={3}
                    placeholder="Jelaskan keperluan perjalanan dinas..."
                    style={{ ...inputStyle(), resize: "vertical", lineHeight: 1.5 }}
                    onFocus={e => e.currentTarget.style.borderColor = "#00205b"}
                    onBlur={e => e.currentTarget.style.borderColor = "#e2e5ec"}
                  />
                </div>

                {/* Tanggal Berangkat */}
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>
                    TGL BERANGKAT <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input name="tglBerangkat" type="date"
                    defaultValue={selected?.tglBerangkat?.split("T")[0] ?? ""}
                    style={inputStyle()}
                    onFocus={e => e.currentTarget.style.borderColor = "#00205b"}
                    onBlur={e => e.currentTarget.style.borderColor = "#e2e5ec"}
                  />
                </div>

                {/* Tanggal Kembali */}
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>
                    TGL KEMBALI <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input name="tglKembali" type="date"
                    defaultValue={selected?.tglKembali?.split("T")[0] ?? ""}
                    style={inputStyle()}
                    onFocus={e => e.currentTarget.style.borderColor = "#00205b"}
                    onBlur={e => e.currentTarget.style.borderColor = "#e2e5ec"}
                  />
                </div>

                {/* Transport */}
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>TRANSPORTASI</label>
                  <select name="transport" defaultValue={selected?.transport ?? "DARAT"}
                    style={{ ...inputStyle(), cursor: "pointer" }}
                    onFocus={e => e.currentTarget.style.borderColor = "#00205b"}
                    onBlur={e => e.currentTarget.style.borderColor = "#e2e5ec"}
                  >
                    {TRANSPORT_OPTS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Anggaran */}
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>ESTIMASI ANGGARAN (Rp)</label>
                  <input name="anggaran" type="number" min={0}
                    defaultValue={selected?.anggaran ?? 0}
                    placeholder="0"
                    style={inputStyle()}
                    onFocus={e => e.currentTarget.style.borderColor = "#00205b"}
                    onBlur={e => e.currentTarget.style.borderColor = "#e2e5ec"}
                  />
                </div>

                {/* Catatan */}
                <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>CATATAN (opsional)</label>
                  <textarea name="catatan" defaultValue={selected?.catatan ?? ""}
                    rows={2}
                    placeholder="Catatan tambahan jika ada..."
                    style={{ ...inputStyle(), resize: "vertical", lineHeight: 1.5 }}
                    onFocus={e => e.currentTarget.style.borderColor = "#00205b"}
                    onBlur={e => e.currentTarget.style.borderColor = "#e2e5ec"}
                  />
                </div>
              </div>

              {/* Footer */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #eef0f4",
                gap: "10px",
              }}>
                <button type="button" onClick={closeModal}
                  style={{
                    padding: "9px 20px", borderRadius: "10px",
                    border: "1.5px solid #e2e5ec", background: "#fff",
                    color: "#6b7280", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  }}>
                  Batal
                </button>
                <div style={{ display: "flex", gap: "8px" }}>
                  {/* Simpan sebagai Draft */}
                  <button type="submit" name="action" value="draft" disabled={isPending}
                    style={{
                      padding: "9px 18px", borderRadius: "10px",
                      border: "1.5px solid #e2e5ec", background: "#fff",
                      color: "#1a1f36", fontSize: "13px", fontWeight: 600,
                      cursor: isPending ? "not-allowed" : "pointer",
                    }}>
                    Simpan Draft
                  </button>
                  {/* Submit Langsung */}
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={async () => {
                      if (!formRef.current) return
                      const event = new Event("submit", { bubbles: true, cancelable: true })
                      const valid = formRef.current.dispatchEvent(event)
                      // Akan submit via handleSubmit, lalu kita set status PENDING
                    }}
                    style={{
                      padding: "9px 18px", borderRadius: "10px",
                      background: isPending ? "#93a8d4" : "#00205b",
                      color: "#fff", fontSize: "13px", fontWeight: 700,
                      border: "none", cursor: isPending ? "not-allowed" : "pointer",
                    }}>
                    {isPending ? "Memproses..." : "Ajukan Sekarang"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL DETAIL ── */}
      {mode === "detail" && selected && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
        }} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div style={{
            background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "520px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflow: "auto",
          }}>
            {/* Header */}
            <div style={{
              padding: "20px 24px 16px", borderBottom: "1px solid #eef0f4",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              position: "sticky", top: 0, background: "#fff", zIndex: 1,
            }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#1a1f36" }}>{selected.nomorSppd}</div>
                <div style={{ fontSize: "12px", color: "#8f95a3" }}>Detail Pengajuan SPPD</div>
              </div>
              <button onClick={closeModal}
                style={{ width: 32, height: 32, borderRadius: "8px", border: "1.5px solid #e2e5ec", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: "20px 24px 24px" }}>
              {/* Status Badge */}
              <div style={{ marginBottom: "20px" }}>
                {(() => {
                  const cfg = STATUS_CONFIG[selected.status]
                  return (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "6px 14px", borderRadius: "20px",
                      background: cfg.bg, color: cfg.color,
                      fontSize: "12px", fontWeight: 700,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot }} />
                      {cfg.label}
                    </span>
                  )
                })()}
              </div>

              {/* Info Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                {[
                  { label: "Kota Tujuan",   value: selected.tujuan },
                  { label: "Transportasi",  value: TRANSPORT_OPTS.find(t => t.value === selected.transport)?.label ?? selected.transport },
                  { label: "Tgl Berangkat", value: formatTanggal(selected.tglBerangkat) },
                  { label: "Tgl Kembali",   value: formatTanggal(selected.tglKembali) },
                  { label: "Durasi",        value: `${durasi(selected.tglBerangkat, selected.tglKembali)} hari` },
                  { label: "Estimasi Anggaran", value: formatRupiah(selected.anggaran) },
                ].map(row => (
                  <div key={row.label}>
                    <div style={{ fontSize: "11px", color: "#8f95a3", fontWeight: 600, marginBottom: "3px" }}>{row.label.toUpperCase()}</div>
                    <div style={{ fontSize: "13px", color: "#1a1f36", fontWeight: 600 }}>{row.value}</div>
                  </div>
                ))}
              </div>

              {/* Maksud */}
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "11px", color: "#8f95a3", fontWeight: 600, marginBottom: "4px" }}>KEPERLUAN</div>
                <div style={{
                  fontSize: "13px", color: "#1a1f36", lineHeight: 1.6,
                  background: "#f9fafb", padding: "10px 12px", borderRadius: "8px",
                  border: "1px solid #f3f4f6",
                }}>{selected.maksud}</div>
              </div>

              {/* Catatan pengaju */}
              {selected.catatan && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", color: "#8f95a3", fontWeight: 600, marginBottom: "4px" }}>CATATAN PENGAJU</div>
                  <div style={{
                    fontSize: "13px", color: "#1a1f36", lineHeight: 1.6,
                    background: "#f9fafb", padding: "10px 12px", borderRadius: "8px",
                    border: "1px solid #f3f4f6",
                  }}>{selected.catatan}</div>
                </div>
              )}

              {/* Catatan Approver */}
              {selected.catatanApprover && (
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", color: "#8f95a3", fontWeight: 600, marginBottom: "4px" }}>CATATAN APPROVER</div>
                  <div style={{
                    fontSize: "13px", color: selected.status === "REJECTED" ? "#dc2626" : "#16a34a",
                    lineHeight: 1.6,
                    background: selected.status === "REJECTED" ? "#fef2f2" : "#f0fdf4",
                    padding: "10px 12px", borderRadius: "8px",
                    border: `1px solid ${selected.status === "REJECTED" ? "#fecaca" : "#bbf7d0"}`,
                    fontWeight: 600,
                  }}>{selected.catatanApprover}</div>
                </div>
              )}

              {/* Approver info */}
              {selected.approver && (
                <div style={{
                  fontSize: "12px", color: "#8f95a3",
                  display: "flex", alignItems: "center", gap: "6px",
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Diproses oleh: <strong style={{ color: "#1a1f36" }}>{selected.approver}</strong>
                </div>
              )}

              {/* Action jika DRAFT */}
              {selected.status === "DRAFT" && (
                <div style={{
                  marginTop: "20px", paddingTop: "16px",
                  borderTop: "1px solid #eef0f4",
                  display: "flex", justifyContent: "flex-end", gap: "8px",
                }}>
                  <button onClick={() => openEdit(selected)}
                    style={{
                      padding: "9px 18px", borderRadius: "10px",
                      border: "1.5px solid #e2e5ec", background: "#fff",
                      color: "#1a1f36", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                    }}>
                    Edit
                  </button>
                  <button onClick={() => handleSubmitPending(selected.id)} disabled={isPending}
                    style={{
                      padding: "9px 18px", borderRadius: "10px",
                      background: isPending ? "#93a8d4" : "#00205b",
                      color: "#fff", fontSize: "13px", fontWeight: 700,
                      border: "none", cursor: isPending ? "not-allowed" : "pointer",
                    }}>
                    {isPending ? "Memproses..." : "Ajukan ke Approver"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI HAPUS ── */}
      {confirmDelete && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 60,
          background: "rgba(0,0,0,0.4)", backdropFilter: "blur(3px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
        }}>
          <div style={{
            background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "360px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)", padding: "28px 24px", textAlign: "center",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              </svg>
            </div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#1a1f36", marginBottom: "8px" }}>
              Hapus Pengajuan?
            </div>
            <div style={{ fontSize: "13px", color: "#8f95a3", marginBottom: "24px" }}>
              Tindakan ini tidak dapat dibatalkan. Pengajuan SPPD akan dihapus permanen.
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setConfirmDelete(null)}
                style={{
                  flex: 1, padding: "10px", borderRadius: "10px",
                  border: "1.5px solid #e2e5ec", background: "#fff",
                  color: "#6b7280", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                }}>
                Batal
              </button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={isPending}
                style={{
                  flex: 1, padding: "10px", borderRadius: "10px",
                  background: isPending ? "#fca5a5" : "#dc2626",
                  color: "#fff", fontSize: "13px", fontWeight: 700,
                  border: "none", cursor: isPending ? "not-allowed" : "pointer",
                }}>
                {isPending ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}