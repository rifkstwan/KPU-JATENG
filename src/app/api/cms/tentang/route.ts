import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCMSAdmin } from "@/lib/cms-auth-guard"

export async function GET() {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  const data = await prisma.tentangKPU.findFirst()
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  const body = await req.json()
  const existing = await prisma.tentangKPU.findFirst()

  const data = existing
    ? await prisma.tentangKPU.update({ where: { id: existing.id }, data: body })
    : await prisma.tentangKPU.create({ data: body })

  return NextResponse.json(data)
}
