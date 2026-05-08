import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { SignOutButton } from "@/components/sign-out-button"
import NotifBell from "@/components/notif-bell"

const navItems = {
  PEGAWAI: [
    { href: "/dashboard", label: "🏠 Dashboard" },
    { href: "/dashboard/sppd", label: "📋 Daftar SPPD" },
    { href: "/dashboard/pengajuan", label: "➕ Ajukan SPPD" },
    { href: "/dashboard/notifikasi", label: "🔔 Notifikasi" },
    { href: "/dashboard/profil", label: "👤 Profil Saya" },
    { href: "/dashboard/pengaturan", label: "⚙️ Pengaturan" },
  ],
  APPROVER: [
    { href: "/dashboard", label: "🏠 Dashboard" },
    { href: "/dashboard/approval", label: "✅ Review Pengajuan" },
    { href: "/dashboard/sppd", label: "📋 Semua SPPD" },
    { href: "/dashboard/laporan", label: "📊 Laporan" },
    { href: "/dashboard/notifikasi", label: "🔔 Notifikasi" },
    { href: "/dashboard/profil", label: "👤 Profil Saya" },
  ],
 ADMIN: [
  { href: "/dashboard", label: "🏠 Dashboard" },
  { href: "/dashboard/sppd", label: "📋 Semua SPPD" },
  { href: "/dashboard/approval", label: "✅ Manajemen Approval" },
  { href: "/dashboard/laporan", label: "📊 Laporan & Rekap" },
  { href: "/dashboard/notifikasi", label: "🔔 Notifikasi" },
  { href: "/dashboard/admin", label: "👥 Manajemen User" },  // ← tambahkan
  { href: "/dashboard/profil", label: "👤 Profil Saya" },
  { href: "/dashboard/pengaturan", label: "⚙️ Pengaturan" },
],
}
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/login")

  const role = (session.user.role as keyof typeof navItems) || "PEGAWAI"
  const items = navItems[role] || navItems.PEGAWAI
  const initials = session.user.name
    ?.split(" ").map((n) => n[0]).slice(0, 2).join("") || "U"

  return (
    <div style={{ display: "flex", minHeight: "100dvh", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* SIDEBAR */}
      <aside style={{
        width: 240, background: "#f9f8f5", borderRight: "1px solid #dcd9d5",
        display: "flex", flexDirection: "column", position: "fixed",
        top: 0, left: 0, height: "100vh", zIndex: 200, overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{
          padding: "1.25rem", borderBottom: "1px solid #dcd9d5",
          display: "flex", alignItems: "center", gap: "0.75rem",
        }}>
          <div style={{
            width: 32, height: 32, background: "#01696f", borderRadius: "0.5rem",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>SPPD KPU</div>
            <div style={{ fontSize: "0.7rem", color: "#7a7974" }}>Perjalanan Dinas</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "0.75rem", flex: 1 }}>
          <div style={{
            fontSize: "10px", fontWeight: 600, color: "#bab9b4",
            textTransform: "uppercase", letterSpacing: "0.08em",
            padding: "1rem 0.75rem 0.5rem",
          }}>Menu</div>
          {items.map((item) => (
            <Link key={item.href} href={item.href} style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.5rem 0.75rem", borderRadius: "0.5rem",
              color: "#7a7974", textDecoration: "none",
              fontSize: "0.875rem", fontWeight: 500,
              marginBottom: "2px", transition: "all 180ms ease",
            }}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div style={{
          padding: "1rem", borderTop: "1px solid #dcd9d5",
          display: "flex", alignItems: "center", gap: "0.75rem",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "9999px", background: "#01696f",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: "0.75rem", fontWeight: 600,
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>
              {session.user.name}
            </div>
            <div style={{ fontSize: "10px", color: "#7a7974" }}>{role}</div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ marginLeft: 240, flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{
          background: "#f9f8f5", borderBottom: "1px solid #dcd9d5",
          padding: "0.75rem 1.5rem", display: "flex", alignItems: "center",
          justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{ fontWeight: 700, fontSize: "1rem" }}>SPPD KPU</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <NotifBell />
            <span style={{
              background: "#cedcd8", color: "#01696f", padding: "2px 10px",
              borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600,
            }}>
              {role}
            </span>
          </div>
        </header>
        <main style={{ padding: "1.5rem", flex: 1, background: "#f7f6f2" }}>
          {children}
        </main>
      </div>
    </div>
  )
}