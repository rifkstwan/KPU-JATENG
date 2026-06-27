"use client"

import { useState, useRef, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, X, Image as ImageIcon, CheckCircle, RefreshCw } from "lucide-react"

export default function EditBeritaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [dragActive, setDragActive] = useState(false)
  const [form, setForm] = useState({
    judul: "",
    ringkasan: "",
    konten: "",
    kategori: "",
    sumber: "",
    gambarUrl: "",
    published: true,
  })

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetch(`/api/cms/berita/${id}`)
        if (res.ok) {
          const data = await res.json()
          setForm({
            judul: data.judul || "",
            ringkasan: data.ringkasan || "",
            konten: data.konten || "",
            kategori: data.kategori || "",
            sumber: data.sumber || "",
            gambarUrl: data.gambarUrl || "",
            published: data.published ?? true,
          })
        } else {
          alert("Gagal memuat detail berita.")
          router.push("/cms/berita")
        }
      } catch (error) {
        console.error("Error loading news detail:", error)
        alert("Terjadi kesalahan memuat data.")
      } finally {
        setFetching(false)
      }
    }

    loadNews()
  }, [id, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch(`/api/cms/berita/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        router.push("/cms/berita")
      } else {
        alert("Gagal memperbarui berita.")
      }
    } catch (error) {
      console.error(error)
      alert("Terjadi kesalahan sistem.")
    } finally {
      setLoading(false)
    }
  }

  // Handle Drag & Drop events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0])
    }
  }

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Harap pilih berkas gambar yang valid!")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, gambarUrl: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setForm(prev => ({ ...prev, gambarUrl: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <RefreshCw size={32} className="animate-spin text-red-800" />
        <span className="font-semibold text-zinc-500 dark:text-zinc-400 text-sm">Memuat detail berita...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/cms/berita" 
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-900 transition active:scale-95 duration-100"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Edit Berita</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Ubah artikel berita atau pengumuman sosialisasi KPU.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Judul */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
              Judul Berita <span className="text-red-650">*</span>
            </label>
            <input 
              required 
              type="text"
              placeholder="Masukkan judul berita yang informatif..."
              value={form.judul} 
              onChange={e => setForm({...form, judul: e.target.value})} 
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Kategori */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
                Kategori Berita
              </label>
              <input 
                type="text"
                placeholder="Misal: Sosialisasi, Pilkada, Pengumuman"
                value={form.kategori} 
                onChange={e => setForm({...form, kategori: e.target.value})} 
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition" 
              />
            </div>

            {/* Sumber */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
                Sumber Rilis
              </label>
              <input 
                type="text"
                placeholder="Misal: Humas KPU Jateng, Sekretariat"
                value={form.sumber} 
                onChange={e => setForm({...form, sumber: e.target.value})} 
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition" 
              />
            </div>
          </div>

          {/* Upload Image Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
              Unggah Gambar Cover
            </label>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {!form.gambarUrl ? (
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition select-none ${
                  dragActive 
                    ? "border-red-800 bg-red-50/20 dark:bg-red-950/10" 
                    : "border-zinc-200 dark:border-zinc-800 hover:border-red-800/60 hover:bg-zinc-50/50 dark:hover:bg-zinc-850/10"
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-150 dark:border-zinc-800 flex items-center justify-center text-zinc-450">
                  <Upload size={22} />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Klik untuk pilih gambar atau seret kemari
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    PNG, JPG, JPEG (Maks. 5MB)
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 flex items-center gap-4">
                <div className="w-24 h-16 rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                  <img src={form.gambarUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <ImageIcon size={12} className="text-green-600" />
                    Gambar terunggah berhasil
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">Sistem otomatis mengonversi ke format internal database</p>
                </div>
                <button 
                  type="button" 
                  onClick={removeImage}
                  className="p-2 bg-zinc-100 hover:bg-red-50 text-zinc-500 hover:text-red-750 dark:bg-zinc-800 dark:hover:bg-red-950/20 rounded-xl transition flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Ringkasan */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
              Ringkasan Singkat
            </label>
            <textarea 
              rows={2}
              placeholder="Berikan ringkasan berita satu atau dua kalimat..."
              value={form.ringkasan} 
              onChange={e => setForm({...form, ringkasan: e.target.value})} 
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition" 
            />
          </div>

          {/* Konten */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
              Konten Berita Lengkap <span className="text-red-650">*</span>
            </label>
            <textarea 
              required
              rows={12}
              placeholder="Tulis seluruh narasi artikel berita disini secara lengkap..."
              value={form.konten} 
              onChange={e => setForm({...form, konten: e.target.value})} 
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition font-sans" 
            />
          </div>

          {/* Published Toggle */}
          <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 p-4 rounded-xl">
            <input 
              type="checkbox" 
              id="published"
              checked={form.published}
              onChange={e => setForm({...form, published: e.target.checked})}
              className="w-4 h-4 rounded text-red-800 border-zinc-300 focus:ring-red-800/30"
            />
            <div className="leading-tight">
              <label htmlFor="published" className="text-xs font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer select-none">
                Langsung Terbitkan ke Portal Publik
              </label>
              <p className="text-[10px] text-zinc-400">Jika dicentang, berita akan langsung dapat dibaca oleh masyarakat di landing page.</p>
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
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
            <Link 
              href="/cms/berita" 
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
