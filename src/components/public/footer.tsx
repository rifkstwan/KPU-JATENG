import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-zinc-950 text-zinc-100 py-16 px-8 mt-20 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16">
        
        {/* Column 1: Brand & Description (Takes up 4 cols on desktop) */}
        <div className="md:col-span-4 space-y-6">
          {/* Logo Section */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-10 h-10 flex-shrink-0">
               <Image src="/logo-kpu.png" alt="Logo KPU" fill className="object-contain" />
            </div>
            <div className="relative w-8 h-10 flex-shrink-0">
               <Image src="/logo-jateng.svg" alt="Logo Jawa Tengah" fill className="object-contain" />
            </div>
            <div className="pl-3 border-l border-zinc-800">
              <p className="font-bold text-sm uppercase text-white tracking-tight leading-tight">KPU Provinsi Jawa Tengah</p>
              <p className="text-xs text-zinc-400 font-medium">Komisi Pemilihan Umum</p>
            </div>
          </div>
          
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed pr-4">
            Lembaga penyelenggara pemilihan umum di Provinsi Jawa Tengah yang independen, transparan, dan berintegritas demi mewujudkan demokrasi yang berkualitas.
          </p>
          
          {/* Social Icons */}
          <div className="flex flex-wrap gap-4 pt-2 text-zinc-400">
            <Link href="https://www.facebook.com/KPU.JATENGPROV" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Facebook">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </Link>
            <Link href="https://x.com/KPU_Jateng" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="X">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l11.733 16h4.267l-11.733 -16z"/>
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>
              </svg>
            </Link>
            <Link href="https://www.instagram.com/kpujateng/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </Link>
            <Link href="https://www.tiktok.com/@kpujateng" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="TikTok">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
              </svg>
            </Link>
            <Link href="https://www.youtube.com/@kpujateng1655" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" aria-label="YouTube">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/>
                <polygon points="10 15 15 12 10 9"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Column 2: Profil (Takes up 2 cols) */}
        <div className="md:col-span-2">
          <h3 className="font-bold text-white text-base mb-6">Profil</h3>
          <ul className="space-y-4 text-zinc-400 text-sm">
            <li><Link href="#" className="hover:text-white transition-colors">Visi Misi</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Struktur Organisasi</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Tugas & Wewenang</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Sejarah</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Hubungi Kami</Link></li>
          </ul>
        </div>

        {/* Column 3: Informasi (Takes up 2 cols) */}
        <div className="md:col-span-2">
          <h3 className="font-bold text-white text-base mb-6">Informasi</h3>
          <ul className="space-y-4 text-zinc-400 text-sm">
            <li><Link href="#" className="hover:text-white transition-colors">Berita Terkini</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Pengumuman</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Produk Hukum</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">PPID</Link></li>
          </ul>
        </div>

        {/* Column 4: Newsletter (Takes up 4 cols) */}
        <div className="md:col-span-4">
          <h3 className="font-bold text-white text-base mb-6">Newsletter</h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            Dapatkan tips, pembaruan informasi, dan wawasan mengenai penyelenggaraan pemilu langsung di kotak masuk Anda.
          </p>
          
          <div className="relative flex items-center bg-zinc-900 rounded-full p-1.5 shadow-sm border border-zinc-800">
            <input 
              type="email" 
              placeholder="Email address" 
              className="bg-transparent border-none outline-none px-4 py-2 w-full text-sm text-zinc-100 placeholder-zinc-500"
            />
            <button className="bg-[#ff5a1f] hover:bg-[#e04a15] text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors flex-shrink-0">
              Subscribe <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        
      </div>
    </footer>
  )
}
