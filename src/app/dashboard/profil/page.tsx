import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ProfilForm from "./profil-form"

export default async function ProfilPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      nama: true,
      nip: true,
      email: true,
      jabatan: true,
      divisi: true,
      role: true,
    },
  })

  if (!user) redirect("/login")

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>
        Profil Saya
      </h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        Kelola informasi akun dan keamanan kamu.
      </p>
      <ProfilForm user={user} />
    </div>
  )
}