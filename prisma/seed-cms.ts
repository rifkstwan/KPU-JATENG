import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import * as dotenv from "dotenv"
dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Layanan
  const layananData = [
    {
      namaLayanan: "Layanan Informasi Pemilih",
      persyaratan: "KTP elektronik, Kartu Keluarga",
      jamPelayanan: "Senin - Jumat, 08.00 - 16.00 WIB",
      alurPelayanan: "1. Datang ke kantor KPU\n2. Ambil nomor antrian\n3. Serahkan dokumen\n4. Tunggu proses verifikasi",
      urutan: 1,
      aktif: true,
    },
    {
      namaLayanan: "Layanan Pendaftaran Pemantau",
      persyaratan: "Surat permohonan, KTP, pas foto 3x4",
      jamPelayanan: "Senin - Jumat, 08.00 - 15.00 WIB",
      alurPelayanan: "1. Isi formulir pendaftaran\n2. Lampirkan dokumen persyaratan\n3. Submit ke bagian umum\n4. Tunggu verifikasi 3 hari kerja",
      urutan: 2,
      aktif: true,
    },
    {
      namaLayanan: "Layanan PPID (Informasi Publik)",
      persyaratan: "Formulir permohonan informasi, identitas pemohon",
      jamPelayanan: "Senin - Jumat, 08.00 - 16.00 WIB",
      alurPelayanan: "1. Isi formulir permohonan\n2. Serahkan ke petugas PPID\n3. Proses maks 10 hari kerja\n4. Informasi dikirim via email/ambil langsung",
      urutan: 3,
      aktif: true,
    },
  ]

  for (const layanan of layananData) {
    await prisma.informasiLayanan.create({ data: layanan }).catch(() => {
      console.log(`Skip: ${layanan.namaLayanan} sudah ada`)
    })
  }

  // Tentang KPU
  const existing = await prisma.tentangKPU.findFirst()
  if (!existing) {
    await prisma.tentangKPU.create({
      data: {
        id: "singleton",
        profil: "KPU Provinsi Jawa Tengah adalah lembaga penyelenggara pemilihan umum yang bersifat nasional, tetap, dan mandiri.",
        visi: "Terwujudnya KPU Provinsi Jawa Tengah sebagai penyelenggara pemilihan umum yang memiliki integritas, profesional, mandiri, transparan, dan akuntabel.",
        misi: JSON.stringify([
          "Membangun SDM yang kompeten dan berintegritas",
          "Menyelenggarakan pemilu yang demokratis, langsung, umum, bebas, rahasia, jujur, dan adil",
          "Meningkatkan partisipasi masyarakat dalam pemilu",
          "Mewujudkan tata kelola administrasi yang baik",
        ]),
        alamat: "Jl. Veteran No.1A, Semarang, Jawa Tengah 50233",
        telepon: "(024) 8311523",
        email: "kpu-jatengprov@kpu.go.id",
        mapEmbedUrl: "https://maps.google.com/maps?q=KPU+Jawa+Tengah&output=embed",
      },
    })
  }

  // Kontak
  const kontakData = [
    { label: "Sekretariat", telepon: "(024) 8311523", email: "kpu-jatengprov@kpu.go.id", urutan: 1, aktif: true },
    { label: "Humas", telepon: "(024) 8311524", whatsapp: "081234567890", urutan: 2, aktif: true },
    { label: "PPID", email: "ppid@kpu-jatengprov.go.id", urutan: 3, aktif: true },
  ]

  const kontakCount = await prisma.kontakKPU.count()
  if (kontakCount === 0) {
    for (const kontak of kontakData) {
      await prisma.kontakKPU.create({ data: kontak })
    }
  }

  console.log("✅ Seed CMS data berhasil")
}

main().catch(console.error).finally(() => prisma.$disconnect())
