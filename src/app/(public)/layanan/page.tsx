import { prisma } from "@/lib/prisma"
import { ShieldCheck, ClipboardList, Clock, ArrowRight, Phone, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Informasi Layanan Publik",
  description: "Layanan informasi publik KPU Provinsi Jawa Tengah",
}

export default async function LayananPage() {
  const layanan = await prisma.informasiLayanan.findMany({
    where: { aktif: true },
    orderBy: { urutan: "asc" },
  })

  return (
    <div className="bg-surface-container-lowest min-h-screen">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-red-800 to-red-950 text-white py-20 px-6 overflow-hidden">
        
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="relative max-w-5xl mx-auto z-10 flex flex-col items-center text-center mt-6">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-white/20">
            <ShieldCheck size={32} className="text-red-100" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-red-100">
            Informasi Layanan Publik
          </h1>
          <p className="text-red-100/90 text-lg md:text-xl max-w-2xl font-medium">
            Komisi Pemilihan Umum Provinsi Jawa Tengah berkomitmen memberikan layanan informasi yang transparan dan mudah diakses.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 -mt-12 relative z-20">
        {layanan.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-xl border border-zinc-200">
            <ClipboardList className="mx-auto h-16 w-16 text-zinc-300 mb-4" />
            <h3 className="text-xl font-bold text-zinc-900">Belum Ada Layanan</h3>
            <p className="text-zinc-500 mt-2">Data informasi layanan KPU saat ini belum tersedia.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {layanan.map((item, index) => {
              const alur = (() => {
                try { return JSON.parse(item.alurPelayanan) } catch { return [item.alurPelayanan] }
              })()

              return (
                <div key={item.id} className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow duration-300 relative overflow-hidden group">
                  {/* Decorative Number */}
                  <div className="absolute -right-6 -top-10 text-[150px] font-black text-zinc-50/50 select-none group-hover:text-red-50/50 transition-colors duration-500 z-0">
                    {index + 1}
                  </div>
                  
                  <div className="relative z-10">
                    <h2 className="text-2xl font-extrabold text-zinc-900 mb-6 flex items-center gap-3">
                      <div className="w-2 h-8 bg-red-700 rounded-full"></div>
                      {item.namaLayanan}
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8 text-sm">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-red-800 font-bold uppercase tracking-wider text-xs">
                          <ClipboardList size={16} />
                          Persyaratan
                        </div>
                        <p className="text-zinc-600 leading-relaxed font-medium bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                          {item.persyaratan}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-red-800 font-bold uppercase tracking-wider text-xs">
                          <Clock size={16} />
                          Jam Pelayanan
                        </div>
                        <p className="text-zinc-600 leading-relaxed font-medium bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                          {item.jamPelayanan}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-red-800 font-bold uppercase tracking-wider text-xs">
                          <ArrowRight size={16} />
                          Alur Pelayanan
                        </div>
                        <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                          <ol className="relative border-l border-zinc-200 space-y-4 ml-2 mt-1">
                            {Array.isArray(alur) ? (
                              alur.map((a: string, i: number) => (
                                <li key={i} className="pl-5 relative">
                                  <div className="absolute w-2.5 h-2.5 bg-red-700 rounded-full -left-[5px] top-1.5 border-2 border-white"></div>
                                  <span className="text-zinc-600 font-medium leading-tight">{a}</span>
                                </li>
                              ))
                            ) : (
                              <li className="pl-5 relative">
                                <div className="absolute w-2.5 h-2.5 bg-red-700 rounded-full -left-[5px] top-1.5 border-2 border-white"></div>
                                <span className="text-zinc-600 font-medium leading-tight">{alur}</span>
                              </li>
                            )}
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        
        {/* Help Contact Banner */}
        <div className="mt-12 bg-zinc-900 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/40 to-transparent"></div>
          <div className="relative z-10 mb-6 md:mb-0 text-center md:text-left">
            <h3 className="text-xl font-bold text-white mb-2">Butuh Bantuan Lebih Lanjut?</h3>
            <p className="text-zinc-400 text-sm">Tim kami siap membantu Anda dengan informasi tambahan.</p>
          </div>
          <Link href="/kontak" className="relative z-10 bg-white hover:bg-zinc-100 text-zinc-900 px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
            <Phone size={16} />
            Hubungi KPU Jateng
          </Link>
        </div>
      </div>
    </div>
  )
}
