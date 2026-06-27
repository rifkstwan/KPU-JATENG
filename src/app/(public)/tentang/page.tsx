import { prisma } from "@/lib/prisma"
import { Building2, Target, Flag, MapPin, Phone, Mail, ArrowLeft } from "lucide-react"
import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Tentang KPU",
  description: "Profil, Visi, dan Misi KPU Provinsi Jawa Tengah",
}

export default async function TentangPage() {
  const data = await prisma.tentangKPU.findFirst({
    where: { id: "singleton" },
  })

  const misi = (() => {
    try { return JSON.parse(data?.misi ?? "[]") } catch { return [] }
  })()

  return (
    <div className="bg-surface-container-lowest min-h-screen pb-20">
      {/* Hero Header */}
      <div className="relative bg-zinc-900 text-white py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/bg-kpu.jpg')] bg-cover bg-center opacity-20 grayscale"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-red-900/40"></div>
        <div className="relative max-w-5xl mx-auto z-10 flex flex-col items-center text-center mt-6">
          <div className="w-16 h-16 bg-red-700 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-900/50">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Tentang KPU Jateng
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl font-medium">
            Mengenal lebih dekat Komisi Pemilihan Umum Provinsi Jawa Tengah: Profil, Visi, Misi, dan Informasi Kontak.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 -mt-12 relative z-20">
        {!data ? (
          <div className="bg-white rounded-[2rem] p-16 text-center shadow-xl border border-zinc-200">
            <Building2 className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
            <h3 className="text-xl font-bold text-zinc-900">Data Belum Tersedia</h3>
            <p className="text-zinc-500 mt-2">Informasi profil lembaga saat ini sedang dalam proses pembaruan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Profil, Visi, Misi */}
            <div className="lg:col-span-7 space-y-8">
              {/* Profil */}
              <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-red-50 rounded-xl text-red-700">
                    <Building2 size={24} />
                  </div>
                  <h2 className="text-2xl font-extrabold text-zinc-900">Profil Lembaga</h2>
                </div>
                <div className="prose prose-zinc prose-p:leading-relaxed prose-p:text-zinc-600 max-w-none">
                  {data.profil.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Visi */}
              <div className="bg-gradient-to-br from-red-800 to-red-950 rounded-3xl p-8 md:p-12 shadow-xl border border-red-900 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Target size={120} className="text-white" />
                </div>
                <div className="relative z-10 text-center">
                  <h2 className="text-sm font-bold text-red-200 uppercase tracking-widest mb-4">Visi</h2>
                  <p className="text-2xl md:text-3xl font-extrabold text-white leading-tight italic">
                    "{data.visi}"
                  </p>
                </div>
              </div>

              {/* Misi */}
              <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-red-50 rounded-xl text-red-700">
                    <Flag size={24} />
                  </div>
                  <h2 className="text-2xl font-extrabold text-zinc-900">Misi KPU</h2>
                </div>
                <div className="grid gap-4">
                  {misi.map((m: string, i: number) => (
                    <div key={i} className="flex gap-4 p-5 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-red-200 transition-colors group">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-800 font-black text-sm group-hover:bg-red-700 group-hover:text-white transition-colors">
                        {i + 1}
                      </div>
                      <p className="text-zinc-700 font-medium leading-relaxed pt-1">
                        {m}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Kontak & Peta */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 overflow-hidden sticky top-24">
                <div className="p-6 bg-zinc-900 text-white">
                  <h2 className="text-lg font-bold">Informasi Kontak</h2>
                  <p className="text-zinc-400 text-sm mt-1">Hubungi kami melalui kanal resmi</p>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Alamat */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-700 mt-1">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Alamat Kantor</p>
                      <p className="text-zinc-800 font-medium text-sm leading-relaxed">
                        {data.alamat}
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-px bg-zinc-100"></div>

                  {/* Telepon */}
                  {data.telepon && (
                    <>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-700 mt-1">
                          <Phone size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Telepon</p>
                          <p className="text-zinc-800 font-bold text-sm">
                            {data.telepon}
                          </p>
                        </div>
                      </div>
                      <div className="w-full h-px bg-zinc-100"></div>
                    </>
                  )}

                  {/* Email */}
                  {data.email && (
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-700 mt-1">
                        <Mail size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Email Resmi</p>
                        <p className="text-zinc-800 font-bold text-sm break-all">
                          {data.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Google Maps Embed */}
                  <div className="mt-8 pt-6 border-t border-zinc-100">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Peta Lokasi</p>
                    <div className="w-full h-80 bg-zinc-100 rounded-2xl overflow-hidden relative group ring-4 ring-red-50">
                      <iframe
                        src={data.mapEmbedUrl || "https://maps.google.com/maps?q=KPU%20Provinsi%20Jawa%20Tengah&t=&z=15&ie=UTF8&iwloc=&output=embed"}
                        className="w-full h-full border-0 grayscale-[40%] contrast-[1.1] group-hover:grayscale-0 transition-all duration-700"
                        loading="lazy"
                        allowFullScreen
                      />
                      {/* Premium Overlay border */}
                      <div className="absolute inset-0 border border-zinc-200 rounded-2xl pointer-events-none"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
