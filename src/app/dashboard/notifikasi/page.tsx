import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import NotifikasiClient from "./client"

export default async function NotifikasiPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = (session.user as { id: string }).id

  const notifikasi = await prisma.notifikasi.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      sppd: { select: { nomorSppd: true, tujuan: true } },
    },
  })

  const data = notifikasi.map(n => ({
    id: n.id,
    pesan: n.pesan,
    tipe: n.tipe,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
    sppd: n.sppd ? { nomorSppd: n.sppd.nomorSppd, tujuan: n.sppd.tujuan } : null,
  }))

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#1a1f36", margin: 0 }}>
          Notifikasi
        </h1>
        <p style={{ fontSize: "13px", color: "#8f95a3", margin: "4px 0 0" }}>
          Riwayat semua notifikasi yang kamu terima
        </p>
      </div>
      <NotifikasiClient data={data} />
    </div>
  )
}