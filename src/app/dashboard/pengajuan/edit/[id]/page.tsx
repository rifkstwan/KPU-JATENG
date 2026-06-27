"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

export default function EditSPPDPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [loadingData, setLoadingData] = useState(true)
  const [loadingAction, setLoadingAction] = useState<"SAVE" | "SUBMIT" | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    tujuan: "",
    maksud: "",
    tglBerangkat: "",
    tglKembali: "",
    tempatBerangkat: "Semarang",
    tingkatBiaya: "B",
    kodeAkun: "524119",
    transport: "DARAT",
    anggaran: "",
    catatan: "",
  })

  useEffect(() => {
    fetch(`/api/sppd/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { alert("SPPD tidak ditemukan"); router.push("/dashboard/sppd"); return }
        if (!["DRAFT", "REJECTED"].includes(data.status)) {
          alert("Hanya DRAFT/REJECTED yang bisa diedit")
          router.push("/dashboard/sppd")
          return
        }
        setForm({
          tujuan: data.tujuan ?? "",
          maksud: data.maksud ?? "",
          tglBerangkat: data.tglBerangkat?.slice(0, 10) ?? "",
          tglKembali: data.tglKembali?.slice(0, 10) ?? "",
          tempatBerangkat: data.tempatBerangkat ?? "Semarang",
          tingkatBiaya: data.tingkatBiaya ?? "B",
          kodeAkun: data.kodeAkun ?? "524119",
          transport: data.transport ?? "DARAT",
          anggaran: data.anggaran && data.anggaran !== "0"
            ? Number(data.anggaran).toLocaleString("id-ID")
            : "",
          catatan: data.catatan ?? "",
        })
      })
      .finally(() => setLoadingData(false))
  }, [id])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.tujuan.trim()) e.tujuan = "Tujuan wajib diisi"
    if (!form.maksud.trim()) e.maksud = "Maksud wajib diisi"
    if (!form.tglBerangkat) e.tglBerangkat = "Tanggal berangkat wajib diisi"
    if (!form.tglKembali) e.tglKembali = "Tanggal kembali wajib diisi"
    if (form.tglBerangkat && form.tglKembali) {
      if (new Date(form.tglKembali) < new Date(form.tglBerangkat))
        e.tglKembali = "Tanggal kembali tidak boleh sebelum berangkat"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setLoadingAction("SAVE")
    try {
      const res = await fetch(`/api/sppd/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          anggaran: Number(form.anggaran.replace(/\D/g, "") || "0"),
        }),
      })
      if (res.ok) {
        router.push("/dashboard/sppd")
        router.refresh()
      } else {
        const d = await res.json()
        alert(d?.error || "Gagal menyimpan")
      }
    } catch { alert("Terjadi kesalahan jaringan") }
    finally { setLoadingAction(null) }
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoadingAction("SUBMIT")
    try {
      // Simpan dulu, lalu submit
      const saveRes = await fetch(`/api/sppd/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          anggaran: Number(form.anggaran.replace(/\D/g, "") || "0"),
        }),
      })
      if (!saveRes.ok) { alert("Gagal menyimpan"); return }

      const submitRes = await fetch(`/api/pengajuan/${id}/submit`, { method: "POST" })
      if (submitRes.ok) {
        router.push("/dashboard/sppd")
        router.refresh()
      } else {
        const d = await submitRes.json()
        alert(d?.error || "Gagal mengirim pengajuan")
      }
    } catch { alert("Terjadi kesalahan jaringan") }
    finally { setLoadingAction(null) }
  }

  const handleAnggaran = (val: string) => {
    const num = val.replace(/\D/g, "")
    setForm({ ...form, anggaran: num ? Number(num).toLocaleString("id-ID") : "" })
  }

  const inputCls = (field: string) =>
    `w-full border rounded-lg px-3 py-2 text-sm outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 ${errors[field] ? "border-red-400" : "border-gray-200"}`

  const transportOptions = ["DARAT", "UDARA", "KERETA", "LAUT"]

  if (loadingData) return (
    <div className="flex items-center justify-center py-32 text-gray-400 text-sm">
      Memuat data...
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit SPPD</h1>
        <p className="text-sm text-gray-500 mt-1">Perbarui data pengajuan SPPD</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-2xl space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Tujuan Perjalanan</label>
          <input value={form.tujuan} onChange={e => setForm({ ...form, tujuan: e.target.value })}
            className={inputCls("tujuan")} placeholder="Contoh: Jakarta, DKI Jakarta" />
          {errors.tujuan && <p className="text-xs text-red-500 mt-1">{errors.tujuan}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Keperluan / Maksud</label>
          <textarea value={form.maksud} onChange={e => setForm({ ...form, maksud: e.target.value })}
            rows={3} className={inputCls("maksud")} />
          {errors.maksud && <p className="text-xs text-red-500 mt-1">{errors.maksud}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Berangkat</label>
            <input type="date" value={form.tglBerangkat}
              onChange={e => setForm({ ...form, tglBerangkat: e.target.value })}
              className={inputCls("tglBerangkat")} />
            {errors.tglBerangkat && <p className="text-xs text-red-500 mt-1">{errors.tglBerangkat}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tanggal Kembali</label>
            <input type="date" value={form.tglKembali} min={form.tglBerangkat}
              onChange={e => setForm({ ...form, tglKembali: e.target.value })}
              className={inputCls("tglKembali")} />
            {errors.tglKembali && <p className="text-xs text-red-500 mt-1">{errors.tglKembali}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tempat Berangkat</label>
            <input value={form.tempatBerangkat}
              onChange={e => setForm({ ...form, tempatBerangkat: e.target.value })}
              className={inputCls("tempatBerangkat")} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tingkat Biaya</label>
            <input value={form.tingkatBiaya}
              onChange={e => setForm({ ...form, tingkatBiaya: e.target.value })}
              className={inputCls("tingkatBiaya")} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Kode Akun</label>
            <input value={form.kodeAkun}
              onChange={e => setForm({ ...form, kodeAkun: e.target.value })}
              className={inputCls("kodeAkun")} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Moda Transportasi</label>
          <div className="grid grid-cols-4 gap-2">
            {transportOptions.map(opt => (
              <button key={opt} type="button" onClick={() => setForm({ ...form, transport: opt })}
                className={`py-2 rounded-lg border text-xs font-medium transition ${
                  form.transport === opt
                    ? "border-blue-900 bg-blue-50 text-blue-900"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}>
                {opt.charAt(0) + opt.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Estimasi Anggaran <span className="font-normal text-gray-400 text-xs">(opsional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Rp</span>
            <input value={form.anggaran} onChange={e => handleAnggaran(e.target.value)}
              className={`${inputCls("anggaran")} pl-9`} placeholder="0" inputMode="numeric" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Catatan <span className="font-normal text-gray-400 text-xs">(opsional)</span>
          </label>
          <textarea value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })}
            rows={3} className={inputCls("catatan")} />
        </div>

        <div className="flex gap-3 pt-2 justify-end">
          <button onClick={() => router.back()} disabled={loadingAction !== null}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Batal
          </button>
          <button onClick={handleSave} disabled={loadingAction !== null}
            className="px-4 py-2 rounded-lg border border-blue-900 text-blue-900 text-sm font-semibold hover:bg-blue-50 disabled:opacity-50">
            {loadingAction === "SAVE" ? "Menyimpan..." : "Simpan Draft"}
          </button>
          <button onClick={handleSubmit} disabled={loadingAction !== null}
            className="px-4 py-2 rounded-lg bg-blue-900 text-white text-sm font-bold hover:bg-blue-800 disabled:opacity-50">
            {loadingAction === "SUBMIT" ? "Mengirim..." : "Kirim Pengajuan"}
          </button>
        </div>
      </div>
    </div>
  )
}
