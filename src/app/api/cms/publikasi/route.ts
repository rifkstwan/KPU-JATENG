import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCMSAdmin } from "@/lib/cms-auth-guard"

export async function GET() {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  let data = await prisma.publikasi.findMany({
    orderBy: { createdAt: "desc" },
  })

  if (data.length === 0) {
    const defaultPublikasi = [
      { judul: "Sosialisasi Pemilu 2024 - Part 1", url: "https://youtu.be/v51fvBNW33A?si=RMrm3Yf9pG26--kh", tanggal: "25 Mei 2026", published: true },
      { judul: "Panduan Pemilih Pemula", url: "https://youtu.be/5QHmpEQMHIk?si=x2lG_ID6ydkGt6zv", tanggal: "26 Mei 2026", published: true },
      { judul: "Tutorial Cek DPT Online", url: "https://youtu.be/RB7XTanoSIU?si=B8NHgnje_yZrcLe-", tanggal: "27 Mei 2026", published: true },
      { judul: "Informasi KPPS Pemilu 2024", url: "https://youtu.be/04sYUhm0Irs?si=lgWihwUKSs1jZ4pu", tanggal: "28 Mei 2026", published: true },
    ]

    for (const pub of defaultPublikasi) {
      await prisma.publikasi.create({ data: pub })
    }

    data = await prisma.publikasi.findMany({
      orderBy: { createdAt: "desc" },
    })
  }

  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  const body = await req.json()
  const data = await prisma.publikasi.create({ data: body })
  return NextResponse.json(data, { status: 201 })
}
