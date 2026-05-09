"use client"

import { useState } from "react"

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState<"akun" | "keamanan" | "notifikasi">("akun")

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{
          fontSize: "20px",
          fontWeight: 700,
          color: "#1a1f36",
          marginBottom: "4px",
        }}>
          Pengaturan
        </h1>
        <p style={{ fontSize: "13px", color: "#8f95a3" }}>
          Kelola akun, keamanan, dan preferensi notifikasi Anda.
        </p>
      </div>

      {/* Layout dua kolom: Sidebar Tab + Konten */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: "24px",
        alignItems: "start",
      }}>

        {/* ── Sidebar Tab (kiri) ── */}
        <div style={{
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #eef0f4",
          overflow: "hidden",
        }}>
          {(["akun", "keamanan", "notifikasi"] as const).map((tab) => {
            const active = activeTab === tab
            const labels = { akun: "Akun", keamanan: "Keamanan", notifikasi: "Notifikasi" }
            const icons = {
              akun: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              ),
              keamanan: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              ),
              notifikasi: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
              ),
            }
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "13px 16px",
                  border: "none",
                  borderLeft: active ? "3px solid #00205b" : "3px solid transparent",
                  background: active ? "#f0f3fa" : "transparent",
                  color: active ? "#00205b" : "#5a6272",
                  fontSize: "13px",
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                {icons[tab]}
                {labels[tab]}
              </button>
            )
          })}
        </div>

        {/* ── Konten (kanan) ── */}
        <div>
          {activeTab === "akun" && (
            <div style={cardStyle}>
              <CardHeader title="Informasi Akun" desc="Perbarui data profil Anda" />
              <div style={{ padding: "28px" }}>
                <AkunForm />
              </div>
            </div>
          )}

          {activeTab === "keamanan" && (
            <div style={cardStyle}>
              <CardHeader title="Ubah Password" desc="Gunakan password yang kuat dan unik" />
              <div style={{ padding: "28px" }}>
                <KeamananForm />
              </div>
            </div>
          )}

          {activeTab === "notifikasi" && (
            <div style={cardStyle}>
              <CardHeader title="Preferensi Notifikasi" desc="Atur jenis notifikasi yang ingin Anda terima" />
              <div style={{ padding: "28px" }}>
                <NotifikasiForm />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   CardHeader
───────────────────────────────────────── */
function CardHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{
      padding: "18px 24px",
      borderBottom: "1px solid #eef0f4",
    }}>
      <div style={{ fontSize: "14px", fontWeight: 600, color: "#1a1f36" }}>{title}</div>
      <div style={{ fontSize: "12px", color: "#8f95a3", marginTop: "2px" }}>{desc}</div>
    </div>
  )
}

/* ─────────────────────────────────────────
   Form Akun — 2 kolom
───────────────────────────────────────── */
function AkunForm() {
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <InputField label="Nama Lengkap" placeholder="Masukkan nama lengkap" />
        </div>
        <InputField label="Email" type="email" placeholder="Masukkan email" />
        <InputField label="No. Telepon" placeholder="Masukkan nomor telepon" />
        <InputField label="NIP" placeholder="Masukkan NIP" />
        <InputField label="Jabatan" placeholder="Masukkan jabatan" />
        <div>
          <label style={labelStyle}>Unit Kerja</label>
          <input
            disabled
            value="KPU Jawa Tengah"
            style={{ ...inputStyle, background: "#f5f6fa", color: "#aab0c0", cursor: "not-allowed" }}
          />
          <span style={{ fontSize: "11px", color: "#aab0c0", marginTop: "4px", display: "block" }}>
            Tidak dapat diubah
          </span>
        </div>
        <div style={{ gridColumn: "1 / -1", paddingTop: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
          <button type="submit" style={btnPrimaryStyle}>Simpan Perubahan</button>
          {saved && <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: 500 }}>✓ Tersimpan</span>}
        </div>
      </div>
    </form>
  )
}

