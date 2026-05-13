import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id as string
    const body = await req.json()
    const { oldPassword, newPassword } = body

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 })
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json({ error: "Password baru minimal 8 karakter" }, { status: 400 })
    }

    // Ambil password hash dari DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    })

    if (!user?.password) {
      return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 })
    }

    // Verifikasi password lama
    const isValid = await bcrypt.compare(oldPassword, user.password)
    if (!isValid) {
      return NextResponse.json({ error: "Password lama tidak sesuai" }, { status: 400 })
    }

    // Hash password baru
    const hashed = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    })

    return NextResponse.json({ message: "Password berhasil diubah" })
  } catch (err) {
    console.error("[PUT /api/profil/password]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}