import { prisma } from "@/lib/prisma"
import { Phone, Mail, MapPin, MessageCircle, PhoneCall } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Hubungi Kami",
  description: "Informasi kontak dan alamat KPU Provinsi Jawa Tengah",
}

export default async function KontakPage() {
  const kontak = await prisma.kontakKPU.findMany({
    where: { aktif: true },
    orderBy: { urutan: "asc" },
  })

  const tentang = await prisma.tentangKPU.findFirst({ where: { id: "singleton" } })

  return (
    <div className="bg-surface-container-lowest min-h-screen">
      {/* Hero Header */}
      <div className="relative bg-zinc-900 text-white py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/bg-kpu.jpg')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-950/80 to-transparent"></div>
        <div className="relative max-w-5xl mx-auto z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-700/20 rounded-2xl flex items-center justify-center mb-6 shadow-xl border border-red-500/30">
            <PhoneCall size={32} className="text-red-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Hubungi KPU Jateng
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl max-w-2xl font-medium">
            Layanan pengaduan, informasi publik, dan saluran komunikasi resmi KPU Provinsi Jawa Tengah.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Contact Directory */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-extrabold text-zinc-900 mb-6">Direktori Layanan</h2>
            
            {kontak.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-zinc-100 shadow-sm">
                <p className="text-zinc-500">Belum ada daftar kontak yang ditambahkan.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {kontak.map((item) => (
                  <div key={item.id} className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all hover:-translate-y-1">
                    <h3 className="font-bold text-zinc-900 mb-4 pb-4 border-b border-zinc-100 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-600"></div>
                      {item.label}
                    </h3>
                    
                    <div className="space-y-4">
                      {item.telepon && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-500 shrink-0">
                            <Phone size={14} />
                          </div>
                          <span className="font-medium text-zinc-700">{item.telepon}</span>
                        </div>
                      )}
                      
                      {item.email && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-500 shrink-0">
                            <Mail size={14} />
                          </div>
                          <span className="font-medium text-zinc-700 break-all">{item.email}</span>
                        </div>
                      )}

                      {item.whatsapp && (
                        <a 
                          href={`https://wa.me/${item.whatsapp}`}
                          target="_blank"
                          className="flex items-center gap-3 text-sm group"
                        >
                          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0 group-hover:bg-green-500 group-hover:text-white transition-colors">
                            <MessageCircle size={14} />
                          </div>
                          <span className="font-bold text-green-600 group-hover:underline">Chat WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Office Address Widget */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-extrabold text-zinc-900 mb-6 invisible hidden lg:block">_</h2>
            {tentang && (
              <div className="bg-gradient-to-br from-red-800 to-red-950 rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
                <div className="absolute -right-8 -top-8 text-white/5">
                  <MapPin size={160} />
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
                    <MapPin size={24} className="text-red-200" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Kantor Pusat</h3>
                  <p className="text-red-100/90 text-sm leading-relaxed mb-6">
                    {tentang.alamat}
                  </p>
                  
                  {/* Google Maps Embed */}
                  <div className="w-full h-40 bg-zinc-900 rounded-xl overflow-hidden border border-white/10 group">
                    <iframe
                      src={tentang.mapEmbedUrl || "https://maps.google.com/maps?q=KPU%20Provinsi%20Jawa%20Tengah&t=&z=15&ie=UTF8&iwloc=&output=embed"}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      className="grayscale-[40%] contrast-[1.1] group-hover:grayscale-0 transition-all duration-700"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
