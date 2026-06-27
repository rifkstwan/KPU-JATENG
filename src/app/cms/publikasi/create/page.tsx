"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CheckCircle, RefreshCw, Video, Calendar, Heading } from "lucide-react"

export default function CreatePublikasiPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    judul: "",
    url: "",
    tanggal: "",
    published: true,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/cms/publikasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: formData.judul,
          url: formData.url,
          tanggal: formData.tanggal || null,
          published: formData.published,
        }),
      })

      if (res.ok) {
        router.push("/cms/publikasi")
      } else {
        alert("Gagal menambahkan publikasi.")
      }
    } catch (error) {
      console.error(error)
      alert("Terjadi kesalahan sistem.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/cms/publikasi" 
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-900 transition active:scale-95 duration-100"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Tambah Publikasi</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Tambahkan video dokumentasi kegiatan atau sosialisasi KPU Jawa Tengah.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Judul Video */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
              Judul Video <span className="text-red-650">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Contoh: SOSIALISASI PEMILU 2024 DI JAWA TENGAH"
                value={formData.judul}
                onChange={e => setFormData({ ...formData, judul: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition"
              />
              <Heading size={16} className="absolute left-3.5 top-3.5 text-zinc-400" />
            </div>
          </div>

          {/* URL YouTube */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
              URL Video YouTube <span className="text-red-650">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                required
                placeholder="Contoh: https://www.youtube.com/watch?v=xxxxxx atau https://youtu.be/xxxxxx"
                value={formData.url}
                onChange={e => setFormData({ ...formData, url: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition"
              />
              <Video size={16} className="absolute left-3.5 top-3.5 text-zinc-400" />
            </div>
            <p className="text-[10px] text-zinc-400">Pastikan tautan merupakan video publik di YouTube agar thumbnail dan pemutar video berfungsi.</p>
          </div>

          {/* Tanggal Rilis */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
              Tanggal Publikasi (Opsional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Contoh: 25 Mei 2026 atau Juni 2026"
                value={formData.tanggal}
                onChange={e => setFormData({ ...formData, tanggal: e.target.value })}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition"
              />
              <Calendar size={16} className="absolute left-3.5 top-3.5 text-zinc-400" />
            </div>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 p-4 rounded-xl">
            <input 
              type="checkbox" 
              id="published"
              checked={formData.published}
              onChange={e => setFormData({...formData, published: e.target.checked})}
              className="w-4 h-4 rounded text-red-800 border-zinc-300 focus:ring-red-800/30"
            />
            <div className="leading-tight">
              <label htmlFor="published" className="text-xs font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer select-none">
                Langsung Terbitkan ke Portal Publik
              </label>
              <p className="text-[10px] text-zinc-400">Jika dicentang, video publikasi ini akan langsung tampil pada galeri dokumentasi portal utama.</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex gap-4">
            <button 
              type="submit" 
              disabled={loading}
              className="inline-flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-6 py-3 rounded-xl text-xs font-bold transition shadow-lg shadow-red-900/10 disabled:opacity-50 active:scale-95 duration-100"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  <span>Simpan Publikasi</span>
                </>
              )}
            </button>
            <Link 
              href="/cms/publikasi" 
              className="border border-zinc-250 dark:border-zinc-800 text-zinc-650 hover:bg-zinc-50 dark:hover:bg-zinc-850 px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center transition"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
