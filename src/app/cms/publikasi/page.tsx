"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Edit2, Trash2, Video, RefreshCw, FileText, CheckCircle, AlertCircle, Calendar, ExternalLink } from "lucide-react"

type Publikasi = {
  id: string
  judul: string
  url: string
  tanggal: string | null
  published: boolean
  createdAt: string
}

export default function CMSPublikasiPage() {
  const [data, setData] = useState<Publikasi[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch("/api/cms/publikasi")
      if (res.ok) {
        setData(await res.json())
      }
    } catch (error) {
      console.error("Gagal memuat publikasi:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm("Hapus publikasi ini secara permanen?")) return
    try {
      const res = await fetch(`/api/cms/publikasi/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  async function handleToggle(id: string, published: boolean) {
    try {
      const res = await fetch(`/api/cms/publikasi/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !published })
      })
      if (res.ok) {
        fetchData()
      }
    } catch (err) {
      console.error(err)
    }
  }

  function extractYoutubeId(url: string) {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)
    return match ? match[1] : null
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Kelola Publikasi & Video</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Publikasikan video sosialisasi pemilu, tutorial pemilih, dan dokumentasi visual kegiatan KPU Jawa Tengah.
          </p>
        </div>
        <Link 
          href="/cms/publikasi/create" 
          className="inline-flex items-center gap-2 bg-red-800 hover:bg-red-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-red-900/20 active:scale-95 duration-150"
        >
          <Plus size={16} />
          <span>Tambah Publikasi</span>
        </Link>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-850/50 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                <th className="px-6 py-4 w-12 text-center">No</th>
                <th className="px-6 py-4 w-32">Thumbnail</th>
                <th className="px-6 py-4">Judul Publikasi</th>
                <th className="px-6 py-4">Link Video (YouTube)</th>
                <th className="px-6 py-4 w-32 text-center">Status</th>
                <th className="px-6 py-4 w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-zinc-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <RefreshCw size={24} className="animate-spin text-red-800" />
                      <span className="font-semibold text-zinc-500">Memuat data publikasi...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-zinc-400">
                    <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-550">
                        <FileText size={22} />
                      </div>
                      <p className="font-bold text-zinc-700 dark:text-zinc-300">Belum ada publikasi video</p>
                      <p className="text-zinc-550 text-xs">
                        Mulai tambahkan video edukasi pemilih pertama Anda untuk disebarkan ke publik melalui halaman utama portal.
                      </p>
                      <Link 
                        href="/cms/publikasi/create" 
                        className="mt-2 text-xs font-bold text-red-800 hover:text-red-900 transition flex items-center gap-1"
                      >
                        Tambah publikasi sekarang &rarr;
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => {
                  const videoId = extractYoutubeId(item.url)
                  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null

                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/20 transition duration-150 group"
                    >
                      <td className="px-6 py-4 text-center font-semibold text-zinc-400">{index + 1}</td>
                      <td className="px-6 py-4">
                        {thumbnailUrl ? (
                          <div className="w-20 aspect-video rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm relative group-hover:scale-105 transition duration-200">
                            <img 
                              src={thumbnailUrl} 
                              alt="Thumbnail" 
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                              <Video className="text-white drop-shadow-md" size={16} />
                            </div>
                          </div>
                        ) : (
                          <div className="w-20 aspect-video rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[9px] font-bold text-zinc-450 select-none">
                            No Video
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-xs md:max-w-md">
                        <div className="space-y-1">
                          <span className="font-bold text-zinc-850 dark:text-zinc-100 group-hover:text-red-850 dark:group-hover:text-red-400 transition truncate block" title={item.judul}>
                            {item.judul}
                          </span>
                          {item.tanggal && (
                            <div className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
                              <Calendar size={10} />
                              <span>{item.tanggal}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 font-semibold text-red-800 hover:text-red-900 hover:underline max-w-[220px] truncate"
                        >
                          <span className="truncate">{item.url}</span>
                          <ExternalLink size={10} className="flex-shrink-0" />
                        </a>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleToggle(item.id, item.published)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold transition duration-150 hover:opacity-90 active:scale-95 ${
                            item.published 
                              ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400" 
                              : "bg-zinc-100 text-zinc-550 dark:bg-zinc-800 dark:text-zinc-400"
                          }`}
                        >
                          {item.published ? (
                            <>
                              <CheckCircle size={10} />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle size={10} />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <Link 
                            href={`/cms/publikasi/edit/${item.id}`} 
                            className="p-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:text-red-850 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition duration-150"
                            title="Edit Publikasi"
                          >
                            <Edit2 size={13} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-2 bg-zinc-50 dark:bg-zinc-850 text-zinc-500 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition duration-150"
                            title="Hapus Publikasi"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
