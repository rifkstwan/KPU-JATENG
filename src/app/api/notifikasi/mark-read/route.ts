import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const { id } = await req.json()

  await prisma.notifikasi.updateMany({
    where: { id, userId },
    data: { isRead: true },
  })

  return NextResponse.json({ ok: true })
}