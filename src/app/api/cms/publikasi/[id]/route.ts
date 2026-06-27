import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCMSAdmin } from "@/lib/cms-auth-guard"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  const { id } = await params
  const data = await prisma.publikasi.findUnique({ where: { id } })
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  const { id } = await params
  const body = await req.json()
  const data = await prisma.publikasi.update({ where: { id }, data: body })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  const { id } = await params
  await prisma.publikasi.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
