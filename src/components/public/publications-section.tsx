import Link from "next/link"
import { PlayCircle } from "lucide-react"
import { prisma } from "@/lib/prisma"

const FALLBACK_VIDEOS = [
  { judul: "Sosialisasi Pemilu 2024 - Part 1", url: "https://youtu.be/v51fvBNW33A?si=RMrm3Yf9pG26--kh" },
  { judul: "Panduan Pemilih Pemula", url: "https://youtu.be/5QHmpEQMHIk?si=x2lG_ID6ydkGt6zv" },
  { judul: "Tutorial Cek DPT Online", url: "https://youtu.be/RB7XTanoSIU?si=B8NHgnje_yZrcLe-" },
  { judul: "Informasi KPPS Pemilu 2024", url: "https://youtu.be/04sYUhm0Irs?si=lgWihwUKSs1jZ4pu" },
]

function extractYoutubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)
  return match ? match[1] : null
}

export async function PublicationsSection() {
  let dbVideos: any[] = []
  try {
    dbVideos = await prisma.publikasi.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      take: 4,
    })
  } catch (error) {
    console.error("Failed to fetch publikasi:", error)
  }

  const videos = dbVideos.length > 0 ? dbVideos : FALLBACK_VIDEOS

  return (
    <section className="bg-surface-container-low dark:bg-surface-container-high rounded-3xl p-6 md:p-10 mb-16 mt-16 md:mt-24">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-16 lg:gap-24 mb-10 px-4">
        {/* Left Column: Heading */}
        <div className="w-full md:w-[55%]">
          <span className="text-golden-energy text-sm md:text-base font-bold mb-3 uppercase tracking-widest block">
            Dokumentasi & Video
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-zinc-900 dark:text-white tracking-tight">
            Publikasi Terkini
          </h2>
        </div>

        {/* Right Column: Description */}
        <div className="w-full md:w-[45%] md:pt-10">
          <p className="text-base md:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
            Saksikan video sosialisasi, dokumentasi kegiatan, dan informasi visual seputar penyelenggaraan pemilu di Provinsi Jawa Tengah.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((vid, idx) => {
          const videoId = extractYoutubeId(vid.url)
          const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "/hero-bg.png"
          
          return (
            <a 
              key={idx} 
              href={vid.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col gap-3"
            >
              {/* Thumbnail Container */}
              <div className="relative rounded-md overflow-hidden bg-zinc-800 aspect-video w-full shadow-md">
                <img 
                  src={thumbnailUrl} 
                  alt={vid.judul} 
                  className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                
                {/* Play Icon Centered */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle className="text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300" size={56} strokeWidth={1.5} />
                </div>
              </div>
              
              {/* Content Below Thumbnail */}
              <div className="flex flex-col gap-1 px-1">
                <h3 className="text-zinc-900 dark:text-white font-bold text-sm md:text-base leading-snug line-clamp-2">
                  {vid.judul}
                </h3>
                <span className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm">
                  {vid.tanggal || "25 Mei 2026"}
                </span>
              </div>
            </a>
          )
        })}
      </div>
      
      <div className="text-center mt-12">
        <Link 
          href="https://www.youtube.com/@kpujawatengah5041" 
          target="_blank" 
          className="inline-block border-2 border-zinc-900 dark:border-white text-zinc-900 dark:text-white px-8 py-2.5 rounded hover:bg-primary hover:border-primary hover:text-white dark:hover:bg-primary dark:hover:border-primary dark:hover:text-white transition-colors font-bold text-sm"
        >
          Lihat Publikasi Lainnya
        </Link>
      </div>
    </section>
  )
}
