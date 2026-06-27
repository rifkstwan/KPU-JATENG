"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Bell, Search, Settings, ChevronRight, LogOut, User, Shield, MessageSquare, ExternalLink } from "lucide-react"
import { signOut } from "next-auth/react"

interface FeedbackItem {
  id: string
  nama: string
  isi: string
  createdAt: any
}

interface CMSHeaderProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
  }
  initialUnreadCount: number
  initialUnreadItems: FeedbackItem[]
}

export default function CMSHeader({ user, initialUnreadCount, initialUnreadItems }: CMSHeaderProps) {
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [unreadItems, setUnreadItems] = useState<FeedbackItem[]>(initialUnreadItems)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)

  const notificationsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Navigation pages to search through
  const pages = [
    { name: "Dashboard", url: "/cms/dashboard", category: "Utama" },
    { name: "Kelola Berita", url: "/cms/berita", category: "Konten" },
    { name: "Kelola Publikasi", url: "/cms/publikasi", category: "Konten" },
    { name: "Kelola Layanan", url: "/cms/layanan", category: "Konten" },
    { name: "Tentang KPU", url: "/cms/tentang", category: "Informasi" },
    { name: "Kritik & Saran", url: "/cms/kritik-saran", category: "Interaksi" },
    { name: "Manajemen User", url: "/cms/users", category: "Pengaturan" },
  ]

  const filteredPages = searchQuery
    ? pages.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Poll for new kritik & saran every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/cms/notifications")
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.count)
          setUnreadItems(data.items)
        }
      } catch (err) {
        console.error("Gagal mengambil notifikasi:", err)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleSignOut = async () => {
    // Clear cookies by triggering SignOut API
    await signOut({ callbackUrl: "/cms-login" })
  }

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/cms/notifications/${id}/read`, { method: "POST" })
      // Remove from list and decrement count
      setUnreadItems(prev => prev.filter(item => item.id !== id))
      setUnreadCount(prev => Math.max(0, prev - 1))
      router.push("/cms/kritik-saran")
      setShowNotifications(false)
    } catch (err) {
      router.push("/cms/kritik-saran")
      setShowNotifications(false)
    }
  }

  return (
    <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-8 py-4 flex justify-between items-center sticky top-0 z-40 flex-shrink-0">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
        <span>CMS Admin</span>
        <ChevronRight size={12} />
        <span className="text-zinc-700 dark:text-zinc-300">Dashboard</span>
      </div>

      {/* Search and Action Items */}
      <div className="flex items-center gap-6">
        {/* Search Input with Autocomplete */}
        <div ref={searchRef} className="relative hidden md:block w-64">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSearchResults(true)
            }}
            onFocus={() => setShowSearchResults(true)}
            placeholder="Cari menu..."
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full pl-9 pr-4 py-1.5 text-xs outline-none focus:border-red-650 dark:focus:border-red-650/50 text-zinc-700 dark:text-zinc-200 transition"
          />

          {showSearchResults && filteredPages.length > 0 && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg py-2 z-50">
              <p className="text-[10px] font-bold text-zinc-400 uppercase px-4 py-1">Hasil Pencarian</p>
              {filteredPages.map(page => (
                <button
                  key={page.url}
                  onClick={() => {
                    router.push(page.url)
                    setSearchQuery("")
                    setShowSearchResults(false)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 flex items-center justify-between"
                >
                  <span>{page.name}</span>
                  <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">
                    {page.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 text-zinc-400">
          {/* Notification Menu */}
          <div ref={notificationsRef} className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="hover:text-zinc-700 dark:hover:text-white transition relative p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white dark:ring-zinc-900" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl py-3 z-50 overflow-hidden">
                <div className="px-4 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <span className="font-bold text-xs text-zinc-700 dark:text-white">Kritik & Saran Baru</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} Baru
                    </span>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                  {unreadItems.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
                      <MessageSquare className="mx-auto mb-2 text-zinc-300" size={24} />
                      Tidak ada saran baru yang belum dibaca.
                    </div>
                  ) : (
                    unreadItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => markAsRead(item.id)}
                        className="w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition flex flex-col gap-1"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">{item.nama}</span>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(item.createdAt).toLocaleDateString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {item.isi}
                        </p>
                      </button>
                    ))
                  )}
                </div>

                <div className="px-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    onClick={() => {
                      router.push("/cms/kritik-saran")
                      setShowNotifications(false)
                    }}
                    className="w-full py-1.5 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-center rounded-xl text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 transition"
                  >
                    Lihat Semua Feedback
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Settings Icon */}
          <button 
            onClick={() => router.push("/cms/users")} 
            className="hover:text-zinc-700 dark:hover:text-white transition p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          >
            <Settings size={18} />
          </button>

          <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800"></div>

          {/* Interactive User profile card */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-850 p-1.5 rounded-xl transition text-left"
            >
              <div className="w-6 h-6 rounded-full bg-red-800 text-white flex items-center justify-center text-[10px] font-bold">
                {user.name?.substring(0, 2).toUpperCase() ?? "AD"}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-zinc-700 dark:text-zinc-200 leading-tight">
                  {user.name ?? "Admin CMS"}
                </div>
                <div className="text-[9px] text-zinc-400">
                  {user.role === "CMS_ADMIN" ? "Super Admin" : "User"}
                </div>
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs font-bold text-zinc-800 dark:text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => {
                      router.push("/cms/users")
                      setShowProfileMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition text-left"
                  >
                    <Shield size={14} className="text-zinc-400" />
                    <span>Manajemen User</span>
                  </button>
                  <a
                    href="/"
                    target="_blank"
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-xl transition text-left"
                  >
                    <ExternalLink size={14} className="text-zinc-400" />
                    <span>Lihat Halaman Utama</span>
                  </a>
                </div>
                <div className="border-t border-zinc-100 dark:border-zinc-800 m-1 pt-1">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition text-left"
                  >
                    <LogOut size={14} />
                    <span>Keluar (Sign Out)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
