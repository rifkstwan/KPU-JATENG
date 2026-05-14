import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import NotifikasiClient from "./client"

export default async function NotifikasiPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user   = session.user as { id: string; role?: string }
  const userId = user.id
  const role   = user.role ?? "PEGAWAI"

  const notifikasi = await prisma.notifikasi.findMany({
    where: role === "ADMIN" ? {} : { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      sppd: { select: { nomorSppd: true, tujuan: true } },
      user: { select: { nama: true } },
    },
  })

  const data = notifikasi.map(n => ({
    id:        n.id,
    pesan:     n.pesan,
    tipe:      n.tipe,
    isRead:    n.isRead,
    createdAt: n.createdAt.toISOString(),
    sppd:      n.sppd
      ? { nomorSppd: n.sppd.nomorSppd, tujuan: n.sppd.tujuan }
      : null,
    userName: n.user?.nama ?? null,
  }))

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#1a1f36", margin: 0 }}>
          Notifikasi
        </h1>
        <p style={{ fontSize: "13px", color: "#8f95a3", margin: "4px 0 0" }}>
          {role === "ADMIN"
            ? "Semua notifikasi yang dikirim sistem ke seluruh pengguna"
            : "Riwayat semua notifikasi yang kamu terima"}
        </p>
      </div>
      <NotifikasiClient data={data} isAdmin={role === "ADMIN"} />
    </div>
  )
}