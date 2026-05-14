// src/app/(auth)/login/page.tsx
"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

const LogoKPU = () => (
  <img
    src="/logo-kpu.png"
    alt="Logo KPU"
    width={36}
    height={36}
    style={{ objectFit: "contain", display: "block" }}
  />
)

const LogoJateng = () => (
  <img
    src="/logo-jateng.svg"
    alt="Logo Jawa Tengah"
    width={36}
    height={36}
    style={{ objectFit: "contain", display: "block" }}
  />
)

const LogoBadge = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 10,
        background: "rgba(255,255,255,0.9)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 4, boxSizing: "border-box", flexShrink: 0,
      }}>
        <LogoKPU />
      </div>
      <div style={{
        width: 48, height: 48, borderRadius: 10,
        background: "rgba(255,255,255,0.9)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 4, boxSizing: "border-box", flexShrink: 0,
      }}>
        <LogoJateng />
      </div>
      <div style={{
        width: 1, height: 32,
        background: "rgba(255,255,255,0.2)",
        margin: "0 4px",
      }} />
      <span style={{
        color: "white", fontWeight: 700,
        fontSize: 17, letterSpacing: "-0.3px",
      }}>
        SPPD KPU Jawa Tengah
      </span>
    </div>

<div style={{
  display: "inline-flex", alignItems: "center", gap: 8,
  background: "linear-gradient(135deg, #f5c518, #e6a800)",
  borderRadius: 999, padding: "6px 16px",
  width: "fit-content",
  boxShadow: "0 2px 12px rgba(245,197,24,0.35)",
}}>
  <span style={{
    color: "#3d2600", fontSize: 11,
    fontWeight: 800, letterSpacing: "1.2px",
  }}>
    KOMISI PEMILIHAN UMUM RI
  </span>
