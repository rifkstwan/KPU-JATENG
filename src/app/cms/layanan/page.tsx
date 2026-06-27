"use client"

import { useEffect, useState } from "react"
import { Plus, Edit2, Trash2, RefreshCw, FileText, CheckCircle, AlertCircle, X, Layers, Settings, ChevronRight, HelpCircle } from "lucide-react"

type Layanan = {
  id: string
  namaLayanan: string
  persyaratan: string
  jamPelayanan: string
  alurPelayanan: string
  urutan: number
  aktif: boolean
}

const emptyForm = { namaLayanan: "", persyaratan: "", jamPelayanan: "", alurPelayanan: "", urutan: 0, aktif: true }

export default function CMSLayananPage() {
  const [data, setData] = useState<Layanan[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  async function fetchData() {
    setFetching(true)
    try {
      const res = await fetch("/api/cms/layanan")
      if (res.ok) {
        setData(await res.json())
      }
    } catch (error) {
      console.error("Gagal memuat layanan:", error)
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (editId) {
        await fetch(`/api/cms/layanan/${editId}`, { 
          method: "PUT", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(form) 
        })
      } else {
        await fetch("/api/cms/layanan", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify(form) 
        })
      }
      setForm(emptyForm)
      setEditId(null)
      setShowForm(false)
      fetchData()
    } catch (error) {
      console.error(error)
      alert("Terjadi kesalahan menyimpan layanan.")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus layanan ini secara permanen?")) return
    try {
      const res = await fetch(`/api/cms/layanan/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleToggle(id: string, aktif: boolean) {
    try {
      const res = await fetch(`/api/cms/layanan/${id}`, { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ aktif: !aktif }) 
      })
      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  function handleEdit(item: Layanan) {
    setForm({ 
      namaLayanan: item.namaLayanan, 
      persyaratan: item.persyaratan, 
      jamPelayanan: item.jamPelayanan, 
      alurPelayanan: item.alurPelayanan, 
      urutan: item.urutan, 
      aktif: item.aktif 
    })
    setEditId(item.id)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Kelola Layanan</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Publikasikan persyaratan, alur, dan jam operasional untuk layanan publik KPU Jawa Tengah.
          </p>
        </div>
        <button 
          onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm) }}
          className="inline-flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-red-900/20 active:scale-95 duration-150"
        >
          <Plus size={16} />
          <span>Tambah Layanan</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-850/50 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="px-6 py-4 w-12 text-center">No</th>
                <th className="px-6 py-4">Nama Layanan</th>
                <th className="px-6 py-4">Jam Pelayanan</th>
                <th className="px-6 py-4 w-24 text-center">Urutan</th>
                <th className="px-6 py-4 w-32 text-center">Status</th>
                <th className="px-6 py-4 w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800 text-xs">
              {fetching ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-zinc-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw size={24} className="animate-spin text-red-800" />
                      <span className="font-semibold text-zinc-500">Memuat data layanan...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-zinc-400">
                    <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-550">
                        <Layers size={22} />
                      </div>
                      <p className="font-bold text-zinc-700 dark:text-zinc-300">Belum ada data layanan</p>
                      <p className="text-zinc-555 text-xs text-center">
                        Mulai daftarkan layanan publik pertama Anda agar dapat diakses oleh masyarakat melalui portal.
                      </p>
                      <button 
                        onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm) }}
                        className="mt-2 text-xs font-bold text-red-800 hover:text-red-900 transition flex items-center gap-1"
                      >
                        Tambah layanan sekarang &rarr;
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/20 transition duration-150 group"
                  >
                    <td className="px-6 py-4 text-center font-semibold text-zinc-400">{index + 1}</td>
                    <td className="px-6 py-4 max-w-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-zinc-850 dark:text-zinc-100 group-hover:text-red-850 dark:group-hover:text-red-400 transition truncate block" title={item.namaLayanan}>
                          {item.namaLayanan}
                        </span>
                        <p className="text-zinc-400 text-[10px] truncate leading-relaxed">
                          P: {item.persyaratan}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-650 dark:text-zinc-300 font-semibold">{item.jamPelayanan}</td>
                    <td className="px-6 py-4 text-center text-zinc-400 font-bold">{item.urutan}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggle(item.id, item.aktif)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold transition duration-150 hover:opacity-90 active:scale-95 ${
                          item.aktif 
                            ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400" 
                            : "bg-zinc-100 text-zinc-550 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {item.aktif ? (
                          <>
                            <CheckCircle size={10} />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={10} />
                            <span>Nonaktif</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:text-red-850 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition duration-150"
                          title="Edit Layanan"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-zinc-50 dark:bg-zinc-850 text-zinc-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition duration-150"
                          title="Hapus Layanan"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Redesigned Modal Form Container */}
      {showForm && (
        <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-150 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/50">
              <div>
                <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  {editId ? "Edit Layanan Publik" : "Tambah Layanan Baru"}
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Konfigurasi parameter dan panduan akses layanan publik KPU.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-850 dark:hover:text-zinc-300 transition duration-100"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* Nama Layanan */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
                  Nama Layanan <span className="text-red-650">*</span>
                </label>
                <input 
                  required 
                  type="text"
                  placeholder="Contoh: Layanan PPID (Informasi Publik)"
                  value={form.namaLayanan} 
                  onChange={e => setForm({ ...form, namaLayanan: e.target.value })} 
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition" 
                />
              </div>

              {/* Jam Pelayanan */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
                  Jam Pelayanan <span className="text-red-650">*</span>
                </label>
                <input 
                  required 
                  type="text"
                  placeholder="Contoh: Senin - Jumat, 08.00 - 16.00 WIB"
                  value={form.jamPelayanan} 
                  onChange={e => setForm({ ...form, jamPelayanan: e.target.value })} 
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition" 
                />
              </div>

              {/* Urutan */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
                  Urutan Tampilan
                </label>
                <input 
                  type="number"
                  placeholder="Misal: 1, 2, atau 3"
                  value={form.urutan} 
                  onChange={e => setForm({ ...form, urutan: Number(e.target.value) })} 
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition" 
                />
              </div>

              {/* Persyaratan */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
                  Persyaratan Layanan <span className="text-red-650">*</span>
                </label>
                <textarea 
                  required 
                  rows={3}
                  placeholder="Isi persyaratan dokumen yang harus dipersiapkan pemohon..."
                  value={form.persyaratan} 
                  onChange={e => setForm({ ...form, persyaratan: e.target.value })} 
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition" 
                />
              </div>

              {/* Alur Pelayanan */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-450">
                  Alur Pelayanan <span className="text-red-650">*</span>
                </label>
                <textarea 
                  required 
                  rows={4}
                  placeholder="Tulis urutan langkah-langkah alur pelayanan (dapat dipisahkan dengan enter atau baris baru)..."
                  value={form.alurPelayanan} 
                  onChange={e => setForm({ ...form, alurPelayanan: e.target.value })} 
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-800 dark:focus:border-red-800/50 text-zinc-700 dark:text-zinc-200 transition" 
                />
              </div>

              {/* Status Aktif */}
              <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 p-3.5 rounded-xl">
                <input 
                  type="checkbox" 
                  id="aktif"
                  checked={form.aktif}
                  onChange={e => setForm({...form, aktif: e.target.checked})}
                  className="w-4 h-4 rounded text-red-800 border-zinc-300 focus:ring-red-800/30"
                />
                <div className="leading-tight">
                  <label htmlFor="aktif" className="text-xs font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer select-none">
                    Layanan Ini Aktif
                  </label>
                  <p className="text-[10px] text-zinc-400">Jika tidak dicentang, layanan tidak akan tampil di portal publik.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex gap-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-red-800 hover:bg-red-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-red-900/10 disabled:opacity-50 active:scale-95 duration-100"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} />
                      <span>Simpan Layanan</span>
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-zinc-250 dark:border-zinc-800 text-zinc-650 hover:bg-zinc-50 dark:hover:bg-zinc-850 py-2.5 rounded-xl text-xs font-bold transition"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
