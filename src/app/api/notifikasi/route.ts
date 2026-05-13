// src/app/api/notifikasi/route.ts
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET /api/notifikasi?limit=5
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "20")

    const notifs = await prisma.notifikasi.findMany({
      where: { userId: session.user.id },
      include: {
        sppd: {
          select: { nomorSppd: true, tujuan: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return NextResponse.json(notifs)
  } catch (error) {
    console.error("[GET /api/notifikasi]", error)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}