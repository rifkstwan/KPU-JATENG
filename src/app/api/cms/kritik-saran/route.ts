import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCMSAdmin } from "@/lib/cms-auth-guard"

export async function GET(req: NextRequest) {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")

  const data = await prisma.kritikSaran.findMany({
    where: status ? { status: status as "BELUM_DIBACA" | "SUDAH_DIBACA" | "DIBALAS" } : undefined,
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(data)
}
