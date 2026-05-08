"use client"

import { useState } from "react"
import { pdf } from "@react-pdf/renderer"
import SppdPdf from "./sppd-pdf"

type SppdData = {
  nomorSppd: string
  tujuan: string
  maksud: string
  tglBerangkat: string
  tglKembali: string
  transport: string
  status: string
  createdAt: string
  user: {
    nama: string
    nip: string | null
    jabatan: string | null
    divisi: string | null
  }
}

export default function DownloadPdfButton({ data }: { data: SppdData }) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const blob = await pdf(<SppdPdf data={data} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `SPPD-${data.nomorSppd}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={() => void handleDownload()}
      disabled={loading}
      style={{
        background: loading ? "#9ca3af" : "#dc2626",
        color: "white", border: "none",
        padding: "8px 16px", borderRadius: "6px",
        fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
        fontSize: "0.875rem",
      }}
    >
      {loading ? "Membuat PDF..." : "📄 Unduh PDF"}
    </button>
  )
}