import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SignOutButton } from "@/components/sign-out-button"
import NotifBell from "@/components/notif-bell"
import NavLink from "@/components/nav-link"
import TopbarUser from "@/components/topbar-user"

const Icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  sppd: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  plus: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  user: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  ),
  check: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  chart: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/>
      <path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
}

const navItems = {
  PEGAWAI: [
    { href: "/dashboard",            label: "Dashboard",   icon: Icons.dashboard },
    { href: "/dashboard/sppd",       label: "Daftar SPPD", icon: Icons.sppd     },
    { href: "/dashboard/pengajuan",  label: "Ajukan SPPD", icon: Icons.plus     },
    { href: "/dashboard/notifikasi", label: "Notifikasi",  icon: Icons.bell     },
    { href: "/dashboard/profil",     label: "Profil Saya", icon: Icons.user     },
  ],
  APPROVER: [
    { href: "/dashboard",            label: "Dashboard",        icon: Icons.dashboard },
    { href: "/dashboard/approval",   label: "Review Pengajuan", icon: Icons.check     },
    { href: "/dashboard/sppd",       label: "Semua SPPD",       icon: Icons.sppd      },
    { href: "/dashboard/laporan",    label: "Laporan",          icon: Icons.chart     },
    { href: "/dashboard/notifikasi", label: "Notifikasi",       icon: Icons.bell      },
    { href: "/dashboard/profil",     label: "Profil Saya",      icon: Icons.user      },
  ],
  ADMIN: [
    { href: "/dashboard",            label: "Dashboard",          icon: Icons.dashboard },
    { href: "/dashboard/sppd",       label: "Semua SPPD",         icon: Icons.sppd      },
    { href: "/dashboard/approval",   label: "Manajemen Approval", icon: Icons.check     },
    { href: "/dashboard/laporan",    label: "Laporan & Rekap",    icon: Icons.chart     },
    { href: "/dashboard/notifikasi", label: "Notifikasi",         icon: Icons.bell      },
    { href: "/dashboard/admin",      label: "Manajemen User",     icon: Icons.users     },
    { href: "/dashboard/profil",     label: "Profil Saya",        icon: Icons.user      },
  ],
}

// Footer sidebar — tampil untuk semua role
const footerItems = [
  { href: "/dashboard/pengaturan", label: "Pengaturan", icon: Icons.settings },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  const role = (session.user.role as keyof typeof navItems) || "PEGAWAI"
  const items = navItems[role] || navItems.PEGAWAI
  const initials = session.user.name?.split(" ").map((n: string) => n[0]).slice(0, 2).join("") || "U"
  const firstName = session.user.name?.split(" ")[0] || ""

  return (
    <div style={{
      display: "flex",
      minHeight: "100dvh",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      background: "#f5f6fa",
    }}>
      {/* ══════════════════════════════
           SIDEBAR
         ══════════════════════════════ */}
      <aside style={{
        width: 220,
        background: "#00205b",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        zIndex: 200,
      }}>
        {/* Logo Header */}
        <div style={{
          padding: "20px 16px 18px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}>
          <div style={{
            width: 38,
            height: 38,
            background: "#fff",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00205b" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div>
            <div style={{
              fontWeight: 800,
              fontSize: "14px",
              color: "#fff",
              letterSpacing: "-0.2px",
              lineHeight: 1.2,
            }}>
              SPPD KPU
            </div>
            <div style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.45)",
              letterSpacing: "0.3px",
              marginTop: "2px",
            }}>
              Jawa Tengah
            </div>
          </div>
        </div>

        {/* Nav Utama */}
        <nav style={{
          padding: "12px 10px",
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}>
          {items.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
          ))}
        </nav>

        {/* Footer Sidebar: Pengaturan + Keluar */}
        <div style={{
          padding: "10px 10px 18px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          flexShrink: 0,
        }}>
          {footerItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
          ))}
          <SignOutButton />
        </div>
      </aside>

      {/* ══════════════════════════════
           MAIN CONTENT
         ══════════════════════════════ */}
      <div style={{
        marginLeft: 220,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
      }}>
        {/* ── TOPBAR ── */}
        <header style={{
          background: "#ffffff",
          borderBottom: "1px solid #eef0f4",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          flexShrink: 0,
        }}>
          {/* Search Bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#f5f6fa",
            borderRadius: "10px",
            padding: "9px 14px",
            width: 260,
            border: "1px solid #eef0f4",
            cursor: "text",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aab0c0" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span style={{ fontSize: "13px", color: "#aab0c0" }}>Cari sesuatu...</span>
          </div>

          {/* Right: Bell + User */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}>
            <NotifBell />

            {/* Divider */}
            <div style={{
              width: 1,
              height: 28,
              background: "#eef0f4",
            }} />

            {/* User Info — Client Component */}
            <TopbarUser
              initials={initials}
              firstName={firstName}
              role={role}
            />
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main style={{
          padding: "24px",
          flex: 1,
          background: "#f5f6fa",
          minHeight: 0,
        }}>
          {children}
        </main>
      </div>
    </div>
  )
}