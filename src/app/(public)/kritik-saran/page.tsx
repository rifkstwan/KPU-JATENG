"use client"

import { useState } from "react"
import Link from "next/link"
import { MessageSquare, User, Mail, Send, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react"

export default function KritikSaranPage() {
  const [form, setForm] = useState({ nama: "", kontak: "", isi: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/public/kritik-saran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error("Gagal mengirim")

      setSuccess(true)
      setForm({ nama: "", kontak: "", isi: "" })
    } catch {
      setError("Gagal mengirim masukan Anda. Silakan coba lagi nanti.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface-container-lowest min-h-screen">
      {/* Hero Header */}
      <div className="relative bg-zinc-900 text-white py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/40 to-transparent"></div>
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
        <div className="relative max-w-5xl mx-auto z-10 flex flex-col items-center text-center mt-6">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-white/10">
            <MessageSquare size={32} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Kritik & Saran
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl font-medium">
            Partisipasi Anda sangat berarti bagi kami. Sampaikan masukan, kritik, maupun saran untuk perbaikan layanan KPU Provinsi Jawa Tengah.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 -mt-12 relative z-20">
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-zinc-100">
          
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-500">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 border-8 border-green-500/10">
                <CheckCircle2 size={48} className="text-green-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-zinc-900 mb-3">Terima Kasih!</h2>
              <p className="text-zinc-500 text-lg max-w-md mb-8 leading-relaxed">
                Kritik dan saran Anda telah kami terima dan akan segera ditindaklanjuti oleh tim KPU Jawa Tengah.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold px-6 py-3 rounded-xl transition-colors duration-200"
              >
                Kirim Masukan Lain
              </button>
            </div>
          ) : (
            <>
              <div className="mb-10 text-center md:text-left">
                <h2 className="text-2xl font-bold text-zinc-900 mb-2">Form Pengaduan Publik</h2>
                <p className="text-sm text-zinc-500">
                  Data diri Anda akan dijaga kerahasiaannya. Tanda <span className="text-red-500">*</span> wajib diisi.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Nama */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wide">
                      Nama Lengkap <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        value={form.nama}
                        onChange={(e) => setForm({ ...form, nama: e.target.value })}
                        required
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-400 transition-all font-medium text-zinc-900 placeholder:text-zinc-400"
                        placeholder="Contoh: Budi Santoso"
                      />
                    </div>
                  </div>

                  {/* Kontak */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wide">
                      Email / No. WhatsApp <span className="text-zinc-400 font-normal lowercase tracking-normal">(opsional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input
                        type="text"
                        value={form.kontak}
                        onChange={(e) => setForm({ ...form, kontak: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-400 transition-all font-medium text-zinc-900 placeholder:text-zinc-400"
                        placeholder="Untuk balasan dari kami"
                      />
                    </div>
                  </div>
                </div>

                {/* Isi */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wide">
                    Isi Pesan / Pengaduan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.isi}
                    onChange={(e) => setForm({ ...form, isi: e.target.value })}
                    required
                    rows={6}
                    className="w-full px-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-700/20 focus:border-red-400 transition-all font-medium text-zinc-900 placeholder:text-zinc-400 resize-none leading-relaxed"
                    placeholder="Sampaikan kritik, saran, atau aduan Anda secara rinci di sini..."
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 text-sm font-medium px-4 py-3 rounded-xl animate-in fade-in">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-zinc-100">
                  <button
                    type="submit"
                    disabled={loading || !form.nama || !form.isi}
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:shadow-none hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {loading ? (
                      "Mengirim Pesan..."
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Kirim Masukan Sekarang</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
