import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCMSAdmin } from "@/lib/cms-auth-guard"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  const { id } = await params
  const body = await req.json()
  const data = await prisma.kritikSaran.update({ where: { id }, data: body })
  return NextResponse.json(data)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  const { id } = await params
  await prisma.kritikSaran.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
