import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""
  if (q.length < 2) {
    return NextResponse.json({ sppd: [], users: [], approvals: [] })
  }

  const where = { contains: q, mode: "insensitive" as const }
  const isAdminOrApprover = ["ADMIN", "APPROVER"].includes(session.user.role ?? "")

  const [sppdRaw, users, approvalsRaw] = await Promise.all([
    // SPPD — pegawai hanya lihat miliknya sendiri
    prisma.pengajuanSPPD.findMany({
      where: {
        ...(isAdminOrApprover ? {} : { userId: session.user.id }),
        OR: [
          { nomorSppd: where },
          { tujuan: where },
          { maksud: where },
          { user: { nama: where } },
        ],
      },
      include: {
        user: { select: { nama: true, jabatan: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),

    // Users — hanya ADMIN
    session.user.role === "ADMIN"
      ? prisma.user.findMany({
          where: {
            OR: [
              { nama: where },
              { nip: where },
              { jabatan: where },
              { divisi: where },
            ],
          },
          select: {
            id: true, nama: true, nip: true,
            jabatan: true, divisi: true, role: true,
          },
          take: 5,
        })
      : Promise.resolve([]),

    // Approvals — APPROVER & ADMIN saja
    isAdminOrApprover
      ? prisma.approval.findMany({
          where: {
            OR: [
              { sppd: { nomorSppd: where } },
              { sppd: { tujuan: where } },
              { sppd: { user: { nama: where } } },
            ],
          },
          include: {
            sppd: {
              include: { user: { select: { nama: true } } },
            },
          },
          orderBy: { approvedAt: "desc" },
          take: 5,
        })
      : Promise.resolve([]),
  ])

  // ✅ Serialize BigInt → string (wajib karena field anggaran BigInt)
  const sppd = sppdRaw.map((item) => ({
    ...item,
    anggaran: item.anggaran.toString(),
  }))

  const approvals = approvalsRaw.map((item) => ({
    ...item,
    sppd: {
      ...item.sppd,
      anggaran: item.sppd.anggaran.toString(),
    },
  }))

  return NextResponse.json({ sppd, users, approvals })
}