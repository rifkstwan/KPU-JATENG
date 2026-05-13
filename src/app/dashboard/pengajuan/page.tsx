"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function PengajuanPage() {
  const router = useRouter()
  const [loadingAction, setLoadingAction] = useState<"DRAFT" | "PENDING" | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    tujuan: "",
    maksud: "",
    tanggalBerangkat: "",
    tanggalKembali: "",
    transport: "DARAT",
    anggaran: "",
    catatan: "",
  })

  // ── Validasi ──
  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.tujuan.trim()) e.tujuan = "Tujuan perjalanan wajib diisi"
    if (!form.maksud.trim()) e.maksud = "Keperluan / maksud wajib diisi"
    if (!form.tanggalBerangkat) e.tanggalBerangkat = "Tanggal berangkat wajib diisi"
    if (!form.tanggalKembali) e.tanggalKembali = "Tanggal kembali wajib diisi"
    if (form.tanggalBerangkat && form.tanggalKembali) {
      if (new Date(form.tanggalKembali) < new Date(form.tanggalBerangkat)) {
        e.tanggalKembali = "Tanggal kembali tidak boleh sebelum tanggal berangkat"
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit ──
  const handleSubmit = async (action: "DRAFT" | "PENDING") => {
    if (!validate()) return
    setLoadingAction(action)
    try {
      const res = await fetch("/api/sppd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tujuan: form.tujuan,
          maksud: form.maksud,
          tglBerangkat: form.tanggalBerangkat,
          tglKembali: form.tanggalKembali,
          transport: form.transport,
          anggaran: Number(form.anggaran.replace(/\D/g, "") || "0"),
          catatan: form.catatan || null,
          status: action,
        }),
      })
      if (res.ok) {
        router.push("/dashboard/sppd")
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data?.message || "Gagal menyimpan. Coba lagi.")
      }
    } catch {
      alert("Terjadi kesalahan jaringan.")
    } finally {
      setLoadingAction(null)
    }
  }

  const handleAnggaran = (val: string) => {
    const num = val.replace(/\D/g, "")
    setForm({ ...form, anggaran: num ? Number(num).toLocaleString("id-ID") : "" })
  }

  // ── Styles ──
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1.5px solid #e2e5ed",
    fontSize: "14px",
    color: "#1a1f36",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
    fontFamily: "inherit",
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#1a1f36",
    marginBottom: "6px",
  }

  const errorStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#ef4444",
    marginTop: "4px",
  }

  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = "#00205b"
      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,32,91,0.08)"
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.currentTarget.style.borderColor = "#e2e5ed"
      e.currentTarget.style.boxShadow = "none"
    },
  }

  const transportOptions = [
    {
      value: "DARAT",
      label: "Darat",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="3" width="15" height="13" rx="2"/>
          <path d="M16 8h4l3 5v3h-7V8z"/>
          <circle cx="5.5" cy="18.5" r="2.5"/>
          <circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      ),
    },
    {
      value: "UDARA",
      label: "Udara",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      ),
    },
    {
      value: "KERETA",
      label: "Kereta",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="3" width="16" height="13" rx="2"/>
          <path d="M4 11h16M12 3v8"/>
          <circle cx="8.5" cy="19.5" r="1.5"/>
          <circle cx="15.5" cy="19.5" r="1.5"/>
          <path d="M6 19l-2 2M18 19l2 2"/>
        </svg>
      ),
    },
    {
      value: "LAUT",
      label: "Laut",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 20a2.4 2.4 0 002 1 2.4 2.4 0 002-1 2.4 2.4 0 012-1 2.4 2.4 0 012 1 2.4 2.4 0 002 1 2.4 2.4 0 002-1 2.4 2.4 0 012-1 2.4 2.4 0 012 1"/>
          <path d="M4 18l-1-5h18l-2 5"/>
          <path d="M12 2v3M8 7l4-2 4 2"/>
        </svg>
      ),
    },
  ]

  const statusSteps = [
    { label: "Pengajuan", desc: "SPPD dibuat", active: true },
    { label: "Review", desc: "Ditinjau Approver", active: false },
    { label: "Disetujui", desc: "SPPD berlaku", active: false },
  ]

  const infoItems = [
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00205b" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      title: "Waktu Proses",
      desc: "Pengajuan diproses dalam 1–2 hari kerja setelah disetujui atasan.",
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00205b" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      ),
      title: "Dokumen Pendukung",
      desc: "Siapkan surat tugas dan dokumen terkait sebelum berangkat.",
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00205b" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87"/>
          <path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
      title: "Persetujuan Atasan",
      desc: "SPPD memerlukan persetujuan dari Approver sebelum berlaku.",
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00205b" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
      ),
      title: "Reimbursement",
      desc: "Simpan semua bukti pengeluaran untuk klaim biaya perjalanan.",
    },
  ]

  const SpinnerIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ animation: "spin 1s linear infinite" }}>
      <path d="M21 12a9 9 0 11-6.219-8.56"/>
    </svg>
  )

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#1a1f36", margin: 0, letterSpacing: "-0.3px" }}>
          Ajukan SPPD Baru
        </h1>
        <p style={{ fontSize: "13px", color: "#8f95a3", margin: "4px 0 0" }}>
          Isi formulir di bawah untuk mengajukan perjalanan dinas
        </p>
      </div>

      {/* 2-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px", alignItems: "start" }}>

        {/* ── KIRI: Form ── */}
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #eef0f4",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}>
          {/* Card Header */}
          <div style={{
            padding: "18px 24px",
            borderBottom: "1px solid #eef0f4",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "10px",
              background: "#eef1f8",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00205b" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1f36" }}>Formulir Pengajuan</div>
              <div style={{ fontSize: "12px", color: "#8f95a3" }}>Semua kolom wajib diisi</div>
            </div>
          </div>

          {/* Form Body */}
          <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Tujuan */}
            <div>
              <label style={labelStyle}>Tujuan Perjalanan</label>
              <input
                type="text"
                placeholder="Contoh: Jakarta, DKI Jakarta"
                value={form.tujuan}
                onChange={e => setForm({ ...form, tujuan: e.target.value })}
                style={{ ...inputStyle, borderColor: errors.tujuan ? "#ef4444" : "#e2e5ed" }}
                {...focusHandlers}
              />
              {errors.tujuan && <p style={errorStyle}>{errors.tujuan}</p>}
            </div>

            {/* Maksud */}
            <div>
              <label style={labelStyle}>Keperluan / Maksud</label>
              <textarea
                placeholder="Jelaskan tujuan perjalanan dinas secara singkat dan jelas..."
                value={form.maksud}
                onChange={e => setForm({ ...form, maksud: e.target.value })}
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  lineHeight: 1.6,
                  borderColor: errors.maksud ? "#ef4444" : "#e2e5ed",
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = "#00205b"
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,32,91,0.08)"
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = "#e2e5ed"
                  e.currentTarget.style.boxShadow = "none"
                }}
              />
              {errors.maksud && <p style={errorStyle}>{errors.maksud}</p>}
            </div>

            {/* Tanggal */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Tanggal Berangkat</label>
                <input
                  type="date"
                  value={form.tanggalBerangkat}
                  onChange={e => setForm({ ...form, tanggalBerangkat: e.target.value })}
                  style={{ ...inputStyle, borderColor: errors.tanggalBerangkat ? "#ef4444" : "#e2e5ed" }}
                  {...focusHandlers}
                />
                {errors.tanggalBerangkat && <p style={errorStyle}>{errors.tanggalBerangkat}</p>}
              </div>
              <div>
                <label style={labelStyle}>Tanggal Kembali</label>
                <input
                  type="date"
                  value={form.tanggalKembali}
                  min={form.tanggalBerangkat}
                  onChange={e => setForm({ ...form, tanggalKembali: e.target.value })}
                  style={{ ...inputStyle, borderColor: errors.tanggalKembali ? "#ef4444" : "#e2e5ed" }}
                  {...focusHandlers}
                />
                {errors.tanggalKembali && <p style={errorStyle}>{errors.tanggalKembali}</p>}
              </div>
            </div>

            {/* Transport */}
            <div>
              <label style={labelStyle}>Moda Transportasi</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                {transportOptions.map((opt) => {
                  const isSelected = form.transport === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, transport: opt.value })}
                      style={{
                        padding: "12px 8px",
                        borderRadius: "10px",
                        border: `1.5px solid ${isSelected ? "#00205b" : "#e2e5ed"}`,
                        background: isSelected ? "#eef1f8" : "#fff",
                        color: isSelected ? "#00205b" : "#8f95a3",
                        display: "flex", flexDirection: "column",
                        alignItems: "center", gap: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: isSelected ? 600 : 400,
                        transition: "all 150ms ease",
                        outline: "none",
                        boxShadow: isSelected ? "0 0 0 3px rgba(0,32,91,0.08)" : "none",
                      }}
                    >
                      {opt.icon}
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Anggaran */}
            <div>
              <label style={labelStyle}>
                Estimasi Anggaran{" "}
                <span style={{ fontWeight: 400, color: "#aab0c0", fontSize: "12px" }}>(opsional)</span>
              </label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: "13px", top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "13px", color: "#8f95a3", pointerEvents: "none",
                  userSelect: "none",
                }}>
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={form.anggaran}
                  onChange={e => handleAnggaran(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: "36px" }}
                  {...focusHandlers}
                />
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label style={labelStyle}>
                Catatan Tambahan{" "}
                <span style={{ fontWeight: 400, color: "#aab0c0", fontSize: "12px" }}>(opsional)</span>
              </label>
              <textarea
                placeholder="Keterangan tambahan jika diperlukan..."
                value={form.catatan}
                onChange={e => setForm({ ...form, catatan: e.target.value })}
                rows={3}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = "#00205b"
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,32,91,0.08)"
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = "#e2e5ed"
                  e.currentTarget.style.boxShadow = "none"
                }}
              />
            </div>

            <div style={{ height: 1, background: "#eef0f4" }} />

            {/* ── TOMBOL AKSI ── */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", flexWrap: "wrap" }}>

              {/* Batal */}
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loadingAction !== null}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "1.5px solid #e2e5ed",
                  background: "#fff",
                  color: "#1a1f36",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: loadingAction !== null ? "not-allowed" : "pointer",
                  outline: "none",
                  transition: "all 150ms ease",
                  opacity: loadingAction !== null ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!loadingAction) e.currentTarget.style.background = "#f5f6fa" }}
                onMouseLeave={e => { if (!loadingAction) e.currentTarget.style.background = "#fff" }}
              >
                Batal
              </button>

              {/* Simpan Draft */}
              <button
                type="button"
                disabled={loadingAction !== null}
                onClick={() => handleSubmit("DRAFT")}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "1.5px solid #00205b",
                  background: loadingAction === "DRAFT" ? "#eef1f8" : "#fff",
                  color: "#00205b",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: loadingAction !== null ? "not-allowed" : "pointer",
                  outline: "none",
                  display: "flex", alignItems: "center", gap: "6px",
                  transition: "all 150ms ease",
                  opacity: loadingAction !== null && loadingAction !== "DRAFT" ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!loadingAction) e.currentTarget.style.background = "#eef1f8" }}
                onMouseLeave={e => { if (!loadingAction) e.currentTarget.style.background = "#fff" }}
              >
                {loadingAction === "DRAFT" ? (
                  <><SpinnerIcon /> Menyimpan...</>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                      <polyline points="7 3 7 8 15 8"/>
                    </svg>
                    Simpan Draft
                  </>
                )}
              </button>

              {/* Kirim Pengajuan */}
              <button
                type="button"
                disabled={loadingAction !== null}
                onClick={() => handleSubmit("PENDING")}
                style={{
                  padding: "10px 24px",
                  borderRadius: "10px",
                  border: "none",
                  outline: "none",
                  background: loadingAction === "PENDING" ? "#8f95a3" : "#00205b",
                  color: "#fff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: loadingAction !== null ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: "6px",
                  transition: "background 150ms ease",
                  opacity: loadingAction !== null && loadingAction !== "PENDING" ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (!loadingAction) e.currentTarget.style.background = "#001a4a" }}
                onMouseLeave={e => { if (!loadingAction) e.currentTarget.style.background = "#00205b" }}
              >
                {loadingAction === "PENDING" ? (
                  <><SpinnerIcon /> Mengirim...</>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                    Kirim Pengajuan
                  </>
                )}
              </button>
            </div>

            {/* Info box */}
            <div style={{
              background: "#f0f4ff",
              border: "1px solid #c7d2fe",
              borderRadius: "10px",
              padding: "12px 14px",
              fontSize: "12px",
              color: "#4338ca",
              lineHeight: 1.7,
            }}>
              <strong>Simpan Draft</strong> — Tersimpan, belum dikirim ke Approver. Bisa diedit kapan saja.<br />
              <strong>Kirim Pengajuan</strong> — Langsung masuk antrian review Approver. Tidak bisa diubah setelah dikirim.
            </div>

          </div>
        </div>

        {/* ── KANAN: Panel Info ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Alur Pengajuan */}
          <div style={{
            background: "#fff", borderRadius: "16px",
            border: "1px solid #eef0f4",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)", padding: "20px",
          }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1f36", marginBottom: "16px" }}>
              Alur Pengajuan
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {statusSteps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: step.active ? "#00205b" : "#eef0f4",
                      border: `2px solid ${step.active ? "#00205b" : "#e2e5ed"}`,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      {step.active ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      ) : (
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#c5c9d6" }} />
                      )}
                    </div>
                    {i < statusSteps.length - 1 && (
                      <div style={{ width: 2, height: 32, background: "#eef0f4", margin: "4px 0" }} />
                    )}
                  </div>
                  <div style={{ paddingTop: "2px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: step.active ? "#00205b" : "#1a1f36" }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: "12px", color: "#8f95a3", marginBottom: "8px" }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panduan */}
          <div style={{
            background: "#fff", borderRadius: "16px",
            border: "1px solid #eef0f4",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)", padding: "20px",
          }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1f36", marginBottom: "16px" }}>
              Panduan Pengajuan
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {infoItems.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "10px" }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "8px", background: "#eef1f8",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 600, color: "#1a1f36" }}>{item.title}</div>
                    <div style={{ fontSize: "11.5px", color: "#8f95a3", lineHeight: 1.5, marginTop: "2px" }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Butuh Bantuan */}
          <div style={{
            background: "linear-gradient(135deg, #00205b 0%, #0041a8 100%)",
            borderRadius: "16px", padding: "20px",
          }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
              Butuh Bantuan?
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", lineHeight: 1.5, marginBottom: "14px" }}>
              Hubungi bagian administrasi KPU Jawa Tengah untuk informasi lebih lanjut.
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "8px",
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.01 2.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Telepon</div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#fff" }}>(024) 123-4567</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0.5; cursor: pointer;
        }
        input::placeholder, textarea::placeholder { color: #aab0c0; }
      `}</style>
    </div>
  )
}