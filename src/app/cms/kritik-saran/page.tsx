"use client"

import { useEffect, useState } from "react"
import { Mail, Trash2, RefreshCw, FileText, CheckCircle, AlertCircle, Calendar, User, MessageSquare, Send, Search, ArrowLeft, Phone } from "lucide-react"

type KritikSaran = {
  id: string
  nama: string
  kontak: string | null
  isi: string
  status: "BELUM_DIBACA" | "SUDAH_DIBACA" | "DIBALAS"
  balasan: string | null
  createdAt: string
}

export default function CMSKritikSaranPage() {
  const [data, setData] = useState<KritikSaran[]>([])
  const [selected, setSelected] = useState<KritikSaran | null>(null)
  const [balasan, setBalasan] = useState("")
  const [filter, setFilter] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  async function fetchData() {
    setFetching(true)
    try {
      const url = filter ? `/api/cms/kritik-saran?status=${filter}` : "/api/cms/kritik-saran"
      const res = await fetch(url)
      if (res.ok) {
        const result = await res.json()
        setData(result)
        // Keep selected item updated with fresh state if any
        if (selected) {
          const updated = result.find((item: KritikSaran) => item.id === selected.id)
          if (updated) setSelected(updated)
        }
      }
    } catch (error) {
      console.error("Gagal memuat kritik saran:", error)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filter])

  async function handleBaca(id: string) {
    try {
      await fetch(`/api/cms/kritik-saran/${id}`, { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ status: "SUDAH_DIBACA" }) 
      })
      // Refresh local copy of item immediately for smooth transitions
      setData(prev => prev.map(item => item.id === id ? { ...item, status: "SUDAH_DIBACA" } : item))
    } catch (err) {
      console.error(err)
    }
  }

  async function handleBalas(id: string) {
    if (!balasan.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/cms/kritik-saran/${id}`, { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ status: "DIBALAS", balasan }) 
      })
      if (res.ok) {
        setBalasan("")
        fetchData()
      }
    } catch (error) {
      console.error(error)
      alert("Terjadi kesalahan sistem saat menyimpan catatan.")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus pesan ini secara permanen?")) return
    try {
      const res = await fetch(`/api/cms/kritik-saran/${id}`, { method: "DELETE" })
      if (res.ok) {
        setSelected(null)
        fetchData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const statusBadge = (s: string) => {
    if (s === "BELUM_DIBACA") {
      return "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50 dark:border-red-900/30"
    }
    if (s === "DIBALAS") {
      return "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200/50 dark:border-green-900/30"
    }
    return "bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/30"
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Inbox Kritik & Saran</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Kelola masukan publik, keluhan, dan kritik saran masyarakat Jawa Tengah untuk pembenahan layanan.
          </p>
        </div>
        <div className="relative">
          <select 
            value={filter} 
            onChange={e => setFilter(e.target.value)} 
            className="w-full sm:w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-400 dark:focus:border-red-800/50 transition-all shadow-sm"
          >
            <option value="">Semua Pesan</option>
            <option value="BELUM_DIBACA">Belum Dibaca</option>
            <option value="SUDAH_DIBACA">Sudah Dibaca</option>
            <option value="DIBALAS">Dibalas (Ada Catatan)</option>
          </select>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Messages List */}
        <div className={`lg:col-span-5 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col h-[650px] ${selected ? "hidden lg:flex" : "flex"}`}>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-950/30 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Kotak Masuk ({data.length})</span>
            <button 
              onClick={fetchData}
              className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition duration-150 active:scale-95"
              title="Refresh"
            >
              <RefreshCw size={14} className={fetching ? "animate-spin text-red-800" : ""} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-150 dark:divide-zinc-800">
            {fetching && data.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-400">
                <RefreshCw size={20} className="animate-spin text-red-800" />
                <span className="text-xs font-semibold">Memuat inbox...</span>
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-zinc-400 gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-550">
                  <Mail size={22} />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-zinc-700 dark:text-zinc-300">Inbox Kosong</p>
                  <p className="text-[10px] text-zinc-500 max-w-[200px]">Tidak ada kritik saran baru yang masuk atau cocok dengan filter.</p>
                </div>
              </div>
            ) : (
              data.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => { 
                    setSelected(item)
                    if (item.status === "BELUM_DIBACA") {
                      handleBaca(item.id)
                    }
                  }} 
                  className={`p-4 cursor-pointer transition select-none flex flex-col gap-2 ${
                    selected?.id === item.id 
                      ? "bg-red-50/20 dark:bg-red-950/10 border-l-4 border-red-800" 
                      : "hover:bg-zinc-50/50 dark:hover:bg-zinc-850/10 border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <p className="font-bold text-zinc-800 dark:text-zinc-200 text-xs md:text-sm truncate">{item.nama}</p>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold flex-shrink-0 ${statusBadge(item.status)}`}>
                      {item.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-zinc-450 dark:text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                    {item.isi}
                  </p>
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 font-semibold mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(item.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Message Detail */}
        <div className={`lg:col-span-7 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col h-[650px] ${!selected ? "hidden lg:flex" : "flex"}`}>
          {selected ? (
            <div className="flex flex-col h-full">
              {/* Back Button (Mobile Only) & Detail Header */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/30 border-b border-zinc-150 dark:border-zinc-800 flex items-center justify-between gap-4">
                <button 
                  onClick={() => setSelected(null)}
                  className="lg:hidden p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl text-zinc-500 transition"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="flex-1 overflow-hidden">
                  <h2 className="font-extrabold text-zinc-850 dark:text-zinc-100 text-sm md:text-base truncate">{selected.nama}</h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-zinc-400 font-semibold mt-0.5">
                    {selected.kontak && (
                      <span className="flex items-center gap-1 text-zinc-550 dark:text-zinc-300">
                        <Phone size={10} />
                        {selected.kontak}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(selected.createdAt).toLocaleString("id-ID", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(selected.id)}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-red-800 hover:text-red-900 border border-red-200/50 hover:bg-red-50/20 px-3 py-1.5 rounded-lg transition"
                >
                  <Trash2 size={12} />
                  <span>Hapus</span>
                </button>
              </div>

              {/* Detail Content Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* User Message */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-450">Pesan Masuk</span>
                  <div className="bg-zinc-50 dark:bg-zinc-950/60 rounded-2xl p-4 border border-zinc-150 dark:border-zinc-800 shadow-sm">
                    <p className="text-xs md:text-sm text-zinc-700 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                      {selected.isi}
                    </p>
                  </div>
                </div>

                {/* Internal Response Note (if exists) */}
                {selected.balasan && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-150">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-450">Catatan Internal / Tindak Lanjut</span>
                    <div className="bg-green-50/30 dark:bg-green-950/10 rounded-2xl p-4 border border-green-200/50 dark:border-green-900/20 shadow-sm flex items-start gap-3">
                      <MessageSquare className="text-green-650 flex-shrink-0 mt-0.5" size={16} />
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-750 dark:text-zinc-200 leading-relaxed font-medium">
                          {selected.balasan}
                        </p>
                        <span className="block text-[9px] text-zinc-400 font-semibold">
                          Disimpan pada status: Dibalas
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reply / Catatan Footer Input */}
              <div className="p-4 border-t border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/20">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
                      Tulis Catatan Respon / Tindak Lanjut
                    </label>
                    <textarea 
                      value={balasan} 
                      onChange={e => setBalasan(e.target.value)} 
                      placeholder="Masukkan catatan respon internal KPU, misalnya: 'Sudah ditindaklanjuti oleh Humas', 'Pesan informasi sudah dibalas via WA'..." 
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition h-20 resize-none font-sans" 
                    />
                  </div>
                  <button 
                    onClick={() => handleBalas(selected.id)} 
                    disabled={loading || !balasan.trim()} 
                    className="w-full inline-flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-red-900/10 disabled:opacity-50 active:scale-95 duration-100"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Simpan Catatan Respon</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-zinc-400 gap-3">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-450">
                <MessageSquare size={22} />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-zinc-700 dark:text-zinc-300">Pilih Pesan</p>
                <p className="text-[10px] text-zinc-500 max-w-[220px]">Pilih salah satu pesan masuk di kolom kiri untuk melihat detail isi pesan dan memberikan respon.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
