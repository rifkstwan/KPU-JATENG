import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cmsAuth } from "@/lib/auth-cms"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = (await cmsAuth()) || (await auth())

  if (!session || (session.user as any)?.role !== "CMS_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const [count, items] = await Promise.all([
      prisma.kritikSaran.count({
        where: { status: "BELUM_DIBACA" }
      }),
      prisma.kritikSaran.findMany({
        where: { status: "BELUM_DIBACA" },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          nama: true,
          isi: true,
          createdAt: true,
        }
      })
    ])

    return NextResponse.json({ count, items })
  } catch (error) {
    console.error("Failed to fetch notifications:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
