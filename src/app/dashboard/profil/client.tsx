"use client"

import { useState, useTransition, useRef } from "react"

type UserData = {
  id: string
  nama: string
  email: string
  nip: string
  jabatan: string
  divisi: string
  role: string
  foto: string | null
  createdAt: string
}

function getInitials(nama: string) {
  return nama.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
}

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  })
}

const ROLE_LABEL: Record<string, { label: string; bg: string; color: string }> = {
  PEGAWAI:  { label: "Pegawai",  bg: "#dbeafe", color: "#1d4ed8" },
  APPROVER: { label: "Approver", bg: "#fef3c7", color: "#b45309" },
  ADMIN:    { label: "Admin",    bg: "#dcfce7", color: "#15803d" },
}

function inputStyle(readOnly = false): React.CSSProperties {
  return {
    width: "100%", padding: "11px 14px", borderRadius: "10px",
    border: `1.5px solid ${readOnly ? "#f1f5f9" : "#e2e8f0"}`,
    fontSize: "14px", outline: "none",
    background: readOnly ? "#f8fafc" : "#fff",
    color: readOnly ? "#94a3b8" : "#0f172a",
    fontFamily: "inherit", boxSizing: "border-box" as const,
    cursor: readOnly ? "not-allowed" : "text",
    transition: "border-color 150ms ease, box-shadow 150ms ease",
  }
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      fontSize: "11px", fontWeight: 700, color: "#64748b",
      letterSpacing: "0.08em", textTransform: "uppercase" as const,
      marginBottom: "6px", display: "block",
    }}>
      {children}
    </label>
  )
}

function IconUser() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function IconLock() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
}
function IconCamera() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
}
function IconEye({ open }: { open: boolean }) {
  if (open) return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
}
function IconShield() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
}
function IconInfo() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
}
function IconCheck() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
}
function IconAlert() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
}

