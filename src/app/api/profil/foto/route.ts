import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const userId = session.user.id as string
    const formData = await req.formData()
    const file = formData.get("foto") as File | null

    if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 })
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Harus berupa file gambar" }, { status: 400 })
    if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 })

    // Konversi ke base64 data URL (simpel, tanpa storage eksternal)
    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    await prisma.user.update({
      where: { id: userId },
      data: { foto: dataUrl },
    })

    return NextResponse.json({ foto: dataUrl })
  } catch (err) {
    console.error("[POST /api/profil/foto]", err)
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 })
  }
}