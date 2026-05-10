import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function generateNomor() {
  const now = new Date()
  const dd   = String(now.getDate()).padStart(2, "0")
  const mm   = String(now.getMonth() + 1).padStart(2, "0")
  const yyyy = now.getFullYear()
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `SPPD/${yyyy}/${mm}${dd}/${rand}`
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: userId, role } = session.user as { id: string; role: string }
  if (role !== "PEGAWAI") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const { tujuan, maksud, tglBerangkat, tglKembali, transport, anggaran, catatan } = body

  if (!tujuan || !maksud || !tglBerangkat || !tglKembali) {
    return NextResponse.json({ error: "Field wajib belum diisi" }, { status: 400 })
  }

  const sppd = await prisma.pengajuanSPPD.create({
    data: {
      nomorSppd: generateNomor(),
      userId,
      tujuan: tujuan.trim(),
      maksud: maksud.trim(),
      tglBerangkat: new Date(tglBerangkat),
      tglKembali: new Date(tglKembali),
      transport: transport ?? "DARAT",
      anggaran: BigInt(anggaran ?? 0),
      catatan: catatan?.trim() || null,
      status: "DRAFT",
    },
  })

  return NextResponse.json({
    data: {
      ...sppd,
      anggaran: parseInt(sppd.anggaran.toString()),
      tglBerangkat: sppd.tglBerangkat.toISOString(),
      tglKembali: sppd.tglKembali.toISOString(),
      createdAt: sppd.createdAt.toISOString(),
      approver: null,
      catatanApprover: null,
    },
  })
}