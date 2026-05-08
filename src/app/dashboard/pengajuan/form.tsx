"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function PengajuanForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    tujuan: "",
    keperluan: "",
    tanggalBerangkat: "",
    tanggalKembali: "",
    transportasi: "DARAT",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/sppd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId }),
      })
      if (res.ok) {
        router.push("/dashboard/sppd")
        router.refresh()
      } else {
        alert("Gagal mengajukan SPPD. Coba lagi.")
      }
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: "100%", padding: "8px 12px", border: "1px solid #d1d5db",
    borderRadius: "6px", fontSize: "0.9rem", outline: "none",
    boxSizing: "border-box" as const,
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "560px", display: "flex", flexDirection: "column" as const, gap: "16px" }}>
      <div>
        <label style={{ display: "block", fontWeight: 600, marginBottom: "4px" }}>Tujuan</label>
        <input style={inputStyle} required value={form.tujuan}
          onChange={e => setForm({ ...form, tujuan: e.target.value })}
          placeholder="Contoh: Jakarta, DKI Jakarta" />
      </div>
      <div>
        <label style={{ display: "block", fontWeight: 600, marginBottom: "4px" }}>Keperluan / Maksud</label>
        <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" as const }}
          required value={form.keperluan}
          onChange={e => setForm({ ...form, keperluan: e.target.value })}
          placeholder="Jelaskan tujuan perjalanan dinas..." />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: "4px" }}>Tanggal Berangkat</label>
          <input type="date" style={inputStyle} required value={form.tanggalBerangkat}
            onChange={e => setForm({ ...form, tanggalBerangkat: e.target.value })} />
        </div>
        <div>
          <label style={{ display: "block", fontWeight: 600, marginBottom: "4px" }}>Tanggal Kembali</label>
          <input type="date" style={inputStyle} required value={form.tanggalKembali}
            onChange={e => setForm({ ...form, tanggalKembali: e.target.value })} />
        </div>
      </div>
      <div>
        <label style={{ display: "block", fontWeight: 600, marginBottom: "4px" }}>Transportasi</label>
        <select style={inputStyle} value={form.transportasi}
          onChange={e => setForm({ ...form, transportasi: e.target.value })}>
          <option value="DARAT">🚗 Darat</option>
          <option value="UDARA">✈️ Udara</option>
          <option value="KERETA">🚂 Kereta</option>
          <option value="LAUT">🚢 Laut</option>
        </select>
      </div>
      <button type="submit" disabled={loading} style={{
        background: loading ? "#9ca3af" : "#2563eb", color: "white",
        border: "none", padding: "10px 24px", borderRadius: "6px",
        fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
        alignSelf: "flex-start",
      }}>
        {loading ? "Mengajukan..." : "➕ Ajukan SPPD"}
      </button>
    </form>
  )
}