import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""
    if (q.length < 2) {
      return NextResponse.json({ sppd: [], users: [], approvals: [] })
    }

    const userId = session.user.id
    const role = (session.user as { role?: string }).role ?? ""
    const isAdmin = role === "ADMIN"
    const isApprover = role === "APPROVER"

    // Query SPPD
    const sppd = await prisma.pengajuanSPPD.findMany({
      where: {
        ...(isAdmin || isApprover ? {} : { userId }),
        OR: [
          { nomorSppd: { contains: q, mode: "insensitive" } },
          { tujuan:     { contains: q, mode: "insensitive" } },
          { maksud:     { contains: q, mode: "insensitive" } },
          { user: { nama: { contains: q, mode: "insensitive" } } },
        ],
      },
      select: {
        id: true,
        nomorSppd: true,
        tujuan: true,
        status: true,
        user: { select: { nama: true, jabatan: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    // Query Approval — hanya untuk approver & admin
    const approvals = (isAdmin || isApprover)
      ? await prisma.approval.findMany({
          where: {
            OR: [
              { sppd: { nomorSppd: { contains: q, mode: "insensitive" } } },
              { sppd: { tujuan:    { contains: q, mode: "insensitive" } } },
              { sppd: { user: { nama: { contains: q, mode: "insensitive" } } } },
            ],
          },
          select: {
            id: true,
            keputusan: true,
            sppd: {
              select: {
                nomorSppd: true,
                tujuan: true,
                user: { select: { nama: true } },
              },
            },
          },
          orderBy: { approvedAt: "desc" },
          take: 5,
        })
      : []

    // Query Users — hanya untuk admin
    const users = isAdmin
      ? await prisma.user.findMany({
          where: {
            OR: [
              { nama:    { contains: q, mode: "insensitive" } },
              { nip:     { contains: q, mode: "insensitive" } },
              { jabatan: { contains: q, mode: "insensitive" } },
              { divisi:  { contains: q, mode: "insensitive" } },
            ],
          },
          select: {
            id: true,
            nama: true,
            nip: true,
            jabatan: true,
            divisi: true,
            role: true,
          },
          orderBy: { nama: "asc" },
          take: 5,
        })
      : []

    return NextResponse.json({ sppd, users, approvals })
  } catch (error) {
    console.error("[GET /api/search]", error)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}