"use client"

import { useEffect, useState } from "react"
import { Info, FileText, CheckCircle, RefreshCw, Compass, BookOpen, MapPin, Phone, Mail, Map } from "lucide-react"

export default function CMSTentangPage() {
  const [form, setForm] = useState({ profil: "", visi: "", misi: "", alamat: "", telepon: "", email: "", mapEmbedUrl: "" })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/cms/tentang")
      .then(r => r.json())
      .then(d => {
        if (d) {
          setForm({ 
            profil: d.profil ?? "", 
            visi: d.visi ?? "", 
            misi: typeof d.misi === "string" ? JSON.parse(d.misi).join("\n") : "", 
            alamat: d.alamat ?? "", 
            telepon: d.telepon ?? "", 
            email: d.email ?? "", 
            mapEmbedUrl: d.mapEmbedUrl ?? "" 
          })
        }
      })
      .catch(err => console.error("Gagal memuat Tentang KPU:", err))
      .finally(() => setFetching(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, misi: JSON.stringify(form.misi.split("\n").filter(Boolean)) }
    try {
      await fetch("/api/cms/tentang", { 
        method: "PUT", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(payload) 
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error(error)
      alert("Gagal menyimpan perubahan.")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw size={32} className="animate-spin text-red-800" />
        <span className="font-semibold text-zinc-500 dark:text-zinc-400 text-sm">Memuat profil lembaga...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Kelola Tentang KPU</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Ubah profil lembaga, visi & misi, kontak sekretariat, dan peta lokasi kantor KPU Jawa Tengah.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Profil Lembaga */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-red-800 dark:text-red-400 flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-2">
              <Info size={16} />
              <span>Profil & Visi Misi</span>
            </h2>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
                Profil KPU Jawa Tengah
              </label>
              <textarea 
                value={form.profil} 
                onChange={e => setForm({ ...form, profil: e.target.value })} 
                placeholder="Tulis deskripsi profil lengkap KPU Jawa Tengah..."
                rows={4}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition font-sans" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
                  Visi Lembaga
                </label>
                <textarea 
                  value={form.visi} 
                  onChange={e => setForm({ ...form, visi: e.target.value })} 
                  placeholder="Tulis pernyataan visi KPU Jawa Tengah..."
                  rows={4}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition" 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
                  Misi Lembaga (Tulis satu per baris)
                </label>
                <textarea 
                  value={form.misi} 
                  onChange={e => setForm({ ...form, misi: e.target.value })} 
                  placeholder="Membangun SDM berkualitas&#10;Menyelenggarakan pemilu demokratis&#10;Meningkatkan partisipasi pemilih" 
                  rows={4}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition" 
                />
              </div>
            </div>
          </div>

          {/* Section 2: Informasi Alamat & Kontak */}
          <div className="space-y-4 pt-4">
            <h2 className="text-sm font-bold text-red-800 dark:text-red-400 flex items-center gap-2 border-b border-zinc-150 dark:border-zinc-800 pb-2">
              <Compass size={16} />
              <span>Lokasi & Kontak Sekretariat</span>
            </h2>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
                Alamat Kantor
              </label>
              <div className="relative">
                <input 
                  type="text"
                  value={form.alamat} 
                  onChange={e => setForm({ ...form, alamat: e.target.value })} 
                  placeholder="Jl. Veteran No. 1A, Semarang, Jawa Tengah"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition" 
                />
                <MapPin size={16} className="absolute left-3.5 top-3.5 text-zinc-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
                  Nomor Telepon
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    value={form.telepon} 
                    onChange={e => setForm({ ...form, telepon: e.target.value })} 
                    placeholder="Contoh: (024) 8311523"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition" 
                  />
                  <Phone size={16} className="absolute left-3.5 top-3.5 text-zinc-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
                  Alamat Email Resmi
                </label>
                <div className="relative">
                  <input 
                    type="email"
                    value={form.email} 
                    onChange={e => setForm({ ...form, email: e.target.value })} 
                    placeholder="Contoh: kpu-jatengprov@kpu.go.id"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition" 
                  />
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-zinc-400" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
                Peta Google Maps (URL Embed iframe)
              </label>
              <div className="relative">
                <input 
                  type="text"
                  value={form.mapEmbedUrl} 
                  onChange={e => setForm({ ...form, mapEmbedUrl: e.target.value })} 
                  placeholder="https://maps.google.com/maps?q=...&output=embed"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition" 
                />
                <Map size={16} className="absolute left-3.5 top-3.5 text-zinc-400" />
              </div>
              <p className="text-[10px] text-zinc-400">Gunakan link embed dengan parameter &output=embed agar peta dapat dirender langsung di portal.</p>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full inline-flex items-center justify-center gap-2 text-white px-6 py-3.5 rounded-xl text-xs font-bold transition shadow-lg active:scale-95 duration-100 ${
                saved 
                  ? "bg-green-600 shadow-green-950/10 hover:bg-green-700" 
                  : "bg-red-800 shadow-red-900/10 hover:bg-red-900"
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : saved ? (
                <>
                  <CheckCircle size={14} />
                  <span>Perubahan Disimpan!</span>
                </>
              ) : (
                <>
                  <CheckCircle size={14} />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
