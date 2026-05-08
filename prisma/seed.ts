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

  console.log("✅ Seed selesai!")
  console.log("   pegawai@kpu.go.id  | password123")
  console.log("   approver@kpu.go.id | password123")
  console.log("   admin@kpu.go.id    | password123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())