/* ─────────────────────────────────────────
   Form Keamanan
───────────────────────────────────────── */
function KeamananForm() {
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const newPass = (form.elements.namedItem("newPass") as HTMLInputElement).value
    const confirmPass = (form.elements.namedItem("confirmPass") as HTMLInputElement).value

    if (newPass !== confirmPass) { setError("Password baru dan konfirmasi tidak cocok."); return }
    if (newPass.length < 8) { setError("Password minimal 8 karakter."); return }

    setError("")
    setSaved(true)
    form.reset()
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <InputField label="Password Saat Ini" name="currentPass" type="password" placeholder="••••••••" />
        </div>
        <InputField label="Password Baru" name="newPass" type="password" placeholder="Min. 8 karakter" />
        <InputField label="Konfirmasi Password Baru" name="confirmPass" type="password" placeholder="Ulangi password baru" />

        {error && (
          <div style={{ gridColumn: "1 / -1", padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "13px", color: "#dc2626" }}>
            {error}
          </div>
        )}

        <div style={{ gridColumn: "1 / -1", paddingTop: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
          <button type="submit" style={btnPrimaryStyle}>Ubah Password</button>
          {saved && <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: 500 }}>✓ Password berhasil diubah</span>}
        </div>
      </div>
    </form>
  )
}

/* ─────────────────────────────────────────
   Form Notifikasi
───────────────────────────────────────── */
function NotifikasiForm() {
  const [settings, setSettings] = useState({
    pengajuanBaru: true,
    statusDisetujui: true,
    statusDitolak: true,
    reminderSPPD: false,
    emailNotif: false,
  })
  const [saved, setSaved] = useState(false)

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const items: { key: keyof typeof settings; label: string; desc: string }[] = [
    { key: "pengajuanBaru",   label: "Pengajuan SPPD Baru",  desc: "Notifikasi saat ada pengajuan SPPD baru masuk" },
    { key: "statusDisetujui", label: "SPPD Disetujui",       desc: "Notifikasi saat SPPD Anda disetujui" },
    { key: "statusDitolak",   label: "SPPD Ditolak",         desc: "Notifikasi saat SPPD Anda ditolak" },
    { key: "reminderSPPD",    label: "Reminder SPPD Aktif",  desc: "Pengingat SPPD yang sedang berjalan" },
    { key: "emailNotif",      label: "Notifikasi via Email", desc: "Kirim notifikasi ke alamat email terdaftar" },
  ]

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {items.map((item, i) => (
          <div key={item.key} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 0",
            borderBottom: i < items.length - 1 ? "1px solid #f0f2f5" : "none",
          }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 500, color: "#1a1f36" }}>{item.label}</div>
              <div style={{ fontSize: "12px", color: "#8f95a3", marginTop: "2px" }}>{item.desc}</div>
            </div>
            <button
              type="button"
              onClick={() => toggle(item.key)}
              style={{
                width: 40, height: 22, borderRadius: "11px", border: "none", cursor: "pointer",
                background: settings[item.key] ? "#00205b" : "#d1d5db",
                position: "relative", flexShrink: 0, transition: "background 0.2s",
              }}
            >
              <span style={{
                position: "absolute", top: 2,
                left: settings[item.key] ? 20 : 2,
                width: 18, height: 18, borderRadius: "50%", background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s",
              }} />
            </button>
          </div>
        ))}
      </div>
      <div style={{ paddingTop: "20px", display: "flex", alignItems: "center", gap: "12px" }}>
        <button type="submit" style={btnPrimaryStyle}>Simpan Preferensi</button>
        {saved && <span style={{ fontSize: "13px", color: "#16a34a", fontWeight: 500 }}>✓ Tersimpan</span>}
      </div>
    </form>
  )
}

/* ─────────────────────────────────────────
   Shared
───────────────────────────────────────── */
const cardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "12px",
  border: "1px solid #eef0f4",
  overflow: "hidden",
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#5a6272",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.4px",
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #e2e5ec",
  borderRadius: "8px",
  fontSize: "13px",
  color: "#1a1f36",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
}

const btnPrimaryStyle: React.CSSProperties = {
  padding: "9px 20px",
  background: "#00205b",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
}

function InputField({
  label, placeholder, type = "text", defaultValue, name, disabled,
}: {
  label: string; placeholder?: string; type?: string
  defaultValue?: string; name?: string; disabled?: boolean
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        name={name} type={type} placeholder={placeholder}
        defaultValue={defaultValue} disabled={disabled}
        style={inputStyle}
        onFocus={e => (e.target.style.borderColor = "#00205b")}
        onBlur={e => (e.target.style.borderColor = "#e2e5ec")}
      />
    </div>
  )
}