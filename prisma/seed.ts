import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({
  connectionString: "postgresql://sppd_user:sppd_pass_2025@localhost:5432/sppd_kpu",
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database...")

  const hashedPassword = await bcrypt.hash("password123", 12)

  // ─── User SPPD (existing) ─────────────────────────────────
  const pegawai = await prisma.user.upsert({
    where: { email: "pegawai@kpu.go.id" },
    update: {},
    create: {
      nama: "Budi Santoso",
      nip: "197001012000011001",
      email: "pegawai@kpu.go.id",
      password: hashedPassword,
      jabatan: "Staf Teknis",
      divisi: "Teknis",
      role: "PEGAWAI",
    },
  })

  const approver = await prisma.user.upsert({
    where: { email: "approver@kpu.go.id" },
    update: {},
    create: {
      nama: "Drs. Ahmad Fauzi",
      nip: "196505151990031002",
      email: "approver@kpu.go.id",
      password: hashedPassword,
      jabatan: "Kepala Sub Bagian",
      divisi: "Umum",
      role: "APPROVER",
    },
  })

  await prisma.user.upsert({
    where: { email: "admin@kpu.go.id" },
    update: {},
    create: {
      nama: "Siti Rahmawati",
      nip: "198203142005012001",
      email: "admin@kpu.go.id",
      password: hashedPassword,
      jabatan: "Admin Sistem",
      divisi: "IT",
      role: "ADMIN",
    },
  })

  // ─── User CMS Admin (BARU) ────────────────────────────────
  const hashedCmsPassword = await bcrypt.hash("Admin@CMS123", 12)

  await prisma.user.upsert({
    where: { email: "admin.cms@kpu-jateng.go.id" },
    update: {
      password: hashedCmsPassword,
      role: "CMS_ADMIN",
    },
    create: {
      nama: "Admin CMS KPU",
      email: "admin.cms@kpu-jateng.go.id",
      password: hashedCmsPassword,
      jabatan: "Admin CMS",
      divisi: "Humas",
      role: "CMS_ADMIN",
    },
  })

  // ─── PengajuanSPPD (existing) ─────────────────────────────
  await prisma.pengajuanSPPD.upsert({
    where: { nomorSppd: "SPPD-2025-001" },
    update: {},
    create: {
      nomorSppd: "SPPD-2025-001",
      userId: pegawai.id,
      tujuan: "Jakarta",
      tglBerangkat: new Date("2025-01-10"),
      tglKembali: new Date("2025-01-12"),
      transport: "UDARA",
      anggaran: 3500000,
      maksud: "Menghadiri Bimtek Pemilu 2025 di KPU Pusat Jakarta.",
      status: "APPROVED",
    },
  })

  await prisma.pengajuanSPPD.upsert({
    where: { nomorSppd: "SPPD-2025-002" },
    update: {},
    create: {
      nomorSppd: "SPPD-2025-002",
      userId: pegawai.id,
      tujuan: "Semarang",
      tglBerangkat: new Date("2025-01-15"),
      tglKembali: new Date("2025-01-15"),
      transport: "DARAT",
      anggaran: 800000,
      maksud: "Konsultasi pengadaan logistik pemilu.",
      status: "PENDING",
    },
  })

  await prisma.pengajuanSPPD.upsert({
    where: { nomorSppd: "SPPD-2025-003" },
    update: {},
    create: {
      nomorSppd: "SPPD-2025-003",
      userId: approver.id,
      tujuan: "Yogyakarta",
      tglBerangkat: new Date("2025-01-20"),
      tglKembali: new Date("2025-01-21"),
      transport: "KERETA",
      anggaran: 2100000,
      maksud: "Rapat koordinasi persiapan Pilkada 2025.",
      status: "PENDING",
    },
  })

  // ─── Data Landing Page Awal (BARU) ───────────────────────

  // Tentang KPU — singleton record
  await prisma.tentangKPU.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      profil:
        "KPU Provinsi Jawa Tengah adalah lembaga penyelenggara pemilihan umum yang bersifat nasional, tetap, dan mandiri.",
      visi: "Terwujudnya KPU sebagai penyelenggara pemilihan umum yang memiliki integritas, profesional, mandiri, transparan, dan akuntabel.",
      misi: JSON.stringify([
        "Membangun SDM yang kompeten dan berintegritas",
        "Menyelenggarakan pemilu yang demokratis dan berkualitas",
        "Meningkatkan partisipasi masyarakat dalam pemilu",
      ]),
      alamat: "Jl. Veteran No.1A, Semarang, Jawa Tengah 50233",
      telepon: "(024) 8311523",
      email: "kpu-jatengprov@kpu.go.id",
    },
  })

  // Informasi Layanan awal
  const layananData = [
    {
      namaLayanan: "Layanan Informasi Pemilih",
      persyaratan: "KTP Elektronik yang masih berlaku",
      jamPelayanan: "Senin - Jumat, 08.00 - 16.00 WIB",
      alurPelayanan: JSON.stringify([
        "Datang ke kantor KPU",
        "Ambil nomor antrian",
        "Serahkan KTP ke petugas",
        "Petugas mengecek data di Sidalih",
        "Terima bukti cek data pemilih",
      ]),
      urutan: 1,
    },
    {
      namaLayanan: "Layanan Pendaftaran Calon",
      persyaratan:
        "Formulir pendaftaran, KTP, ijazah terakhir, SKCK, surat keterangan sehat",
      jamPelayanan: "Senin - Jumat, 08.00 - 15.00 WIB",
      alurPelayanan: JSON.stringify([
        "Download formulir di website KPU",
        "Lengkapi berkas persyaratan",
        "Serahkan berkas ke loket pendaftaran",
        "Verifikasi berkas oleh petugas",
        "Terima tanda terima pendaftaran",
      ]),
      urutan: 2,
    },
    {
      namaLayanan: "Layanan Pengaduan",
      persyaratan: "Identitas pelapor dan bukti pendukung",
      jamPelayanan: "Senin - Jumat, 08.00 - 16.00 WIB",
      alurPelayanan: JSON.stringify([
        "Isi formulir pengaduan online atau datang langsung",
        "Lampirkan bukti pendukung",
        "Terima nomor registrasi pengaduan",
        "KPU memproses dalam 3 hari kerja",
        "Terima jawaban/tindak lanjut",
      ]),
      urutan: 3,
    },
  ]

  for (const layanan of layananData) {
    await prisma.informasiLayanan.upsert({
      where: {
        // upsert by namaLayanan — tambah @@unique di schema jika belum ada
        // sementara pakai createMany dengan skipDuplicates jika perlu
        id: `layanan-${layanan.urutan}`,
      },
      update: {},
      create: {
        id: `layanan-${layanan.urutan}`,
        ...layanan,
      },
    })
  }

  // Kontak KPU awal
  const kontakData = [
    {
      id: "kontak-1",
      label: "Sekretariat Umum",
      telepon: "(024) 8311523",
      email: "kpu-jatengprov@kpu.go.id",
      whatsapp: "628112345678",
      urutan: 1,
    },
    {
      id: "kontak-2",
      label: "Bagian Humas",
      telepon: "(024) 8311524",
      email: "humas.kpu-jateng@kpu.go.id",
      urutan: 2,
    },
    {
      id: "kontak-3",
      label: "Bagian IT & Teknis",
      telepon: "(024) 8311525",
      email: "it.kpu-jateng@kpu.go.id",
      urutan: 3,
    },
  ]

  for (const kontak of kontakData) {
    await prisma.kontakKPU.upsert({
      where: { id: kontak.id },
      update: {},
      create: kontak,
    })
  }

  console.log("✅ Seed selesai!")
  console.log("")
  console.log("─── Akun SPPD ───────────────────────────────")
  console.log("   pegawai@kpu.go.id   | password123")
  console.log("   approver@kpu.go.id  | password123")
  console.log("   admin@kpu.go.id     | password123")
  console.log("")
  console.log("─── Akun CMS Admin ──────────────────────────")
  console.log("   admin.cms@kpu-jateng.go.id | Admin@CMS123")
  console.log("   Login: http://localhost:3000/cms/login")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())