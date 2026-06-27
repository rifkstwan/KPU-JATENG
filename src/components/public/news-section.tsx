import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Bookmark } from "lucide-react"

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

export async function NewsSection() {
  // Fetch up to 5 latest published news
  const newsList = await prisma.berita.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 5
  })

  // Dummy data fallback for demo if DB is empty
  const data = newsList.length > 0 ? newsList : [
    {
      id: "1",
      judul: "KPU JATENG TURUT BERPARTISIPASI DI JATENG FAIR 2026",
      ringkasan: "Semarang, Jum'at (19/6/2026) - KPU Provinsi Jawa Tengah yang diwakili Kabag Parmas dan SDM, Kiki Rizka Ningsih, menghadiri kegiatan rapat yang diselenggarakan oleh Kesbangpol Jateng, bersama instansi terkait dan organisasi masyarakat guna menyukseskan kegiatan pameran Jateng Fair Tahun 2026 di PRPP.",
      konten: "",
      gambarUrl: "/berita-1.png",
      kategori: "Sosialisasi",
      sumber: "Humas KPU",
      published: true,
      slug: "jateng-fair",
      createdAt: new Date("2026-06-19"),
      updatedAt: new Date(),
    },
    {
      id: "2",
      judul: "RAPAT KOORDINASI PENYIAPAN RUMUSAN KEBIJAKAN PERMASALAHAN PENGGANTIAN ANTARWAKTU ANGGOTA DPRD PROVINSI DAN DPRD KABUPATEN/KOTA",
      ringkasan: "Ketua divisi teknis penyelenggaraan pemilu KPU Provinsi Jawa Tengah menghadiri rapat koordinasi penyiapan rumusan kebijakan terkait permasalahan penggantian antarwaktu (PAW) anggota DPRD Provinsi dan DPRD Kabupaten/Kota. Kegiatan ini diselenggarakan sebagai forum koordinasi dan konsolidasi untuk membahas berbagai aspek regulasi serta kendala yang muncul dalam proses PAW di daerah.",
      konten: "",
      gambarUrl: "/berita-2.png",
      kategori: "Rapat Koordinasi",
      sumber: "Divisi Teknis",
      published: true,
      slug: "rakor-paw",
      createdAt: new Date("2026-06-23"),
      updatedAt: new Date(),
    },
    {
      id: "3",
      judul: "KETUA KPU PROVINSI JAWA TENGAH HADIRI PENANDATANGANAN NOTA KESEPAKATAN DAN TALK SHOW PENDIDIKAN PEMILIH DI SUKOHARJO",
      ringkasan: "Ketua KPU Provinsi Jawa Tengah, Handi Tri Ujiono, menghadiri kegiatan penandatanganan nota kesepakatan antara KPU Kabupaten Sukoharjo dengan Pemerintah Kabupaten Sukoharjo. Penandatanganan nota kesepakatan tersebut menjadi wujud komitmen bersama dalam memperkuat sinergi antara penyelenggara pemilu dan pemerintah daerah untuk mendukung pelaksanaan pendidikan pemilih yang berkelanjutan.",
      konten: "",
      gambarUrl: "/berita-3.png",
      kategori: "Pendidikan Pemilih",
      sumber: "Ketua KPU",
      published: true,
      slug: "sukoharjo",
      createdAt: new Date("2026-06-22"),
      updatedAt: new Date(),
    },
    {
      id: "4",
      judul: "AUDIENSI KE FISIP UNNES, KPU JATENG DORONG KERJASAMA SOSIALISASI PENDIDIKAN PEMILIH",
      ringkasan: "Semarang — Komisi Pemilihan Umum (KPU) Provinsi Jawa Tengah melakukan kunjungan audiensi ke Fakultas Ilmu Sosial dan Ilmu Politik (FISIP) Universitas Negeri Semarang (UNNES), Rabu (25/6/2026). Langkah ini diambil sebagai upaya memperkuat sinergi kelembagaan guna meningkatkan kualitas pelaksanaan pemilu dan pendidikan pemilih di Jawa Tengah.",
      konten: "",
      gambarUrl: "/berita-4.png",
      kategori: "Pendidikan Pemilih",
      sumber: "Humas KPU",
      published: true,
      slug: "audiensi-unnes",
      createdAt: new Date("2026-06-25"),
      updatedAt: new Date(),
    },
    {
      id: "5",
      judul: "KPU PROVINSI JAWA TENGAH GELAR LOMBA PADUAN SUARA MARS KPU",
      ringkasan: "Komisi Pemilihan Umum Provinsi Jawa Tengah menyelenggarakan Lomba Paduan Suara Mars KPU sebagai bagian dari upaya memperkuat identitas kelembagaan dan semangat kebersamaan di lingkungan penyelenggara pemilu. Kegiatan ini diikuti oleh perwakilan bagian internal KPU Provinsi Jawa Tengah yang menampilkan kemampuan vokal dan kekompakan tim masing-masing dalam membawakan lagu kebanggaan lembaga.",
      konten: "",
      gambarUrl: "/berita-5.jpg",
      kategori: "Publikasi",
      sumber: "Humas KPU",
      published: true,
      slug: "lomba-paduan-suara",
      createdAt: new Date("2026-06-17"),
      updatedAt: new Date(),
    }
  ]

  return (
    <section className="mb-16 mt-16 md:mt-24">
      <div className="flex flex-col items-center text-center mb-10 px-4">
        <span className="text-golden-energy text-sm md:text-base font-bold mb-3 uppercase tracking-widest">
          Update KPU Jateng
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.1] text-zinc-900 dark:text-white tracking-tight mb-4">
          Berita & Informasi Terkini
        </h2>
        <p className="text-base md:text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium max-w-2xl">
          Ikuti perkembangan berita terbaru, pengumuman, dan informasi penting seputar pemilihan umum di Provinsi Jawa Tengah.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {data.slice(0, 5).map((news, index) => (
          <Link
            key={news.id}
            href={`/berita/${news.slug}`}
            className={`relative overflow-hidden group cursor-pointer bg-zinc-900 ${
              index === 0 ? "md:col-span-2" : ""
            } ${index === 0 ? "min-h-[350px] md:min-h-[450px]" : "min-h-[250px] md:min-h-[300px]"}`}
          >
            {/* Background Image */}
            <img
              src={news.gambarUrl || "https://images.unsplash.com/photo-1555848962-6e79363ec58f?auto=format&fit=crop&q=80"}
              alt={news.judul}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent z-10 transition-opacity duration-500" />
            
            {/* Content Container */}
            <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 z-20 flex flex-col justify-end h-full">
              <h3
                className={`text-white font-bold leading-snug mb-3 drop-shadow-md line-clamp-3 transition-colors duration-300 group-hover:text-blue-100 ${
                  index === 0 ? "text-2xl md:text-3xl lg:text-4xl" : "text-lg md:text-xl"
                }`}
              >
                {news.judul}
              </h3>
              
              <div className="flex justify-between items-center text-white/90 text-sm font-medium">
                <span>{news.sumber || "KPU Provinsi"}</span>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400"></div>
                  <span className="text-xs md:text-sm tracking-wide">{formatDate(news.createdAt)}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
