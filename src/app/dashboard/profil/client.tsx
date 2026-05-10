"use client"

import { useState, useTransition } from "react"

type UserData = {
  id: string
  nama: string
  nip: string | null
  email: string
  jabatan: string | null
  divisi: string | null
  role: string
  createdAt: string
  _count: { pengajuan: number }
}

const ROLE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  PEGAWAI:  { label: "Pegawai",  bg: "#eff6ff", color: "#1d4ed8" },
  APPROVER: { label: "Approver", bg: "#f0fdf4", color: "#15803d" },
  ADMIN:    { label: "Admin",    bg: "#f5f3ff", color: "#6d28d9" },
}

function getInitials(nama: string) {
  return nama.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
}

function InputField({
  label, name, value, type = "text", readOnly = false, required = false,
  onChange,
}: {
  label: string
  name: string
  value: string
  type?: string
  readOnly?: boolean
  required?: boolean
  onChange?: (v: string) => void
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", letterSpacing: "0.04em" }}>
        {label.toUpperCase()}{required && <span style={{ color: "#dc2626" }}> *</span>}
      </label>
      <input
        type={type}
        name={name}
        defaultValue={value}
        readOnly={readOnly}
        onChange={e => onChange?.(e.target.value)}
        style={{
          padding: "10px 12px", borderRadius: "10px",
          border: readOnly ? "1.5px solid #f3f4f6" : "1.5px solid #e2e5ec",
          fontSize: "14px", outline: "none",
          background: readOnly ? "#f9fafb" : "#fff",
          color: readOnly ? "#9ca3af" : "#1a1f36",
          fontFamily: "inherit",
          transition: "border-color 150ms ease",
          cursor: readOnly ? "not-allowed" : "text",
        }}
        onFocus={e => { if (!readOnly) e.currentTarget.style.borderColor = "#00205b" }}
        onBlur={e => { if (!readOnly) e.currentTarget.style.borderColor = "#e2e5ec" }}
      />
    </div>
  )
}

