import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import UserList from "./user-list"

export default async function AdminPage() {
  const session = await auth()
  if (!session) redirect("/login")
  if (session.user.role !== "ADMIN") redirect("/dashboard")

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      nama: true,
      nip: true,
      email: true,
      jabatan: true,
      divisi: true,
      role: true,
      createdAt: true,
      _count: { select: { pengajuan: true } },
    },
  })

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>
        Manajemen User
      </h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        {users.length} user terdaftar di sistem.
      </p>
      <UserList initialUsers={JSON.parse(JSON.stringify(users))} />
    </div>
  )
}