import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ProfilClient from "./client"

export default async function ProfilPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = session.user.id as string

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      nama: true,
      email: true,
      nip: true,
      jabatan: true,
      divisi: true,
      role: true,
      foto: true,
      createdAt: true,
    },
  })

  if (!user) redirect("/login")

  return (
    <ProfilClient
      user={{
        id: user.id,
        nama: user.nama,
        email: user.email,
        nip: user.nip ?? "",
        jabatan: user.jabatan ?? "",
        divisi: user.divisi ?? "",
        role: user.role,
        foto: user.foto ?? null,
        createdAt: user.createdAt.toISOString(),
      }}
    />
  )
}