export default function ProfilClient({ user }: { user: UserData }) {
  const roleCfg = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.PEGAWAI
  const [tab, setTab] = useState<"info" | "password">("info")
  const [isPending, startTransition] = useTransition()
  const [infoMsg, setInfoMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [passMsg, setPassMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function handleUpdateInfo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setInfoMsg(null)
    startTransition(async () => {
      try {
        const res = await fetch("/api/profil/update-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama: fd.get("nama"),
            jabatan: fd.get("jabatan"),
            divisi: fd.get("divisi"),
          }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan")
        setInfoMsg({ type: "success", text: "Profil berhasil diperbarui" })
      } catch (err: unknown) {
        setInfoMsg({ type: "error", text: err instanceof Error ? err.message : "Terjadi kesalahan" })
      }
    })
  }

  async function handleUpdatePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const passwordBaru = fd.get("passwordBaru") as string
    const konfirmasi  = fd.get("konfirmasi") as string
    setPassMsg(null)
    if (passwordBaru !== konfirmasi) {
      setPassMsg({ type: "error", text: "Password baru tidak cocok" })
      return
    }
    if (passwordBaru.length < 8) {
      setPassMsg({ type: "error", text: "Password minimal 8 karakter" })
      return
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/profil/update-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            passwordLama: fd.get("passwordLama"),
            passwordBaru,
          }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? "Gagal mengubah password")
        setPassMsg({ type: "success", text: "Password berhasil diubah" })
        ;(e.target as HTMLFormElement).reset()
      } catch (err: unknown) {
        setPassMsg({ type: "error", text: err instanceof Error ? err.message : "Terjadi kesalahan" })
      }
    })
  }

  return (
    <div style={{ maxWidth: "720px" }}>
      {/* Header Card */}
      <div style={{
        background: "#fff", borderRadius: "16px",
        border: "1px solid #eef0f4",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        padding: "28px", marginBottom: "20px",
        display: "flex", alignItems: "center", gap: "20px",
      }}>
        {/* Avatar */}
        <div style={{
          width: 72, height: 72, borderRadius: "20px",
          background: "#00205b",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "24px", fontWeight: 800, color: "#fff",
          flexShrink: 0, letterSpacing: "1px",
        }}>
          {getInitials(user.nama)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#1a1f36", margin: 0 }}>
              {user.nama}
            </h1>
            <span style={{
              padding: "3px 10px", borderRadius: "20px",
              background: roleCfg.bg, color: roleCfg.color,
              fontSize: "11px", fontWeight: 700,
            }}>
              {roleCfg.label}
            </span>
          </div>
          <div style={{ fontSize: "13px", color: "#8f95a3" }}>
            {user.email} · {user.jabatan ?? "Jabatan belum diisi"} · {user.divisi ?? "Divisi belum diisi"}
          </div>
          <div style={{ display: "flex", gap: "16px", marginTop: "10px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#00205b" }}>
                {user._count.pengajuan}
              </div>
              <div style={{ fontSize: "11px", color: "#8f95a3" }}>Total SPPD</div>
            </div>
            <div style={{ width: 1, background: "#eef0f4" }} />
            <div>
              <div style={{ fontSize: "12px", color: "#8f95a3" }}>
                NIP: <span style={{ color: "#1a1f36", fontWeight: 600 }}>{user.nip ?? "—"}</span>
              </div>
              <div style={{ fontSize: "12px", color: "#8f95a3", marginTop: "2px" }}>
                Bergabung: <span style={{ color: "#1a1f36", fontWeight: 600 }}>
                  {new Date(user.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab */}
      <div style={{
        display: "flex", gap: "0", marginBottom: "16px",
        background: "#f3f4f6", borderRadius: "10px", padding: "4px",
        width: "fit-content",
      }}>
        {[
          { key: "info",     label: "Informasi Akun" },
          { key: "password", label: "Ubah Password" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as "info" | "password")}
            style={{
              padding: "8px 18px", borderRadius: "7px",
              background: tab === t.key ? "#fff" : "transparent",
              color: tab === t.key ? "#00205b" : "#6b7280",
              fontSize: "13px", fontWeight: tab === t.key ? 700 : 500,
              border: "none", cursor: "pointer",
              boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 150ms ease",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Info Akun */}
      {tab === "info" && (
        <div style={{
          background: "#fff", borderRadius: "16px",
          border: "1px solid #eef0f4",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          padding: "24px",
        }}>
          {infoMsg && (
            <div style={{
              padding: "10px 14px", borderRadius: "8px", marginBottom: "16px",
              background: infoMsg.type === "success" ? "#f0fdf4" : "#fef2f2",
              color:      infoMsg.type === "success" ? "#16a34a" : "#dc2626",
              fontSize: "13px", fontWeight: 600,
              border: `1px solid ${infoMsg.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            }}>
              {infoMsg.text}
            </div>
          )}
          <form onSubmit={handleUpdateInfo}
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <InputField label="Nama Lengkap" name="nama" value={user.nama} required />
            </div>
            <InputField label="NIP" name="nip" value={user.nip ?? ""} readOnly />
            <InputField label="Email" name="email" value={user.email} type="email" readOnly />
            <InputField label="Jabatan" name="jabatan" value={user.jabatan ?? ""} />
            <InputField label="Divisi / Unit" name="divisi" value={user.divisi ?? ""} />
            <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  padding: "10px 24px", borderRadius: "10px",
                  background: isPending ? "#93a8d4" : "#00205b",
                  color: "#fff", fontSize: "13px", fontWeight: 700,
                  border: "none", cursor: isPending ? "not-allowed" : "pointer",
                  transition: "background 150ms ease",
                }}>
                {isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB: Ubah Password */}
      {tab === "password" && (
        <div style={{
          background: "#fff", borderRadius: "16px",
          border: "1px solid #eef0f4",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          padding: "24px",
        }}>
          {passMsg && (
            <div style={{
              padding: "10px 14px", borderRadius: "8px", marginBottom: "16px",
              background: passMsg.type === "success" ? "#f0fdf4" : "#fef2f2",
              color:      passMsg.type === "success" ? "#16a34a" : "#dc2626",
              fontSize: "13px", fontWeight: 600,
              border: `1px solid ${passMsg.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            }}>
              {passMsg.text}
            </div>
          )}
          <form onSubmit={handleUpdatePassword}
            style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px" }}>
            <InputField label="Password Lama" name="passwordLama" value="" type="password" required />
            <InputField label="Password Baru" name="passwordBaru" value="" type="password" required />
            <InputField label="Konfirmasi Password Baru" name="konfirmasi" value="" type="password" required />
            <div>
              <button
                type="submit"
                disabled={isPending}
                style={{
                  padding: "10px 24px", borderRadius: "10px",
                  background: isPending ? "#93a8d4" : "#00205b",
                  color: "#fff", fontSize: "13px", fontWeight: 700,
                  border: "none", cursor: isPending ? "not-allowed" : "pointer",
                  transition: "background 150ms ease",
                }}>
                {isPending ? "Memproses..." : "Ubah Password"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}