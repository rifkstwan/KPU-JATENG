import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCMSAdmin } from "@/lib/cms-auth-guard"

export async function GET() {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  let data = await prisma.berita.findMany({
    orderBy: { createdAt: "desc" },
  })

  if (data.length === 0) {
    const defaultNews = [
      {
        judul: "KPU JATENG TURUT BERPARTISIPASI DI JATENG FAIR 2026",
        slug: "jateng-fair",
        ringkasan: "Semarang, Jum'at (19/6/2026) - KPU Provinsi Jawa Tengah yang diwakili Kabag Parmas dan SDM, Kiki Rizka Ningsih, menghadiri kegiatan rapat yang diselenggarakan oleh Kesbangpol Jateng, bersama instansi terkait dan organisasi masyarakat guna menyukseskan kegiatan pameran Jateng Fair Tahun 2026 di PRPP.",
        konten: "Semarang, Jum'at (19/6/2026) - KPU Provinsi Jawa Tengah yang diwakili Kabag Parmas dan SDM, Kiki Rizka Ningsih, menghadiri kegiatan rapat yang diselenggarakan oleh Kesbangpol Jateng, bersama instansi terkait dan organisasi masyarakat guna menyukseskan kegiatan pameran Jateng Fair Tahun 2026 di PRPP.",
        gambarUrl: "/berita-1.png",
        kategori: "Sosialisasi",
        sumber: "Humas KPU",
        published: true,
      },
      {
        judul: "RAPAT KOORDINASI PENYIAPAN RUMUSAN KEBIJAKAN PAW ANGGOTA DPRD PROVINSI DAN DPRD KABUPATEN/KOTA",
        slug: "rakor-paw",
        ringkasan: "Ketua divisi teknis penyelenggaraan pemilu KPU Provinsi Jawa Tengah menghadiri rapat koordinasi penyiapan rumusan kebijakan terkait permasalahan penggantian antarwaktu (PAW) anggota DPRD Provinsi.",
        konten: "Ketua divisi teknis penyelenggaraan pemilu KPU Provinsi Jawa Tengah menghadiri rapat koordinasi penyiapan rumusan kebijakan terkait permasalahan penggantian antarwaktu (PAW) anggota DPRD Provinsi dan DPRD Kabupaten/Kota. Kegiatan ini diselenggarakan sebagai forum koordinasi dan konsolidasi untuk membahas berbagai aspek regulasi serta kendala yang muncul dalam proses PAW di daerah.",
        gambarUrl: "/berita-2.png",
        kategori: "Rapat Koordinasi",
        sumber: "Divisi Teknis",
        published: true,
      },
      {
        judul: "KETUA KPU JATENG HADIRI PENANDATANGANAN NOTA KESEPAKATAN PENDIDIKAN PEMILIH DI SUKOHARJO",
        slug: "sukoharjo",
        ringkasan: "Ketua KPU Provinsi Jawa Tengah, Handi Tri Ujiono, menghadiri kegiatan penandatanganan nota kesepakatan antara KPU Kabupaten Sukoharjo dengan Pemerintah Kabupaten Sukoharjo.",
        konten: "Ketua KPU Provinsi Jawa Tengah, Handi Tri Ujiono, menghadiri kegiatan penandatanganan nota kesepakatan antara KPU Kabupaten Sukoharjo dengan Pemerintah Kabupaten Sukoharjo. Penandatanganan nota kesepakatan tersebut menjadi wujud komitmen bersama dalam memperkuat sinergi antara penyelenggara pemilu dan pemerintah daerah untuk mendukung pelaksanaan pendidikan pemilih yang berkelanjutan.",
        gambarUrl: "/berita-3.png",
        kategori: "Pendidikan Pemilih",
        sumber: "Ketua KPU",
        published: true,
      },
      {
        judul: "AUDIENSI KE FISIP UNNES, KPU JATENG DORONG KERJASAMA SOSIALISASI PENDIDIKAN PEMILIH",
        slug: "audiensi-unnes",
        ringkasan: "Semarang — Komisi Pemilihan Umum (KPU) Provinsi Jawa Tengah melakukan kunjungan audiensi ke FISIP UNNES, Rabu (25/6/2026) guna sinergi sosialisasi.",
        konten: "Semarang — Komisi Pemilihan Umum (KPU) Provinsi Jawa Tengah melakukan kunjungan audiensi ke Fakultas Ilmu Sosial dan Ilmu Politik (FISIP) Universitas Negeri Semarang (UNNES), Rabu (25/6/2026). Langkah ini diambil sebagai upaya memperkuat sinergi kelembagaan guna meningkatkan kualitas pelaksanaan pemilu dan pendidikan pemilih di Jawa Tengah.",
        gambarUrl: "/berita-4.png",
        kategori: "Pendidikan Pemilih",
        sumber: "Humas KPU",
        published: true,
      },
      {
        judul: "KPU PROVINSI JAWA TENGAH GELAR LOMBA PADUAN SUARA MARS KPU JATENG 2026",
        slug: "lomba-paduan-suara",
        ringkasan: "Komisi Pemilihan Umum Provinsi Jawa Tengah menyelenggarakan Lomba Paduan Suara Mars KPU sebagai bagian dari upaya memperkuat identitas kelembagaan.",
        konten: "Komisi Pemilihan Umum Provinsi Jawa Tengah menyelenggarakan Lomba Paduan Suara Mars KPU sebagai bagian dari upaya memperkuat identitas kelembagaan dan semangat kebersamaan di lingkungan penyelenggara pemilu. Kegiatan ini diikuti oleh perwakilan bagian internal KPU Provinsi Jawa Tengah yang menampilkan kemampuan vokal dan kekompakan tim masing-masing dalam membawakan lagu kebanggaan lembaga.",
        gambarUrl: "/berita-5.jpg",
        kategori: "Publikasi",
        sumber: "Humas KPU",
        published: true,
      }
    ]

    for (const news of defaultNews) {
      await prisma.berita.create({ data: news })
    }

    data = await prisma.berita.findMany({
      orderBy: { createdAt: "desc" },
    })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  const body = await req.json()
  
  // Ensure slug is generated if not provided
  if (!body.slug && body.judul) {
    body.slug = body.judul.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  const data = await prisma.berita.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
