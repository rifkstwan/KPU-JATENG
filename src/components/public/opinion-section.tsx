"use client"

import { useState } from "react"
import { Quote } from "lucide-react"

export function OpinionSection() {
  const [activeIndex, setActiveIndex] = useState(2) // Default to middle (index 2 out of 5)

  const opinions = [
    {
      name: "Manja Lestari Damanik",
      title: "Ketua Div. Perencanaan, Data & Informasi",
      articleTitle: "Perempuan dalam Lingkar Demokrasi",
      desc: "Representasi perempuan dalam aktifitas publik tercermin melalui keikutsertaan perempuan dalam pelbagai aktifitas di luar rumah. Budaya patriarki yang dianut sebagian besar masyarakat Indonesia menempatkan perempuan hanya sebatas pada aktifitas domestik dalam rumah...",
      avatar: "/opini-1.jpg",
    },
    {
      name: "Wahyu Joko Prasetyo",
      title: "Kasubbag PARMAS & SDM KPU Banjarnegara",
      articleTitle: "Menyiapkan Kandidat Badan Adhoc yang Berintegritas, Kompeten, dan Bertanggung Jawab",
      desc: "Pelaksanaan Pemilu Tahun 2024 di Kabupaten Banjarnegara memberikan pengalaman yang cukup menguras energi, terutama dalam proses seleksi dan penetapan badan adhoc. Setiap tahapan membutuhkan persiapan matang, koordinasi yang baik, serta ketelitian...",
      avatar: "/opini-2.jpeg",
    },
    {
      name: "Ahmad Mustakim",
      title: "Anggota Divisi Sosdiklih Parmas & SDM",
      articleTitle: "Lentera Sosialisasi: Merawat Kesadaran Politik Masyarakat",
      desc: "Di tengah dinamika demokrasi lokal yang terus bergerak, kehumasan bukan lagi sekadar fungsi pelengkap dalam tubuh penyelenggara pemilu. Ia telah bertransformasi menjadi denyut nadi komunikasi publik, ruang dimana kepercayaan dan partisipasi dirawat...",
      avatar: "/opini-3.jpg",
    },
    {
      name: "Ida Susanti",
      title: "Ketua Div. Teknis Penyelenggaraan Pemilu KPU Batang",
      articleTitle: "Jejak Pilkada dari Tanah Roban Batang: Satu Suara Sangat Penting",
      desc: "Pemungutan suara dalam Pemilihan Bupati dan Wakil Bupati Batang bukan sekadar tahapan teknis, melainkan puncak dari seluruh rangkaian proses demokrasi. Momen puncak pemungutan suara menjadi ruang di mana harapan dan kepercayaan masyarakat bertemu...",
      avatar: "/opini-4.jpg",
    },
    {
      name: "Rofingatun Khasanah",
      title: "Ketua KPU Kabupaten Banyumas",
      articleTitle: "Pendidikan Pemilih Berbasis Integritas: Strategi Preventif Menggerus Vote Buying",
      desc: "Dinamika demokrasi elektoral di Indonesia senantiasa diuji oleh tantangan multidimensi, salah satunya yang paling mengkhawatirkan adalah persistennya praktik transaksi politik atau vote buying yang mengaburkan esensi kedaulatan rakyat...",
      avatar: "/opini-5.jpg",
    }
  ]

  // 5 positions mapping along the quadratic curve
  const positions = [
    { left: 120, top: 40 },
    { left: 82.5, top: 120 },
    { left: 70, top: 200 },
    { left: 82.5, top: 280 },
    { left: 120, top: 360 }
  ]

  return (
    <section className="mb-16 mt-4 md:mt-8 max-w-7xl mx-auto w-full">
      {/* Heading Section */}
      <div className="flex flex-col items-center text-center mb-16 px-4">
        <span className="text-golden-energy text-sm md:text-base font-bold mb-3 uppercase tracking-widest">
          Suara Publik
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.1] text-zinc-900 dark:text-white tracking-tight mb-4">
          Opini Publik
        </h2>
        <p className="text-base md:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium max-w-2xl">
          Berbagai pandangan, masukan, dan harapan dari para penulis, tokoh masyarakat, serta pengamat mengenai pemilihan umum di Provinsi Jawa Tengah.
        </p>
      </div>

      {/* Interactive Testimonial Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-10 lg:gap-20 px-4 max-w-5xl mx-auto">
        
        {/* Left Side: Avatar Curve Selector */}
        <div className="relative w-full md:w-[350px] h-auto md:h-[400px] flex-shrink-0 mx-auto md:mx-0 py-8 md:py-0">
          {/* Subtle Curve SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" viewBox="0 0 350 400" preserveAspectRatio="none">
            <path d="M 120 40 Q 20 200 120 360" fill="none" stroke="#cbd5e1" strokeWidth="1.5" className="dark:stroke-zinc-700" />
          </svg>

          {/* Avatars */}
          {opinions.map((op, idx) => {
            const pos = positions[idx]
            const isActive = activeIndex === idx

            return (
              <div 
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`absolute cursor-pointer transition-all duration-500 z-10 flex items-center ${isActive ? 'scale-110' : 'hover:scale-105'}`}
                style={{ 
                  top: pos.top, 
                  left: pos.left, 
                  transform: 'translate(-50%, -50%)' 
                }}
              >
                {/* Avatar */}
                <div className={`rounded-full overflow-hidden border-2 transition-all duration-300 flex-shrink-0 bg-surface dark:bg-surface-container-high ${isActive ? 'border-primary shadow-lg w-16 h-16' : 'border-zinc-300 dark:border-zinc-700 w-12 h-12'}`}>
                   <img 
                     src={op.avatar} 
                     alt={op.name} 
                     className={`w-full h-full object-cover transition-all duration-300 ${isActive ? 'opacity-100 grayscale-0' : 'opacity-60 grayscale'}`} 
                   />
                </div>
                
                {/* Text Block */}
                <div className={`ml-4 absolute left-[100%] top-1/2 -translate-y-1/2 w-max max-w-[200px] transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                  <h4 className={`font-bold transition-colors line-clamp-1 ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'} text-sm md:text-base`}>
                    {op.name}
                  </h4>
                  {isActive && (
                    <p className="text-xs text-primary font-medium mt-0.5 line-clamp-2 leading-tight">{op.title}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Right Side: Quote Text */}
        <div className="w-full md:w-1/2 relative mt-6 md:mt-0 flex flex-col justify-center min-h-[200px]">
          <div className="absolute -top-8 -left-2 md:-left-8 text-zinc-200 dark:text-zinc-800 pointer-events-none">
             <span className="text-[120px] leading-none font-serif">“</span>
          </div>
          <div className="relative z-10 pl-6 md:pl-8">
            <h3 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white mb-4 leading-snug">
              {opinions[activeIndex].articleTitle}
            </h3>
            <p className="text-base md:text-lg text-zinc-700 dark:text-zinc-300 font-serif italic leading-relaxed text-justify">
              {opinions[activeIndex].desc}
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
