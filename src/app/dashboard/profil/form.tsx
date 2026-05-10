"use client"

import { useState } from "react"

type User = {
  id: string
  nama: string
  nip: string | null
  email: string
  jabatan: string | null
  divisi: string | null
  role: string
}

export default function ProfilForm({ user }: { user: User }) {
  const [tab, setTab] = useState<"info" | "password">("info")
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  const [info, setInfo] = useState({
    nama: user.nama || "",
    nip: user.nip || "",
    jabatan: user.jabatan || "",
    divisi: user.divisi || "",
  })

  const [pass, setPass] = useState({
    passwordLama: "",
    passwordBaru: "",
    konfirmasi: "",
  })

  const inputStyle = {
    width: "100%", padding: "8px 12px", border: "1px solid #d1d5db",
    borderRadius: "6px", fontSize: "0.9rem", outline: "none",
    boxSizing: "border-box" as const,
  }

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccessMsg("")
    setErrorMsg("")
    try {
      const res = await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "info", ...info }),
      })
      if (res.ok) setSuccessMsg("Profil berhasil diperbarui!")
      else setErrorMsg("Gagal memperbarui profil.")
    } finally {
      setLoading(false)
    }
  }

  const handlePassSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg("")
    setErrorMsg("")
    if (pass.passwordBaru !== pass.konfirmasi) {
      setErrorMsg("Password baru dan konfirmasi tidak cocok!")
      return
    }
    if (pass.passwordBaru.length < 6) {
      setErrorMsg("Password baru minimal 6 karakter!")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "password", ...pass }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccessMsg("Password berhasil diubah!")
        setPass({ passwordLama: "", passwordBaru: "", konfirmasi: "" })
      } else {
        setErrorMsg(data.error || "Gagal mengubah password.")
      }
    } finally {
      setLoading(false)
    }
  }

  const tabStyle = (active: boolean) => ({
    padding: "8px 20px", border: "none", cursor: "pointer",
    fontWeight: 600, fontSize: "0.875rem", borderRadius: "6px",
    background: active ? "#01696f" : "transparent",
    color: active ? "white" : "#666",
  })

  return (
    <div style={{ maxWidth: "560px" }}>
      {/* Avatar */}
      <div style={{
        display: "flex", alignItems: "center", gap: "16px",
        marginBottom: "24px", padding: "20px",
        background: "white", borderRadius: "8px", border: "1px solid #e5e7eb",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "9999px", background: "#01696f",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: "1.5rem", fontWeight: 700, flexShrink: 0,
        }}>
          {user.nama?.split(" ").map(n => n[0]).slice(0, 2).join("") || "U"}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1rem" }}>{user.nama}</div>
          <div style={{ color: "#666", fontSize: "0.85rem" }}>{user.email}</div>
          <span style={{
            background: "#cedcd8", color: "#01696f", padding: "2px 8px",
            borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600,
          }}>
            {user.role}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: "4px", marginBottom: "20px",
        background: "#f3f4f6", padding: "4px", borderRadius: "8px",
      }}>
        <button style={tabStyle(tab === "info")} onClick={() => { setTab("info"); setSuccessMsg(""); setErrorMsg("") }}>
          👤 Info Diri
        </button>
        <button style={tabStyle(tab === "password")} onClick={() => { setTab("password"); setSuccessMsg(""); setErrorMsg("") }}>
          🔒 Ganti Password
        </button>
      </div>

      {/* Alert */}
      {successMsg && (
        <div style={{
          background: "#dcfce7", color: "#16a34a", padding: "10px 16px",
          borderRadius: "6px", marginBottom: "16px", fontSize: "0.875rem",
        }}>
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{
          background: "#fee2e2", color: "#dc2626", padding: "10px 16px",
          borderRadius: "6px", marginBottom: "16px", fontSize: "0.875rem",
        }}>
          ❌ {errorMsg}
        </div>
      )}

      {/* Form Info */}
      {tab === "info" && (
        <form onSubmit={handleInfoSubmit} style={{
          background: "white", borderRadius: "8px", border: "1px solid #e5e7eb",
          padding: "20px", display: "flex", flexDirection: "column", gap: "16px",
        }}>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "4px" }}>Nama Lengkap</label>
            <input style={inputStyle} required value={info.nama}
              onChange={e => setInfo({ ...info, nama: e.target.value })} />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "4px" }}>NIP</label>
            <input style={inputStyle} value={info.nip}
              onChange={e => setInfo({ ...info, nip: e.target.value })}
              placeholder="Nomor Induk Pegawai" />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "4px" }}>Jabatan</label>
            <input style={inputStyle} value={info.jabatan}
              onChange={e => setInfo({ ...info, jabatan: e.target.value })}
              placeholder="Contoh: Staff IT" />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "4px" }}>Divisi</label>
            <input style={inputStyle} value={info.divisi}
              onChange={e => setInfo({ ...info, divisi: e.target.value })}
              placeholder="Contoh: Divisi Teknis" />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "4px" }}>Email</label>
            <input style={{ ...inputStyle, background: "#f9fafb", color: "#999" }}
              value={user.email} disabled />
            <p style={{ fontSize: "0.75rem", color: "#999", marginTop: "4px" }}>Email tidak dapat diubah.</p>
          </div>
          <button type="submit" disabled={loading} style={{
            background: loading ? "#9ca3af" : "#01696f", color: "white",
            border: "none", padding: "10px 24px", borderRadius: "6px",
            fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            alignSelf: "flex-start",
          }}>
            {loading ? "Menyimpan..." : "💾 Simpan Perubahan"}
          </button>
        </form>
      )}

      {/* Form Password */}
      {tab === "password" && (
        <form onSubmit={handlePassSubmit} style={{
          background: "white", borderRadius: "8px", border: "1px solid #e5e7eb",
          padding: "20px", display: "flex", flexDirection: "column", gap: "16px",
        }}>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "4px" }}>Password Lama</label>
            <input type="password" style={inputStyle} required value={pass.passwordLama}
              onChange={e => setPass({ ...pass, passwordLama: e.target.value })} />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "4px" }}>Password Baru</label>
            <input type="password" style={inputStyle} required value={pass.passwordBaru}
              onChange={e => setPass({ ...pass, passwordBaru: e.target.value })} />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "4px" }}>Konfirmasi Password Baru</label>
            <input type="password" style={inputStyle} required value={pass.konfirmasi}
              onChange={e => setPass({ ...pass, konfirmasi: e.target.value })} />
          </div>
          <button type="submit" disabled={loading} style={{
            background: loading ? "#9ca3af" : "#01696f", color: "white",
            border: "none", padding: "10px 24px", borderRadius: "6px",
            fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            alignSelf: "flex-start",
          }}>
            {loading ? "Menyimpan..." : "🔒 Ubah Password"}
          </button>
        </form>
      )}
    </div>
  )
}