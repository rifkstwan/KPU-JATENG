import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import PengajuanForm from "./form"

export default async function PengajuanPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>
        Ajukan SPPD Baru
      </h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        Isi formulir di bawah untuk mengajukan perjalanan dinas.
      </p>
      <PengajuanForm userId={session.user.id} />
    </div>
  )
}