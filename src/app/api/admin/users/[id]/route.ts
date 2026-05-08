import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { nama, email, password, nip, jabatan, divisi, role } = await req.json()

  const data: Record<string, unknown> = {
    nama, email,
    nip: nip || null, jabatan: jabatan || null,
    divisi: divisi || null, role: role as Role,
  }

  if (password && password.length >= 6) {
    data.password = await bcrypt.hash(password, 10)
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
  })

  return NextResponse.json(user)
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.pengajuanSPPD.deleteMany({ where: { userId: params.id } })
  await prisma.user.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}