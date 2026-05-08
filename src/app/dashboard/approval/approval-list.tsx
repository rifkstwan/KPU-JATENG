"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type SppdItem = {
  id: string
  nomorSppd: string
  tujuan: string
  maksud: string
  tglBerangkat: string
  tglKembali: string
  transport: string
  user: { nama: string; email: string }
}

export default function ApprovalList({
  initialData,
  approverId,
}: {
  initialData: SppdItem[]
  approverId: string
}) {
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleAction = async (id: string, keputusan: "APPROVED" | "REJECTED") => {
    setLoadingId(id)
    await fetch(`/api/sppd/${id}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keputusan, approverId }),
    })
    setData(data.filter(s => s.id !== id))
    setLoadingId(null)
    router.refresh()
  }

  if (data.length === 0) {
    return (
      <p style={{ color: "#666" }}>
        Tidak ada pengajuan yang menunggu persetujuan.
      </p>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {data.map(s => (
        <div key={s.id} style={{
          border: "1px solid #e5e7eb", borderRadius: "8px",
          padding: "16px", background: "white",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "4px" }}>
                {s.nomorSppd}
              </p>
              <p style={{ color: "#555", fontSize: "0.9rem" }}>👤 {s.user.nama}</p>
              <p style={{ color: "#555", fontSize: "0.9rem" }}>📍 {s.tujuan}</p>
              <p style={{ color: "#555", fontSize: "0.9rem" }}>📝 {s.maksud}</p>
              <p style={{ color: "#888", fontSize: "0.8rem", marginTop: "4px" }}>
                {new Date(s.tglBerangkat).toLocaleDateString("id-ID")} →{" "}
                {new Date(s.tglKembali).toLocaleDateString("id-ID")} · {s.transport}
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
              <button
                disabled={loadingId === s.id}
                onClick={() => handleAction(s.id, "APPROVED")}
                style={{
                  background: "#16a34a", color: "white", border: "none",
                  padding: "8px 16px", borderRadius: "6px",
                  cursor: "pointer", fontWeight: 600,
                }}>
                ✅ Setujui
              </button>
              <button
                disabled={loadingId === s.id}
                onClick={() => handleAction(s.id, "REJECTED")}
                style={{
                  background: "#dc2626", color: "white", border: "none",
                  padding: "8px 16px", borderRadius: "6px",
                  cursor: "pointer", fontWeight: 600,
                }}>
                ❌ Tolak
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}