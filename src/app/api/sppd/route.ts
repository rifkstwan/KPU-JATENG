import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { JenisTransport } from "@prisma/client"

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { tujuan, keperluan, tanggalBerangkat, tanggalKembali, transportasi, userId } = body

  const nomorSppd = `SPPD-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`

  const sppd = await prisma.pengajuanSPPD.create({
    data: {
      nomorSppd,
      userId,
      tujuan,
      maksud: keperluan,
      tglBerangkat: new Date(tanggalBerangkat),
      tglKembali: new Date(tanggalKembali),
      transport: transportasi as JenisTransport,
      status: "PENDING",
    },
  })

  return NextResponse.json(sppd)
}