</div>
  </div>
)

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)
    if (res?.error) {
      setError("Email atau password salah. Silakan coba lagi.")
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "'Inter', -apple-system, sans-serif",
      background: "#ffffff",
    }}>

      {/* ===== KIRI: Hero Panel ===== */}
      <div style={{
        flex: "0 0 55%",
        position: "relative",
        overflow: "hidden",
        display: "none",
      }} className="hero-panel">

        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, #00205b 0%, #003087 40%, #0041a8 70%, #00205b 100%)",
        }} />

        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }} />

        <div style={{
          position: "absolute", top: -100, right: -100,
          width: 350, height: 350,
          background: "rgba(255,255,255,0.04)",
          borderRadius: "50%",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: -80,
          width: 280, height: 280,
          background: "rgba(245,197,24,0.06)",
          borderRadius: "50%",
        }} />

        <div style={{
          position: "relative", zIndex: 2,
          height: "100%", display: "flex",
          flexDirection: "column", justifyContent: "space-between",
          padding: "44px",
        }}>

          <LogoBadge />

          <div>
            <h2 style={{
              color: "white", fontSize: 38, fontWeight: 800,
              lineHeight: 1.2, margin: "0 0 18px",
              letterSpacing: "-1px",
            }}>
              Kelola perjalanan<br />dinas dengan<br />
              <span style={{ color: "#f5c518" }}>mudah & efisien</span>
            </h2>
            <p style={{
              color: "rgba(255,255,255,0.55)", fontSize: 15,
              lineHeight: 1.7, margin: "0 0 24px",
            }}>
                Sistem informasi terpadu untuk pengajuan,
                persetujuan, dan pelaporan SPPD KPU.
            </p>
          </div>

          {/* Feature Highlights */}
          <div style={{
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20, padding: "28px",
          }}>
            <p style={{
              color: "rgba(255,255,255,0.5)", fontSize: 11,
              fontWeight: 600, letterSpacing: "1px",
              margin: "0 0 20px",
            }}>
              FITUR UNGGULAN
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5c518" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10 9 9 9 8 9"/>
                    </svg>
                  ),
                  title: "Pengajuan Digital",
                  desc: "Ajukan SPPD kapan saja tanpa antri",
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5c518" strokeWidth="2">
                      <polyline points="9 11 12 14 22 4"/>
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                    </svg>
                  ),
                  title: "Approval Cepat",
                  desc: "Persetujuan real-time oleh atasan",
                },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5c518" strokeWidth="2">
                      <line x1="18" y1="20" x2="18" y2="10"/>
                      <line x1="12" y1="20" x2="12" y2="4"/>
                      <line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                  ),
                  title: "Laporan Otomatis",
                  desc: "Rekap & statistik tersedia langsung",
                },
              ].map((item) => (
                <div key={item.title} style={{
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                    background: "rgba(245,197,24,0.12)",
                    border: "1px solid rgba(245,197,24,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{
                      color: "white", fontWeight: 600,
                      fontSize: 14, marginBottom: 2,
                    }}>
                      {item.title}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
                      {item.desc}
                    </div>
                  </div>
                  <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="rgba(255,255,255,0.2)" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: 24, paddingTop: 20,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 8px #22c55e",
              }} />
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
                Sistem aktif · KPU Jawa Tengah
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ===== KANAN: Form Panel ===== */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "48px 10%",
        background: "#ffffff",
      }}>

        <div style={{
          display: "flex", alignItems: "center",
          gap: 12, marginBottom: 44,
        }}>
          <LogoKPU />
          <LogoJateng />
          <div style={{
            width: 1, height: 32,
            background: "#e8e8e8", margin: "0 4px",
          }} />
          <div>
            <div style={{
              fontWeight: 800, fontSize: 14,
              color: "#111", letterSpacing: "-0.3px",
            }}>
              SPPD KPU
            </div>
            <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>
              Jawa Tengah
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 36, maxWidth: 380 }}>
          <h1 style={{
            fontSize: 26, fontWeight: 800, color: "#0a0a0a",
            margin: "0 0 8px", letterSpacing: "-0.5px",
          }}>
            Selamat datang kembali
          </h1>
          <p style={{ color: "#999", fontSize: 14, margin: 0, lineHeight: 1.6 }}>
            Masuk untuk mengakses sistem perjalanan dinas KPU.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ maxWidth: 380 }}>

          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: "block", fontSize: 13,
              fontWeight: 600, color: "#333", marginBottom: 8,
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@kpu.go.id"
              required
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "12px 14px",
                border: "1.5px solid #e8e8e8",
                borderRadius: 10, fontSize: 14,
                color: "#111", background: "#fafafa",
                outline: "none", transition: "all 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.border = "1.5px solid #003087"
                e.target.style.boxShadow = "0 0 0 3px rgba(0,48,135,0.08)"
                e.target.style.background = "#fff"
              }}
              onBlur={(e) => {
                e.target.style.border = "1.5px solid #e8e8e8"
                e.target.style.boxShadow = "none"
                e.target.style.background = "#fafafa"
              }}
            />
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{
              display: "block", fontSize: 13,
              fontWeight: 600, color: "#333", marginBottom: 8,
            }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "12px 44px 12px 14px",
                  border: "1.5px solid #e8e8e8",
                  borderRadius: 10, fontSize: 14,
                  color: "#111", background: "#fafafa",
                  outline: "none", transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.border = "1.5px solid #003087"
                  e.target.style.boxShadow = "0 0 0 3px rgba(0,48,135,0.08)"
                  e.target.style.background = "#fff"
                }}
                onBlur={(e) => {
                  e.target.style.border = "1.5px solid #e8e8e8"
                  e.target.style.boxShadow = "none"
                  e.target.style.background = "#fafafa"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute", right: 14, top: "50%",
                  transform: "translateY(-50%)", background: "none",
                  border: "none", cursor: "pointer", padding: 0,
                  color: "#bbb", display: "flex", alignItems: "center",
                }}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              marginBottom: 16, padding: "11px 14px",
              background: "#fff5f5",
              border: "1.5px solid #fecaca",
              borderRadius: 10, color: "#dc2626", fontSize: 13,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "14px",
              background: loading ? "#6b8fd4" : "#003087",
              border: "none", borderRadius: 10,
              color: "white", fontWeight: 700, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s", letterSpacing: "0.3px",
              boxShadow: loading ? "none" : "0 4px 14px rgba(0,48,135,0.3)",
            }}
            onMouseEnter={(e) => {
              if (!loading) (e.target as HTMLButtonElement).style.background = "#00205b"
            }}
            onMouseLeave={(e) => {
              if (!loading) (e.target as HTMLButtonElement).style.background = "#003087"
            }}
          >
            {loading ? (
              <span style={{
                display: "flex", alignItems: "center",
                justifyContent: "center", gap: 8,
              }}>
                <span style={{
                  width: 15, height: 15,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white", borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }} />
                Memverifikasi...
              </span>
            ) : "Masuk ke Sistem"}
          </button>
        </form>

        <p style={{
          marginTop: 44, color: "#ddd",
          fontSize: 11, maxWidth: 380, letterSpacing: "0.3px",
        }}>
          Sistem Informasi Perjalanan Dinas · KPU RI © 2026
        </p>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .hero-panel { display: flex !important; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: #c0c0c0; }
      `}</style>
    </div>
  )
}