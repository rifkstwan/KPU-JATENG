"use client"

import { useState } from "react"

interface Props {
  name: string
  email: string
  role: string
}

export default function ProfilClient({ name, email, role }: Props) {
  const [activeTab, setActiveTab] = useState<"info" | "password">("info")

  const initials = name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")

  const roleLabel: Record<string, string> = {
    PEGAWAI: "Pegawai",
    APPROVER: "Approver",
    ADMIN: "Administrator",
  }

  const roleColor: Record<string, string> = {
    PEGAWAI: "#00205b",
    APPROVER: "#0a7c5c",
    ADMIN: "#7c3a00",
  }

  const roleBg: Record<string, string> = {
    PEGAWAI: "#e8edf7",
    APPROVER: "#e0f4ee",
    ADMIN: "#f7ede0",
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1a1f36", margin: 0 }}>
          Profil Saya
        </h1>
        <p style={{ fontSize: "14px", color: "#8f95a3", margin: "4px 0 0" }}>
          Kelola informasi akun dan keamanan kamu.
        </p>
      </div>

      {/* Layout 2 Kolom */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        gap: "20px",
        alignItems: "start",
      }}>

        {/* ── KOLOM KIRI: Kartu Identitas ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Avatar Card */}
          <div style={{
            background: "#fff",
            borderRadius: "14px",
            border: "1px solid #eef0f4",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            overflow: "hidden",
          }}>
            {/* Banner */}
            <div style={{
              height: 72,
              background: "linear-gradient(135deg, #00205b 0%, #0041a8 100%)",
            }} />

            {/* Avatar + Info */}
            <div style={{ padding: "0 20px 20px", textAlign: "center" }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00205b 0%, #0041a8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "24px",
                fontWeight: 700,
                margin: "-36px auto 12px",
                border: "3px solid #fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                letterSpacing: "1px",
              }}>
                {initials}
              </div>

              <div style={{ fontSize: "16px", fontWeight: 700, color: "#1a1f36" }}>{name}</div>
              <div style={{ fontSize: "12px", color: "#8f95a3", marginTop: "2px" }}>{email}</div>

              <div style={{
                display: "inline-block",
                marginTop: "10px",
                padding: "4px 12px",
                borderRadius: "999px",
                background: roleBg[role] || "#e8edf7",
                color: roleColor[role] || "#00205b",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}>
                {roleLabel[role] || role}
              </div>
            </div>
          </div>

          {/* Info Singkat */}
          <div style={{
            background: "#fff",
            borderRadius: "14px",
            border: "1px solid #eef0f4",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}>
            {[
              { label: "NIP", value: "197001012000011001", icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8f95a3" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <path d="M2 10h20"/>
                </svg>
              )},
              { label: "Jabatan", value: "Staf Teknis", icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8f95a3" strokeWidth="2">
                  <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
                  <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                </svg>
              )},
              { label: "Divisi", value: "Teknis", icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8f95a3" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                  <path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
              )},
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  background: "#f5f6fa",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "#aab0c0", fontWeight: 600, letterSpacing: "0.3px" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: "13px", color: "#1a1f36", fontWeight: 500, marginTop: "1px" }}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── KOLOM KANAN: Form ── */}
        <div>
          {/* Tabs */}
          <div style={{
            display: "flex",
            gap: "4px",
            marginBottom: "16px",
            background: "#f5f6fa",
            borderRadius: "10px",
            padding: "4px",
            width: "fit-content",
          }}>
            {[
              { key: "info", label: "Info Diri" },
              { key: "password", label: "Ganti Password" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as "info" | "password")}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  transition: "all 0.15s",
                  background: activeTab === tab.key ? "#fff" : "transparent",
                  color: activeTab === tab.key ? "#00205b" : "#8f95a3",
                  boxShadow: activeTab === tab.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Card */}
          <div style={{
            background: "#fff",
            borderRadius: "14px",
            border: "1px solid #eef0f4",
            overflow: "hidden",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}>
            {activeTab === "info" && (
              <div style={{ padding: "28px" }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}>
                  {[
                    { label: "Nama Lengkap", value: name },
                    { label: "NIP", value: "197001012000011001" },
                    { label: "Jabatan", value: "Staf Teknis" },
                    { label: "Divisi", value: "Teknis" },
                  ].map((field) => (
                    <div key={field.label}>
                      <label style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#8f95a3",
                        marginBottom: "6px",
                        letterSpacing: "0.4px",
                        textTransform: "uppercase",
                      }}>
                        {field.label}
                      </label>
                      <input
                        defaultValue={field.value}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #eef0f4",
                          fontSize: "14px",
                          color: "#1a1f36",
                          background: "#fafafa",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                        onFocus={e => e.currentTarget.style.border = "1px solid #00205b"}
                        onBlur={e => e.currentTarget.style.border = "1px solid #eef0f4"}
                      />
                    </div>
                  ))}

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#8f95a3",
                      marginBottom: "6px",
                      letterSpacing: "0.4px",
                      textTransform: "uppercase",
                    }}>
                      Email
                    </label>
                    <input
                      defaultValue={email}
                      readOnly
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid #eef0f4",
                        fontSize: "14px",
                        color: "#aab0c0",
                        background: "#f5f6fa",
                        outline: "none",
                        boxSizing: "border-box",
                        cursor: "not-allowed",
                      }}
                    />
                    <p style={{ fontSize: "12px", color: "#c0c4ce", marginTop: "5px" }}>
                      Email tidak dapat diubah.
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: "24px", borderTop: "1px solid #f0f1f5", paddingTop: "20px" }}>
                  <button
                    style={{
                      padding: "10px 24px",
                      background: "#00205b",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#001540")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#00205b")}
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            )}

            {activeTab === "password" && (
              <div style={{ padding: "28px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {[
                    { label: "Password Lama", id: "old" },
                    { label: "Password Baru", id: "new" },
                    { label: "Konfirmasi Password Baru", id: "confirm" },
                  ].map((field) => (
                    <div key={field.id}>
                      <label style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#8f95a3",
                        marginBottom: "6px",
                        letterSpacing: "0.4px",
                        textTransform: "uppercase",
                      }}>
                        {field.label}
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: "1px solid #eef0f4",
                          fontSize: "14px",
                          color: "#1a1f36",
                          background: "#fafafa",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                        onFocus={e => e.currentTarget.style.border = "1px solid #00205b"}
                        onBlur={e => e.currentTarget.style.border = "1px solid #eef0f4"}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: "24px", borderTop: "1px solid #f0f1f5", paddingTop: "20px" }}>
                  <button
                    style={{
                      padding: "10px 24px",
                      background: "#00205b",
                      color: "#fff",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#001540")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#00205b")}
                  >
                    Perbarui Password
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}