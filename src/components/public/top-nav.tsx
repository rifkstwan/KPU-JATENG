"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function TopNav() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Avoid hydration mismatch by only rendering the toggle after mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to search page (you can replace this with router.push later)
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <nav className="bg-surface-container-lowest text-on-surface px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-level1">
      <Link href="/" className="flex items-center gap-3 group">
        {/* Logos */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-10 h-10 group-hover:scale-105 transition-transform">
            <Image src="/logo-kpu.png" alt="Logo KPU" fill className="object-contain" />
          </div>
          <div className="relative w-8 h-10 group-hover:scale-105 transition-transform">
            <Image src="/logo-jateng.svg" alt="Logo Jawa Tengah" fill className="object-contain" />
          </div>
        </div>
        <div className="hidden md:block pl-3 border-l border-zinc-300 dark:border-zinc-700">
          <p className="font-bold text-sm uppercase text-zinc-900 dark:text-white tracking-tight">KPU Provinsi Jawa Tengah</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Komisi Pemilihan Umum</p>
        </div>
      </Link>
      
      <div className="hidden lg:flex gap-6 text-label-large font-medium items-center">
        <Link href="/tentang" className="hover:text-primary transition">Tentang KPU Jateng</Link>
        <Link href="/reformasi" className="hover:text-primary transition">Reformasi Birokrasi</Link>
        <Link href="/faq" className="hover:text-primary transition">FAQ</Link>
        <Link href="/e-book" className="hover:text-primary transition">E-Book</Link>
        <Link href="/berita" className="hover:text-primary transition">Berita</Link>
        
        <div className="flex items-center gap-4 ml-4 pl-4 border-l border-outline-variant">
          
          <div className="flex items-center">
            {searchOpen && (
              <form onSubmit={handleSearchSubmit} className="mr-2">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Cari..." 
                  className="bg-surface-container border border-outline-variant text-sm rounded-full px-3 py-1 outline-none focus:border-primary transition-all w-32 md:w-48"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => !searchQuery && setSearchOpen(false)}
                />
              </form>
            )}
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-on-surface hover:text-primary transition" 
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>


          {mounted && (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-on-surface hover:text-primary transition" 
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
