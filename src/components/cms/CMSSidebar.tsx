"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { 
  LayoutDashboard, 
  Newspaper, 
  Video, 
  ShieldCheck, 
  MessageSquare, 
  Info, 
  Users, 
  ExternalLink, 
  LogOut,
  Settings,
  BellRing
} from "lucide-react"
import { useEffect, useState } from "react"

interface MenuItem {
  href: string
  label: string
  icon: any
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

export default function CMSSidebar() {
  const pathname = usePathname()
  const [userName, setUserName] = useState("Admin CMS")

  useEffect(() => {
    // Attempt to fetch name from session if available
    fetch("/api/auth/cms/session")
      .then(res => res.json())
      .then(data => {
        if (data?.user?.name) {
          setUserName(data.user.name)
        }
      })
      .catch(() => {})
  }, [])

  const groups: MenuGroup[] = [
    {
      title: "Main",
      items: [
        { href: "/cms/dashboard", label: "Dashboard", icon: LayoutDashboard },
      ]
    },
    {
      title: "Konten Publik",
      items: [
        { href: "/cms/berita", label: "Kelola Berita", icon: Newspaper },
        { href: "/cms/publikasi", label: "Kelola Publikasi", icon: Video },
        { href: "/cms/layanan", label: "Kelola Layanan", icon: ShieldCheck },
        { href: "/cms/tentang", label: "Tentang KPU", icon: Info },
      ]
    },
    {
      title: "Interaksi",
      items: [
        { href: "/cms/kritik-saran", label: "Kritik & Saran", icon: MessageSquare },
      ]
    },
    {
      title: "Pengaturan",
      items: [
        { href: "/cms/users", label: "Manajemen User", icon: Users },
      ]
    }
  ]

  return (
    <aside className="w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col min-h-screen">
      {/* Brand Header */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
        <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
          <Image src="/logo-kpu.png" alt="Logo KPU" fill className="object-contain" />
        </div>
        <div>
          <p className="font-extrabold text-sm text-zinc-900 dark:text-white tracking-tight leading-tight uppercase">CMS Jateng</p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Panel Pengelola Konten</p>
        </div>
      </div>

      {/* Nav Content */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto space-y-4">
        {groups.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-3">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition duration-200 ${
                      isActive
                        ? "bg-primary/5 text-primary dark:bg-primary/20 dark:text-primary-container font-bold"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon size={16} className={isActive ? "text-primary" : "text-zinc-400 dark:text-zinc-500"} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Profile & Sign Out (Locked at the bottom of viewport) */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 mt-auto">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-[11px] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white transition mb-2"
        >
          <span className="font-semibold">Lihat Landing Page</span>
          <ExternalLink size={12} />
        </Link>

        {/* User Card */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-300 flex-shrink-0">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-zinc-900 dark:text-white truncate leading-tight">{userName}</p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">CMS Admin</p>
            </div>
          </div>
          <form action="/api/auth/cms/signout" method="POST" className="flex-shrink-0">
            <button
              type="submit"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
              aria-label="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
