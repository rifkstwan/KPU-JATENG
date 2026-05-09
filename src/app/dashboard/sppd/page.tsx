import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function SppdPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "24px",
      }}>
        <div>
          <h1 style={{
            fontSize: "22px",
            fontWeight: 800,
            color: "#1a1f36",
            margin: 0,
          }}>
            Daftar SPPD
          </h1>
          <p style={{ fontSize: "13px", color: "#8f95a3", margin: "4px 0 0" }}>
            Semua pengajuan perjalanan dinas Anda
          </p>
        </div>

        <Link href="/dashboard/pengajuan" style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "#00205b",
          color: "#fff",
          padding: "9px 16px",
          borderRadius: "10px",
          textDecoration: "none",
          fontSize: "13px",
          fontWeight: 600,
        }}>
          + Ajukan SPPD
        </Link>
      </div>

      {/* Tabel / konten SPPD */}
      <div style={{
        background: "#fff",
        borderRadius: "12px",
        border: "1px solid #eef0f4",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 20px",
          borderBottom: "1px solid #eef0f4",
          fontSize: "13px",
          fontWeight: 600,
          color: "#1a1f36",
        }}>
          Pengajuan Saya
        </div>

        {/* Empty state sementara */}
        <div style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "#8f95a3",
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="#c5c9d6" strokeWidth="1.5" style={{ margin: "0 auto 12px" }}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <p style={{ fontSize: "14px", fontWeight: 600, color: "#1a1f36", margin: "0 0 4px" }}>
            Belum ada SPPD
          </p>
          <p style={{ fontSize: "13px", margin: 0 }}>
            Klik tombol "Ajukan SPPD" untuk membuat pengajuan baru
          </p>
        </div>
      </div>
    </div>
  )
}