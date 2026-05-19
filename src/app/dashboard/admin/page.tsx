import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import UserList from "./user-list"

export default async function AdminPage() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard")

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
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

  const serialized = users.map(u => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }))

  const totalPegawai  = users.filter(u => u.role === "PEGAWAI").length
  const totalApprover = users.filter(u => u.role === "APPROVER").length
  const totalAdmin    = users.filter(u => u.role === "ADMIN").length

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "10px",
            background: "#e8edf7", color: "#00205b",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#1a1f36", margin: 0 }}>
            Manajemen User
          </h1>
        </div>
        <p style={{ fontSize: "13px", color: "#9ca3af", margin: 0, marginLeft: "46px" }}>
          {users.length} user terdaftar di sistem
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "24px" }}>
        {[
          { label: "Total User", value: users.length,  color: "#00205b", bg: "#e8edf7" },
          { label: "Pegawai",    value: totalPegawai,   color: "#1a6fc4", bg: "#e8f1fb" },
          { label: "Approver",   value: totalApprover,  color: "#0a6640", bg: "#e3f4ec" },
          { label: "Admin",      value: totalAdmin,     color: "#7c3aed", bg: "#ede9fe" },
        ].map(s => (
          <div key={s.label} style={{
            background: "#fff", borderRadius: "14px",
            border: "1px solid #eef0f4", padding: "18px 20px",
            display: "flex", alignItems: "center", gap: "14px",
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: "12px", background: s.bg,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <span style={{ fontSize: "18px", fontWeight: 800, color: s.color }}>{s.value}</span>
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabel User */}
      <UserList initialUsers={serialized} />
    </div>
  )
}