export default function ProfilClient({ user }: { user: UserData }) {
  const [tab, setTab] = useState<"info" | "password">("info")
  const [nama, setNama] = useState(user.nama)
  const [jabatan, setJabatan] = useState(user.jabatan)
  const [divisi, setDivisi] = useState(user.divisi)
  const [foto, setFoto] = useState<string | null>(user.foto)
  const [fotoUploading, setFotoUploading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [oldPass, setOldPass] = useState("")
  const [newPass, setNewPass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const roleCfg = ROLE_LABEL[user.role] ?? ROLE_LABEL.PEGAWAI

  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { setErrorMsg("Harus berupa file gambar"); return }
    if (file.size > 2 * 1024 * 1024) { setErrorMsg("Ukuran file maksimal 2MB"); return }

    setFotoUploading(true)
    setErrorMsg(null)
    try {
      const fd = new FormData()
      fd.append("foto", file)
      const res = await fetch("/api/profil/foto", { method: "POST", body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Gagal upload foto")
      setFoto(json.foto)
      setSuccessMsg("Foto profil berhasil diperbarui")
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal upload foto")
    } finally {
      setFotoUploading(false)
    }
  }

  function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault()
    if (!nama.trim()) { setErrorMsg("Nama tidak boleh kosong"); return }
    setErrorMsg(null)
    startTransition(async () => {
      try {
        const res = await fetch("/api/profil", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nama, jabatan, divisi }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? "Gagal menyimpan")
        setSuccessMsg("Profil berhasil diperbarui")
        setTimeout(() => setSuccessMsg(null), 3000)
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan")
      }
    })
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!oldPass || !newPass || !confirmPass) { setErrorMsg("Semua field wajib diisi"); return }
    if (newPass.length < 8) { setErrorMsg("Password baru minimal 8 karakter"); return }
    if (newPass !== confirmPass) { setErrorMsg("Konfirmasi password tidak cocok"); return }
    setErrorMsg(null)
    startTransition(async () => {
      try {
        const res = await fetch("/api/profil/password", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? "Gagal mengubah password")
        setSuccessMsg("Password berhasil diubah")
        setOldPass(""); setNewPass(""); setConfirmPass("")
        setTimeout(() => setSuccessMsg(null), 3000)
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan")
      }
    })
  }

  const passwordStrength = [
    newPass.length >= 8,
    /[A-Z]/.test(newPass),
    /[0-9]/.test(newPass),
    /[^A-Za-z0-9]/.test(newPass),
  ]
  const strengthScore = passwordStrength.filter(Boolean).length
  const strengthLabel = ["", "Lemah", "Cukup", "Baik", "Kuat"][strengthScore]
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e"][strengthScore]

  const passwordFields = [
    { label: "PASSWORD LAMA",            value: oldPass,     setter: setOldPass,     show: showOld,     toggle: () => setShowOld(p => !p) },
    { label: "PASSWORD BARU",            value: newPass,     setter: setNewPass,     show: showNew,     toggle: () => setShowNew(p => !p) },
    { label: "KONFIRMASI PASSWORD BARU", value: confirmPass, setter: setConfirmPass, show: showConfirm, toggle: () => setShowConfirm(p => !p) },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* ── Hero Profile Card ── */}
      <div style={{
        background: "#fff", borderRadius: "20px",
        border: "1px solid #e8edf5",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}>
        {/* Banner */}
        <div style={{
          height: "100px",
          background: "linear-gradient(135deg, #00205b 0%, #003580 50%, #00205b 100%)",
          position: "relative",
        }}>
          <div style={{ position: "absolute", right: -30, top: -30, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          <div style={{ position: "absolute", right: 80, bottom: -50, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
          <div style={{ position: "absolute", left: 220, top: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }} />
        </div>

        {/* Profile content */}
        <div style={{ padding: "0 32px 28px", position: "relative" }}>
          {/* Avatar */}
          <div style={{ position: "relative", display: "inline-block", marginTop: "-44px", marginBottom: "14px" }}>
            <div style={{
              width: 88, height: 88, borderRadius: "22px",
              background: foto ? "transparent" : "#1e3a7b",
              border: "4px solid #fff",
              boxShadow: "0 4px 16px rgba(0,32,91,0.2)",
              overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px", fontWeight: 800, color: "#fff",
              letterSpacing: "0.05em",
              position: "relative",
            }}>
              {foto
                ? <img src={foto} alt="Foto profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : getInitials(user.nama)
              }
              {fotoUploading && (
                <div style={{
                  position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    border: "2.5px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    animation: "spin 0.8s linear infinite",
                  }} />
                </div>
              )}
            </div>

            {/* Camera button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={fotoUploading}
              title="Ubah foto profil"
              style={{
                position: "absolute", bottom: -4, right: -4,
                width: 30, height: 30, borderRadius: "50%",
                background: "#00205b", border: "2.5px solid #fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: fotoUploading ? "not-allowed" : "pointer",
                color: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              }}>
              <IconCamera />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFotoChange}
            />
          </div>

          {/* Name + meta — tanpa stat cards */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "5px" }}>
              <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>{nama}</h1>
              <span style={{
                padding: "3px 10px", borderRadius: "20px",
                background: roleCfg.bg, color: roleCfg.color,
                fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em",
              }}>{roleCfg.label}</span>
            </div>
            <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "6px" }}>
              {user.email}
              {(jabatan || divisi) && <span> · {[jabatan, divisi].filter(Boolean).join(" · ")}</span>}
            </div>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              {user.nip && (
                <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                  NIP: <strong style={{ color: "#475569" }}>{user.nip}</strong>
                </span>
              )}
              <span style={{ fontSize: "12px", color: "#94a3b8" }}>
                Bergabung: <strong style={{ color: "#475569" }}>{formatTanggal(user.createdAt)}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{
        background: "#fff", borderRadius: "16px",
        border: "1px solid #e8edf5",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}>
        {/* Tab Bar */}
        <div style={{
          display: "flex", borderBottom: "1px solid #f1f5f9",
          padding: "0 28px", background: "#fafbfc",
        }}>
          {([
            { key: "info"     as const, label: "Informasi Akun", Icon: IconUser },
            { key: "password" as const, label: "Ubah Password",  Icon: IconLock },
          ]).map(t => (
            <button key={t.key}
              onClick={() => { setTab(t.key); setErrorMsg(null); setSuccessMsg(null) }}
              style={{
                padding: "15px 18px", border: "none", background: "none",
                fontSize: "13px", fontWeight: tab === t.key ? 700 : 500,
                color: tab === t.key ? "#00205b" : "#94a3b8",
                cursor: "pointer", outline: "none",
                borderBottom: tab === t.key ? "2.5px solid #00205b" : "2.5px solid transparent",
                marginBottom: "-1px",
                display: "flex", alignItems: "center", gap: "7px",
                transition: "color 150ms ease",
              }}>
              <t.Icon />
              {t.label}
            </button>
          ))}
        </div>

        {/* Alert */}
        {(successMsg || errorMsg) && (
          <div style={{ padding: "16px 28px 0" }}>
            <div style={{
              padding: "11px 16px", borderRadius: "10px",
              background: successMsg ? "#f0fdf4" : "#fff1f2",
              color: successMsg ? "#15803d" : "#b91c1c",
              fontSize: "13px", fontWeight: 600,
              border: `1px solid ${successMsg ? "#bbf7d0" : "#fecdd3"}`,
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              {successMsg ? <IconCheck /> : <IconAlert />}
              {successMsg ?? errorMsg}
            </div>
          </div>
        )}

        {/* ── TAB: Informasi Akun ── */}
        {tab === "info" && (
          <form onSubmit={handleSaveInfo} style={{ padding: "28px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>

              <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column" }}>
                <Label>Nama Lengkap <span style={{ color: "#ef4444" }}>*</span></Label>
                <input value={nama} onChange={e => setNama(e.target.value)}
                  style={inputStyle()}
                  onFocus={e => { e.currentTarget.style.borderColor = "#00205b"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,32,91,0.08)" }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <Label>NIP</Label>
                <input value={user.nip || "-"} readOnly style={inputStyle(true)} />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <Label>Email</Label>
                <input value={user.email} readOnly style={inputStyle(true)} />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <Label>Jabatan</Label>
                <input value={jabatan} onChange={e => setJabatan(e.target.value)}
                  placeholder="Contoh: Staf Teknis"
                  style={inputStyle()}
                  onFocus={e => { e.currentTarget.style.borderColor = "#00205b"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,32,91,0.08)" }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <Label>Divisi / Unit</Label>
                <input value={divisi} onChange={e => setDivisi(e.target.value)}
                  placeholder="Contoh: Teknis"
                  style={inputStyle()}
                  onFocus={e => { e.currentTarget.style.borderColor = "#00205b"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,32,91,0.08)" }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <Label>Role / Hak Akses</Label>
                <input value={roleCfg.label} readOnly style={inputStyle(true)} />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <Label>Tanggal Bergabung</Label>
                <input value={formatTanggal(user.createdAt)} readOnly style={inputStyle(true)} />
              </div>

            </div>

            <div style={{
              marginTop: "18px", padding: "11px 14px", borderRadius: "10px",
              background: "#f8fafc", border: "1px solid #e8edf5",
              fontSize: "12px", color: "#94a3b8",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <IconInfo />
              Field NIP, Email, dan Role hanya dapat diubah oleh Admin sistem.
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "22px" }}>
              <button type="submit" disabled={isPending}
                style={{
                  padding: "11px 30px", borderRadius: "10px",
                  background: isPending ? "#93a8d4" : "#00205b",
                  color: "#fff", fontSize: "13.5px", fontWeight: 700,
                  border: "none", cursor: isPending ? "not-allowed" : "pointer",
                  boxShadow: isPending ? "none" : "0 2px 8px rgba(0,32,91,0.25)",
                }}>
                {isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        )}

        {/* ── TAB: Ubah Password ── */}
        {tab === "password" && (
          <form onSubmit={handleChangePassword} style={{ padding: "28px", maxWidth: "500px" }}>

            <div style={{
              padding: "12px 16px", borderRadius: "10px", marginBottom: "24px",
              background: "#f8fafc", border: "1px solid #e8edf5",
              fontSize: "12.5px", color: "#64748b",
              display: "flex", alignItems: "flex-start", gap: "10px",
            }}>
              <div style={{ color: "#00205b", flexShrink: 0, marginTop: "1px" }}><IconShield /></div>
              <span>
                <strong style={{ color: "#0f172a" }}>Tips keamanan:</strong>{" "}
                Gunakan minimal 8 karakter dengan kombinasi huruf besar, huruf kecil, angka, dan simbol.
              </span>
            </div>

            {passwordFields.map(field => (
              <div key={field.label} style={{ marginBottom: "18px" }}>
                <Label>{field.label} <span style={{ color: "#ef4444" }}>*</span></Label>
                <div style={{ position: "relative" }}>
                  <input
                    type={field.show ? "text" : "password"}
                    value={field.value}
                    onChange={e => field.setter(e.target.value)}
                    placeholder="••••••••"
                    style={{ ...inputStyle(), paddingRight: "46px" }}
                    onFocus={e => { e.currentTarget.style.borderColor = "#00205b"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,32,91,0.08)" }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none" }}
                  />
                  <button type="button" onClick={field.toggle}
                    style={{
                      position: "absolute", right: "13px", top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none",
                      cursor: "pointer", color: "#94a3b8",
                      display: "flex", alignItems: "center", padding: 0,
                    }}>
                    <IconEye open={field.show} />
                  </button>
                </div>

                {field.label === "PASSWORD BARU" && newPass.length > 0 && (
                  <div style={{ marginTop: "8px" }}>
                    <div style={{ display: "flex", gap: "4px", marginBottom: "5px" }}>
                      {passwordStrength.map((ok, i) => (
                        <div key={i} style={{
                          height: "3px", flex: 1, borderRadius: "2px",
                          background: ok ? strengthColor : "#e2e8f0",
                          transition: "background 200ms ease",
                        }} />
                      ))}
                    </div>
                    <div style={{ fontSize: "11px", color: strengthColor, fontWeight: 700 }}>
                      Kekuatan password: {strengthLabel}
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
              <button type="submit" disabled={isPending}
                style={{
                  padding: "11px 30px", borderRadius: "10px",
                  background: isPending ? "#93a8d4" : "#00205b",
                  color: "#fff", fontSize: "13.5px", fontWeight: 700,
                  border: "none", cursor: isPending ? "not-allowed" : "pointer",
                  boxShadow: isPending ? "none" : "0 2px 8px rgba(0,32,91,0.25)",
                }}>
                {isPending ? "Memproses..." : "Ubah Password"}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}