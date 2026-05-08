import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ApprovalList from "./approval-list"

export default async function ApprovalPage() {
  const session = await auth()
  if (!session) redirect("/login")
  if (session.user.role === "PEGAWAI") redirect("/dashboard")

  const sppd = await prisma.pengajuanSPPD.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { nama: true, email: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "8px" }}>
        Approval SPPD
      </h1>
      <p style={{ color: "#666", marginBottom: "24px" }}>
        {sppd.length} pengajuan menunggu persetujuan.
      </p>
      <ApprovalList
        initialData={JSON.parse(JSON.stringify(sppd, (_, v) =>
          typeof v === "bigint" ? v.toString() : v
        ))}
        approverId={session.user.id}
      />
    </div>
  )
}