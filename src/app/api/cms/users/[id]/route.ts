import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireCMSAdmin } from "@/lib/cms-auth-guard"
import bcrypt from "bcryptjs"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  const resolvedParams = await params
  const body = await req.json()
  const { nama, email, password, jabatan, divisi } = body

  const updateData: Record<string, unknown> = {}
  if (nama) updateData.nama = nama
  if (email) updateData.email = email
  if (jabatan !== undefined) updateData.jabatan = jabatan || null
  if (divisi !== undefined) updateData.divisi = divisi || null
  if (password) {
    updateData.password = await bcrypt.hash(password, 12)
  }

  try {
    const user = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: updateData,
      select: { id: true, nama: true, email: true, role: true, jabatan: true, divisi: true, createdAt: true },
    })
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireCMSAdmin()
  if (guard) return guard

  const resolvedParams = await params

  try {
    await prisma.user.delete({ where: { id: resolvedParams.id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 })
  }
}
