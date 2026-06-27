import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCMSAdmin } from "@/lib/cms-auth-guard"

export async function GET() {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  let data = await prisma.informasiLayanan.findMany({
    orderBy: { urutan: "asc" },
  })

  if (data.length === 0) {
    const defaultLayanan = [
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

    for (const layanan of defaultLayanan) {
      await prisma.informasiLayanan.create({ data: layanan })
    }

    data = await prisma.informasiLayanan.findMany({
      orderBy: { urutan: "asc" },
    })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  const body = await req.json()
  const data = await prisma.informasiLayanan.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
