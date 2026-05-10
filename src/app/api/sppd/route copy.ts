import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// ── Generate nomor SPPD otomatis: SPPD-2026-001 ──
async function generateNomorSppd(): Promise<string> {
  const year = new Date().getFullYear()
  const count = await prisma.pengajuanSPPD.count({
    where: {
      nomorSppd: { startsWith: `SPPD-${year}-` },
    },
  })
  const seq = String(count + 1).padStart(3, "0")
  return `SPPD-${year}-${seq}`
}

// ── POST /api/sppd ──
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { tujuan, maksud, tglBerangkat, tglKembali, transport, anggaran, catatan, status } = body

    // Validasi field wajib
    if (!tujuan || !maksud || !tglBerangkat || !tglKembali) {
      return NextResponse.json({ message: "Field wajib tidak lengkap" }, { status: 400 })
    }

    // Validasi tanggal
    const berangkat = new Date(tglBerangkat)
    const kembali = new Date(tglKembali)
    if (kembali < berangkat) {
      return NextResponse.json(
        { message: "Tanggal kembali tidak boleh sebelum tanggal berangkat" },
        { status: 400 }
      )
    }

    // Validasi status
    const validStatus = ["DRAFT", "PENDING"]
    if (!validStatus.includes(status)) {
      return NextResponse.json({ message: "Status tidak valid" }, { status: 400 })
    }

    const nomorSppd = await generateNomorSppd()

    // Simpan ke database
    const sppd = await prisma.pengajuanSPPD.create({
      data: {
        nomorSppd,
        userId: session.user.id,
        tujuan,
        maksud,
        tglBerangkat: berangkat,
        tglKembali: kembali,
        transport: transport ?? "DARAT",
        anggaran: BigInt(anggaran ?? 0),
        catatan: catatan ?? null,
        status,
      },
    })

    // Jika PENDING → kirim notifikasi ke semua APPROVER
    if (status === "PENDING") {
      const approvers = await prisma.user.findMany({
        where: { role: "APPROVER" },
        select: { id: true },
      })

      if (approvers.length > 0) {
        await prisma.notifikasi.createMany({
          data: approvers.map((approver) => ({
            userId: approver.id,
            sppdId: sppd.id,
            pesan: `Pengajuan SPPD baru dari ${session.user.name ?? "Pegawai"} — ${tujuan} (${nomorSppd}) menunggu review Anda.`,
            tipe: "PENDING" as const,
          })),
        })
      }

      // Notifikasi ke pegawai sendiri (konfirmasi terkirim)
      await prisma.notifikasi.create({
        data: {
          userId: session.user.id,
          sppdId: sppd.id,
          pesan: `Pengajuan SPPD ${nomorSppd} berhasil dikirim dan sedang menunggu review Approver.`,
          tipe: "INFO" as const,
        },
      })
    }

    return NextResponse.json(
      { message: "Berhasil", id: sppd.id, nomorSppd: sppd.nomorSppd },
      { status: 201 }
    )
  } catch (error) {
    console.error("[POST /api/sppd]", error)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}

// ── GET /api/sppd — ambil daftar SPPD milik user login ──
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const isAdminOrApprover = ["ADMIN", "APPROVER"].includes(session.user.role ?? "")

    const sppd = await prisma.pengajuanSPPD.findMany({
      where: isAdminOrApprover ? {} : { userId: session.user.id },
      include: {
        user: { select: { nama: true, jabatan: true, divisi: true } },
        approvals: {
          include: {
            approver: { select: { nama: true } },
          },
          orderBy: { approvedAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Serialize BigInt → string untuk JSON
    const data = sppd.map((item) => ({
      ...item,
      anggaran: item.anggaran.toString(),
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error("[GET /api/sppd]", error)
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 })
  }
}