import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProfilClient from "./client"

export default async function ProfilPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = (session.user as { id: string }).id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, nama: true, nip: true, email: true,
      jabatan: true, divisi: true, role: true,
      createdAt: true,
      _count: { select: { pengajuan: true } },
    },
  })

  if (!user) redirect("/login")

  return (
    <ProfilClient
      user={{
        ...user,
        createdAt: user.createdAt.toISOString(),
      }}
    />
  )
}