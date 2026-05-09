import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import ProfilClient from "./profil-client"

export default async function ProfilPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const name = session.user.name || "Nama Pengguna"
  const email = session.user.email || "email@kpu.go.id"
  const role = (session.user as any).role || "PEGAWAI"

  return (
    <ProfilClient
      name={name}
      email={email}
      role={role}
    />
  )
}