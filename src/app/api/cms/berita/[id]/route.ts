import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCMSAdmin } from "@/lib/cms-auth-guard"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  const { id } = await params
  const data = await prisma.berita.findUnique({
    where: { id },
  })
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 })
  
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  const body = await req.json()
  const { id } = await params
  
  // Ensure slug is updated if needed
  if (!body.slug && body.judul) {
    body.slug = body.judul.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  const data = await prisma.berita.update({
    where: { id },
    data: body,
  })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  const { id } = await params
  await prisma.berita.delete({
    where: { id },
  })
  return NextResponse.json({ success: true })
}
