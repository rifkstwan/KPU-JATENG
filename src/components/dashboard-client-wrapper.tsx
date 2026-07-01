"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { SignOutButton } from "@/components/sign-out-button"
import NotifBell from "@/components/notif-bell"
import NavLink from "@/components/nav-link"
import TopbarUser from "@/components/topbar-user"
import TopbarSearch from "@/components/topbar-search"

interface DashboardClientWrapperProps {
  nama: string
  role: string
  image: string | null
  items: Array<{ href: string; label: string; icon: React.ReactNode }>
  footerItems: Array<{ href: string; label: string; icon: React.ReactNode }>
  children: React.ReactNode
}

export default function DashboardClientWrapper({
  nama,
  role,
  image,
  items,
  footerItems,
  children,
}: DashboardClientWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex bg-[#f5f6fa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Sidebar - Desktop: fixed/flex width, Mobile: sliding drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[220px] bg-[#00205b] flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 flex items-center justify-between border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-[38px] h-[38px] bg-white rounded-[10px] flex items-center justify-center shadow-md overflow-hidden flex-shrink-0">
              <img src="/logo-kpu.png" alt="Logo KPU" className="w-[34px] h-[34px] object-contain" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white leading-tight">SPPD KPU</div>
              <div className="text-[11px] text-white/50 tracking-wider mt-0.5">Jawa Tengah</div>
            </div>
          </div>
          {/* Close button on mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-white/70 hover:text-white p-1"
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto flex flex-col gap-0.5">
          {items.map((item) => (
            <div key={item.href} onClick={() => setIsSidebarOpen(false)}>
              <NavLink href={item.href} label={item.label} icon={item.icon} />
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 flex flex-col gap-0.5 flex-shrink-0">
          {footerItems.map((item) => (
            <div key={item.href} onClick={() => setIsSidebarOpen(false)}>
              <NavLink href={item.href} label={item.label} icon={item.icon} />
            </div>
          ))}
          <SignOutButton />
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-[220px]">
        {/* Header/Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-zinc-200 px-4 md:px-6 flex items-center justify-between shadow-sm gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger button for mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden text-zinc-600 hover:text-zinc-900 p-1.5 rounded-lg hover:bg-zinc-100"
              aria-label="Open Sidebar"
            >
              <Menu size={22} />
            </button>
            <TopbarSearch />
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <NotifBell />
            <div className="w-[1px] h-7 bg-zinc-200" />
            <TopbarUser nama={nama} role={role} image={image} />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 bg-[#f5f6fa]">
          {children}
        </main>
      </div>
    </div>
  )
}
