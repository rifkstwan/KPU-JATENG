import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cmsAuth } from "@/lib/auth-cms"
import { auth } from "@/lib/auth"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = (await cmsAuth()) || (await auth())

  if (!session || (session.user as any)?.role !== "CMS_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.kritikSaran.update({
      where: { id },
      data: { status: "SUDAH_DIBACA" }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to mark notification as read:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
