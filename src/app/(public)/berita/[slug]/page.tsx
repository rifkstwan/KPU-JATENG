import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Calendar, User, ChevronLeft, BookOpen } from "lucide-react"
import { Metadata } from "next"

// Dummy data for fallback if db is empty during initial demo
const DUMMY_NEWS = [
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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  let news = await prisma.berita.findUnique({ where: { slug } })
  if (!news) {
    news = DUMMY_NEWS.find(n => n.slug === slug) as any
  }
  return {
    title: news?.judul || "Berita KPU",
    description: news?.ringkasan || "Berita KPU Provinsi Jawa Tengah",
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let news = await prisma.berita.findUnique({ where: { slug } })

  // Fallback to dummy data if not found in db (for demo purposes)
  if (!news) {
    news = DUMMY_NEWS.find(n => n.slug === slug) as any
  }

  if (!news) {
    notFound()
  }

  // Get other recent news for the sidebar
  let recentNews = await prisma.berita.findMany({
    where: { published: true, id: { not: news.id } },
    orderBy: { createdAt: "desc" },
    take: 3
  })

  // Fallback to dummy
  if (recentNews.length === 0) {
    recentNews = DUMMY_NEWS.filter(n => n.slug !== slug).slice(0, 3) as any
  }

  return (
    <div className="bg-surface-container-lowest min-h-screen pb-20">
      {/* Hero Header */}
      <div className="relative w-full h-[300px] md:h-[400px] bg-zinc-900 overflow-hidden">
        <img
          src={news.gambarUrl || "https://images.unsplash.com/photo-1555848962-6e79363ec58f"}
          alt={news.judul}
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center pt-10">
          <div className="text-center px-6 max-w-4xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-red-700 text-white text-xs font-bold uppercase tracking-wider mb-6 shadow-lg shadow-red-900/50">
              {news.kategori || "Berita Umum"}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-xl leading-tight mb-4">
              {news.judul}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-zinc-100 overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Main Article Content */}
            <div className="lg:col-span-8 p-8 md:p-12 lg:pr-16">
              
              <Link href="/berita" className="inline-flex items-center gap-2 text-sm font-bold text-red-700 hover:text-red-800 mb-8 transition-colors">
                <ChevronLeft size={16} /> Kembali ke Indeks Berita
              </Link>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500 font-medium mb-8 pb-8 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400">
                    <Calendar size={14} />
                  </div>
                  {formatDate(news.createdAt)}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400">
                    <User size={14} />
                  </div>
                  {news.sumber || "Humas KPU Jateng"}
                </div>
              </div>

              {/* Featured Image inside Article */}
              <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden mb-10 shadow-lg border border-zinc-100">
                <img
                  src={news.gambarUrl || "https://images.unsplash.com/photo-1555848962-6e79363ec58f?auto=format&fit=crop&q=80"}
                  alt={news.judul}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Lead Paragraph */}
              <p className="text-xl text-zinc-800 font-medium leading-relaxed mb-8">
                {news.ringkasan}
              </p>

              {/* Main Content HTML */}
              <div className="prose prose-zinc prose-lg max-w-none text-zinc-600 prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-zinc-900 prose-a:text-red-700 hover:prose-a:text-red-800">
                {news.konten ? (
                  <div dangerouslySetInnerHTML={{ __html: news.konten }} />
                ) : (
                  <>
                    <p>
                      Jawa Tengah — Komisi Pemilihan Umum (KPU) Provinsi Jawa Tengah terus berupaya meningkatkan partisipasi dan kesadaran masyarakat dalam menyambut pemilihan umum mendatang. Melalui berbagai program sosialisasi dan pendekatan strategis, KPU berharap masyarakat dapat lebih memahami pentingnya hak pilih mereka.
                    </p>
                    <p>
                      Kegiatan yang dilakukan baru-baru ini merupakan bagian dari komitmen nyata lembaga untuk menciptakan pemilu yang tidak hanya aman dan tertib, tetapi juga transparan serta akuntabel. Kolaborasi dengan berbagai pihak mulai dari institusi pendidikan, tokoh masyarakat, hingga pemerintah daerah terus digalakkan.
                    </p>
                    <blockquote className="border-l-4 border-red-700 bg-red-50 p-4 rounded-r-xl italic text-zinc-700">
                      "Pendidikan pemilih adalah kunci utama dalam membangun demokrasi yang sehat. Kami ingin memastikan setiap warga negara yang memiliki hak pilih mendapatkan informasi yang utuh dan akurat."
                    </blockquote>
                    <p>
                      Selain sosialisasi secara tatap muka, KPU Jawa Tengah juga aktif memanfaatkan media digital untuk menjangkau generasi muda. Dengan pendekatan yang lebih segar dan relevan, diharapkan tingkat partisipasi pemilih pemula akan mengalami peningkatan signifikan pada perhelatan demokrasi berikutnya.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 bg-zinc-50 border-l border-zinc-100 p-8 md:p-12">
              <h3 className="text-lg font-extrabold text-zinc-900 uppercase tracking-wider mb-8 flex items-center gap-3">
                <div className="w-2 h-6 bg-red-700 rounded-full"></div>
                Berita Lainnya
              </h3>

              <div className="flex flex-col gap-6">
                {recentNews.map((post) => (
                  <Link 
                    href={`/berita/${post.slug}`} 
                    key={post.id} 
                    className="group flex flex-col gap-4 bg-white p-4 rounded-2xl border border-zinc-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-red-100 transition-all duration-300"
                  >
                    <div className="w-full h-32 rounded-xl overflow-hidden bg-zinc-100 relative">
                      <img
                        src={post.gambarUrl || "https://images.unsplash.com/photo-1555848962-6e79363ec58f"}
                        alt={post.judul}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-red-800 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                        {post.kategori || "Umum"}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 leading-snug group-hover:text-red-700 transition-colors line-clamp-3 mb-2">
                        {post.judul}
                      </h4>
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                        {formatDate(post.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Newsletter / Call to Action widget */}
              <div className="mt-10 bg-gradient-to-br from-red-800 to-red-950 rounded-2xl p-6 text-white text-center shadow-xl">
                <BookOpen className="w-8 h-8 text-red-200 mx-auto mb-3" />
                <h4 className="font-bold mb-2">Dapatkan Informasi Terkini</h4>
                <p className="text-xs text-red-100/80 mb-4 leading-relaxed">
                  Ikuti terus perkembangan informasi pemilu di Jawa Tengah secara cepat dan akurat.
                </p>
                <Link href="/berita" className="block w-full py-2.5 bg-white text-red-900 text-sm font-bold rounded-xl hover:bg-red-50 transition-colors">
                  Lihat Semua Berita
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
