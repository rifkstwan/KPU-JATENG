"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Role = "PEGAWAI" | "APPROVER" | "ADMIN"

type User = {
  id: string
  nama: string
  nip: string | null
  email: string
  jabatan: string | null
  divisi: string | null
  role: string
  createdAt: string
  _count: { pengajuan: number }
}

const roleConfig: Record<Role, { label: string; color: string; bg: string }> = {
  PEGAWAI:  { label: "Pegawai",  color: "#1a6fc4", bg: "#e8f1fb" },
  APPROVER: { label: "Approver", color: "#0a6640", bg: "#e3f4ec" },
  ADMIN:    { label: "Admin",    color: "#7c3aed", bg: "#ede9fe" },
}

// ── Icons ──
const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)
const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
)
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconClose = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconDoc = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
)

// ── Avatar ──
function Avatar({ nama, role }: { nama: string; role: string }) {
  const initials = nama.split(" ").map(n => n[0]).slice(0, 2).join("")
  const colors: Record<string, string> = {
    PEGAWAI:  "linear-gradient(135deg, #1a6fc4, #2d9bf0)",
    APPROVER: "linear-gradient(135deg, #0a6640, #12a05b)",
    ADMIN:    "linear-gradient(135deg, #7c3aed, #a855f7)",
  }
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%",
      background: colors[role] || "linear-gradient(135deg, #6b7280, #9ca3af)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: "12px", fontWeight: 700,
      flexShrink: 0, letterSpacing: "0.5px",
    }}>
      {initials}
    </div>
  )
}

// ── Modal ──
type ModalForm = {
  nama: string; divisi: string; email: string
  nip: string; jabatan: string; role: string; password: string
}

function UserModal({
  user, onClose, onSave, loading,
}: {
  user?: User | null
  onClose: () => void
  onSave: (form: ModalForm) => void
  loading: boolean
}) {
  const [form, setForm] = useState<ModalForm>({
    nama:     user?.nama     || "",
    divisi:   user?.divisi   || "",
    email:    user?.email    || "",
    nip:      user?.nip      || "",
    jabatan:  user?.jabatan  || "",
    role:     user?.role     || "PEGAWAI",
    password: "",
  })

  const set = (k: keyof ModalForm, v: string) => setForm(f => ({ ...f, [k]: v }))

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px",
    border: "1.5px solid #e2e5ec", borderRadius: "10px",
    fontSize: "13px", color: "#1a1f36", background: "#fff",
    outline: "none", fontFamily: "inherit",
    boxSizing: "border-box", transition: "border-color 0.15s",
  }
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "11px", fontWeight: 700,
    color: "#9ca3af", marginBottom: "6px",
    letterSpacing: "0.5px", textTransform: "uppercase",
  }
  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "#00205b")
  const blur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) =>
    (e.currentTarget.style.borderColor = "#e2e5ec")

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(15,20,40,0.4)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff", borderRadius: "16px",
          width: "100%", maxWidth: 500,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)", overflow: "hidden",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div style={{
          padding: "22px 24px 20px", borderBottom: "1px solid #f0f1f5",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#1a1f36" }}>
              {user ? "Edit User" : "Tambah User Baru"}
            </div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "3px" }}>
              {user ? `Edit data untuk ${user.nama}` : "Isi form untuk menambahkan user"}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: "8px",
            border: "1.5px solid #e2e5ec", background: "#fff",
            cursor: "pointer", color: "#6b7280",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <IconClose />
          </button>
        </div>

        {/* Body Modal */}
        <div style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Nama Lengkap</label>
              <input style={inputStyle} value={form.nama} required
                onChange={e => set("nama", e.target.value)}
                placeholder="Nama lengkap" onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={labelStyle}>Divisi</label>
              <input style={inputStyle} value={form.divisi}
                onChange={e => set("divisi", e.target.value)}
                placeholder="Divisi / Unit" onFocus={focus} onBlur={blur} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} type="email" value={form.email} required
              onChange={e => set("email", e.target.value)}
              placeholder="email@kpu.go.id" onFocus={focus} onBlur={blur} />
          </div>

          <div>
            <label style={labelStyle}>
              Password{" "}
              {user && <span style={{ color: "#c4b5fd", fontWeight: 400, textTransform: "none" }}>(kosongkan jika tidak diubah)</span>}
            </label>
            <input style={inputStyle} type="password"
              value={form.password} required={!user}
              onChange={e => set("password", e.target.value)}
              placeholder={user ? "Kosongkan jika tidak diubah" : "Min. 6 karakter"}
              onFocus={focus} onBlur={blur} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}>NIP</label>
              <input style={inputStyle} value={form.nip}
                onChange={e => set("nip", e.target.value)}
                placeholder="18 digit NIP" onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={labelStyle}>Jabatan</label>
              <input style={inputStyle} value={form.jabatan}
                onChange={e => set("jabatan", e.target.value)}
                placeholder="Jabatan" onFocus={focus} onBlur={blur} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Role</label>
            <div style={{ position: "relative" }}>
              <select
                style={{ ...inputStyle, cursor: "pointer", paddingRight: "36px", appearance: "none" }}
                value={form.role} onChange={e => set("role", e.target.value)}
                onFocus={focus} onBlur={blur}
              >
                <option value="PEGAWAI">Pegawai</option>
                <option value="APPROVER">Approver</option>
                <option value="ADMIN">Admin</option>
              </select>
              <div style={{
                position: "absolute", right: "12px", top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div style={{
          padding: "16px 24px 22px", borderTop: "1px solid #f0f1f5",
          display: "flex", gap: "10px", justifyContent: "flex-end",
        }}>
          <button onClick={onClose} disabled={loading} style={{
            padding: "10px 20px", borderRadius: "10px",
            border: "1.5px solid #e2e5ec", background: "#fff",
            fontSize: "13px", fontWeight: 600, color: "#4b5563", cursor: "pointer",
          }}>
            Batal
          </button>
          <button onClick={() => onSave(form)} disabled={loading} style={{
            padding: "10px 22px", borderRadius: "10px",
            border: "none", background: loading ? "#9ca3af" : "#00205b",
            fontSize: "13px", fontWeight: 700, color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
          }}>
            {loading ? "Menyimpan..." : user ? "Simpan Perubahan" : "Tambah User"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Komponen Utama ──
export default function UserList({ initialUsers }: { initialUsers: User[] }) {
  const router = useRouter()
  const [users, setUsers]                 = useState(initialUsers)
  const [search, setSearch]               = useState("")
  const [filterRole, setFilterRole]       = useState<"ALL" | Role>("ALL")
  const [showModal, setShowModal]         = useState(false)
  const [editUser, setEditUser]           = useState<User | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [loading, setLoading]             = useState(false)
  const [printing, setPrinting]           = useState(false)

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch =
      u.nama.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.nip || "").includes(q)
    const matchRole = filterRole === "ALL" || u.role === filterRole
    return matchSearch && matchRole
  })

  // ── Submit tambah/edit (terhubung ke API) ──
  const handleSave = async (form: ModalForm) => {
    setLoading(true)
    try {
      const url    = editUser ? `/api/admin/users/${editUser.id}` : "/api/admin/users"
      const method = editUser ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const data = await res.json()
        if (editUser) {
          setUsers(users.map(u => u.id === editUser.id ? { ...u, ...data } : u))
        } else {
          setUsers([...users, { ...data, _count: { pengajuan: 0 } }])
        }
        setShowModal(false)
        setEditUser(null)
        router.refresh()
      } else {
        const err = await res.json()
        alert(err.error || "Gagal menyimpan user.")
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Hapus (terhubung ke API) ──
  const handleDelete = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id))
        setDeleteConfirm(null)
        router.refresh()
      } else {
        alert("Gagal menghapus user.")
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Cetak Rekap ──
  const handlePrint = () => {
    setPrinting(true)
    const tanggalCetak = new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
    const filterLabel  = filterRole === "ALL" ? "Semua Role" : roleConfig[filterRole as Role]?.label ?? filterRole
    const totalPegawai  = filtered.filter(u => u.role === "PEGAWAI").length
    const totalApprover = filtered.filter(u => u.role === "APPROVER").length
    const totalAdmin    = filtered.filter(u => u.role === "ADMIN").length
    const totalSppd     = filtered.reduce((acc, u) => acc + u._count.pengajuan, 0)

    const rows = filtered.map((u, idx) => {
      const rc = roleConfig[u.role as Role] || { label: u.role, color: "#374151", bg: "#f3f4f6" }
      return `
        <tr>
          <td style="text-align:center">${idx + 1}</td>
          <td><div style="font-weight:700">${u.nama}</div><div style="color:#9ca3af;font-size:10px">${u.divisi || "—"}</div></td>
          <td style="font-size:11px;color:#6b7280">${u.nip || "—"}</td>
          <td style="font-size:11px;color:#6b7280">${u.jabatan || "—"}</td>
          <td style="font-size:11px;color:#6b7280">${u.email}</td>
          <td style="text-align:center">
            <span style="padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;background:${rc.bg};color:${rc.color}">
              ${rc.label}
            </span>
          </td>
          <td style="text-align:center;font-weight:700;color:#00205b">${u._count.pengajuan}</td>
          <td style="font-size:11px;color:#9ca3af">
            ${u.createdAt ? new Date(u.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
          </td>
        </tr>`
    }).join("")

    const printHTML = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"/>
<title>Rekap Data User — SPPD KPU</title><style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#1a1f36;padding:28px 32px;}
.kop{display:flex;align-items:center;gap:16px;border-bottom:3px solid #00205b;padding-bottom:14px;margin-bottom:20px;}
.kop-logo{width:54px;height:54px;background:#00205b;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:20px;flex-shrink:0;}
.kop-text h1{font-size:15px;font-weight:800;color:#00205b;}.kop-text p{font-size:11px;color:#6b7280;margin-top:2px;}
.judul{text-align:center;margin-bottom:18px;}.judul h2{font-size:16px;font-weight:800;color:#00205b;text-transform:uppercase;}
.judul p{font-size:12px;color:#6b7280;margin-top:4px;}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px;}
.stat-card{border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px;}
.stat-label{font-size:10px;color:#9ca3af;font-weight:600;text-transform:uppercase;}
.stat-value{font-size:22px;font-weight:800;margin-top:2px;line-height:1;}
table{width:100%;border-collapse:collapse;font-size:11px;}
thead tr{background:#00205b;color:#fff;}
thead th{padding:9px 10px;text-align:left;font-size:10px;font-weight:700;white-space:nowrap;}
tbody tr{border-bottom:1px solid #f3f4f6;}tbody tr:nth-child(even){background:#fafbfc;}
tbody td{padding:9px 10px;vertical-align:middle;}
tfoot td{padding:10px;font-weight:700;background:#f8f9fb;border-top:2px solid #00205b;}
.print-footer{margin-top:20px;display:flex;justify-content:space-between;align-items:flex-end;}
.ttd-block{text-align:center;}.ttd-space{height:56px;}
.ttd-nama{font-weight:700;border-top:1px solid #1a1f36;padding-top:4px;font-size:11px;}
.ttd-nip{font-size:10px;color:#6b7280;}
@media print{body{padding:0;}@page{size:A4 landscape;margin:15mm;}}
</style></head><body>
<div class="kop"><div class="kop-logo">KPU</div><div class="kop-text"><h1>KOMISI PEMILIHAN UMUM</h1><p>Sistem Informasi Manajemen Surat Perintah Perjalanan Dinas (SPPD)</p></div></div>
<div class="judul"><h2>Rekap Data User</h2><p>Filter: ${filterLabel} &nbsp;|&nbsp; Total: ${filtered.length} user &nbsp;|&nbsp; Dicetak: ${tanggalCetak}</p></div>
<div class="stats">
  <div class="stat-card"><div class="stat-label">Total User</div><div class="stat-value" style="color:#00205b">${filtered.length}</div></div>
  <div class="stat-card"><div class="stat-label">Pegawai</div><div class="stat-value" style="color:#1a6fc4">${totalPegawai}</div></div>
  <div class="stat-card"><div class="stat-label">Approver</div><div class="stat-value" style="color:#0a6640">${totalApprover}</div></div>
  <div class="stat-card"><div class="stat-label">Total SPPD</div><div class="stat-value" style="color:#7c3aed">${totalSppd}</div></div>
</div>
<table><thead><tr><th style="width:28px">No</th><th>Nama / Divisi</th><th>NIP</th><th>Jabatan</th><th>Email</th><th style="text-align:center">Role</th><th style="text-align:center">Jml SPPD</th><th>Tgl Bergabung</th></tr></thead>
<tbody>${rows || `<tr><td colspan="8" style="text-align:center;padding:24px;color:#9ca3af">Tidak ada data</td></tr>`}</tbody>
<tfoot><tr><td colspan="6">Total ${filtered.length} user (Pegawai: ${totalPegawai} | Approver: ${totalApprover} | Admin: ${totalAdmin})</td><td style="text-align:center;color:#7c3aed">${totalSppd}</td><td></td></tr></tfoot>
</table>
<div class="print-footer">
  <div style="font-size:11px;color:#6b7280"><p>Dokumen ini digenerate secara otomatis oleh sistem SPPD-KPU.</p><p>Dicetak pada: ${tanggalCetak}</p></div>
  <div class="ttd-block"><p style="font-size:11px">Mengetahui,</p><div class="ttd-space"></div><div class="ttd-nama">( _________________________ )</div><div class="ttd-nip">NIP. ____________________</div></div>
</div>
<script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}<\/script>
</body></html>`

    const win = window.open("", "_blank", "width=1100,height=750")
    if (win) { win.document.write(printHTML); win.document.close() }
    setTimeout(() => setPrinting(false), 1500)
  }

  const pill = (label: string, active: boolean, onClick: () => void) => (
    <button onClick={onClick} style={{
      padding: "7px 14px", borderRadius: "999px",
      border: `1.5px solid ${active ? "#00205b" : "#e2e5ec"}`,
      background: active ? "#00205b" : "#fff",
      color: active ? "#fff" : "#6b7280",
      fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
    }}>
      {label}
    </button>
  )

  return (
    <>
      {/* Card tabel */}
      <div style={{
        background: "#fff", borderRadius: "14px",
        border: "1px solid #eef0f4", overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}>
        {/* Toolbar */}
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid #f5f6fa",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: "12px", flexWrap: "wrap",
        }}>
          {/* Search */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            background: "#f5f6fa", borderRadius: "10px",
            padding: "9px 14px", border: "1px solid #eef0f4",
            flex: "1 1 220px", maxWidth: 300,
          }}>
            <IconSearch />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, email, NIP..."
              style={{
                border: "none", background: "transparent",
                fontSize: "13px", color: "#1a1f36", outline: "none",
                width: "100%", fontFamily: "inherit",
              }} />
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {pill("Semua",    filterRole === "ALL",      () => setFilterRole("ALL"))}
            {pill("Pegawai",  filterRole === "PEGAWAI",  () => setFilterRole("PEGAWAI"))}
            {pill("Approver", filterRole === "APPROVER", () => setFilterRole("APPROVER"))}
            {pill("Admin",    filterRole === "ADMIN",    () => setFilterRole("ADMIN"))}
          </div>

          {/* Tombol kanan */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button onClick={handlePrint} disabled={printing || filtered.length === 0} style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "9px 16px", borderRadius: "10px",
              border: "1.5px solid #bfdbfe",
              background: printing || filtered.length === 0 ? "#f3f4f6" : "#eff6ff",
              color: printing || filtered.length === 0 ? "#9ca3af" : "#1d4ed8",
              fontSize: "13px", fontWeight: 700,
              cursor: printing || filtered.length === 0 ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              {printing ? "Membuka..." : "Cetak Rekap"}
            </button>

            <button onClick={() => { setEditUser(null); setShowModal(true) }} style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "9px 18px", borderRadius: "10px",
              border: "none", background: "#00205b",
              color: "#fff", fontSize: "13px", fontWeight: 700,
              cursor: "pointer", flexShrink: 0,
            }}>
              <IconPlus /> Tambah User
            </button>
          </div>
        </div>

        {/* Tabel */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f8f9fc" }}>
                {["User", "Email", "NIP", "Jabatan", "Role", "SPPD", "Aksi"].map(h => (
                  <th key={h} style={{
                    padding: "11px 16px", textAlign: "left",
                    fontSize: "11px", fontWeight: 700, color: "#9ca3af",
                    letterSpacing: "0.5px", textTransform: "uppercase",
                    borderBottom: "1px solid #f0f1f5", whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
                    Tidak ada user ditemukan
                  </td>
                </tr>
              ) : filtered.map((u, i) => {
                const rc = roleConfig[u.role as Role] || { label: u.role, color: "#374151", bg: "#f3f4f6" }
                return (
                  <tr key={u.id}
                    style={{ borderBottom: "1px solid #f5f6fa", background: i % 2 === 0 ? "#fff" : "#fafbfc", transition: "background 0.1s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f5f8ff")}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "#fafbfc")}
                  >
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <Avatar nama={u.nama} role={u.role} />
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: "#1a1f36" }}>{u.nama}</div>
                          <div style={{ fontSize: "11px", color: "#9ca3af" }}>{u.divisi || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "12px", color: "#6b7280" }}>{u.email}</td>
                    <td style={{ padding: "14px 16px", fontSize: "12px", color: "#6b7280", fontVariantNumeric: "tabular-nums" }}>{u.nip || "—"}</td>
                    <td style={{ padding: "14px 16px", fontSize: "12px", color: "#6b7280" }}>{u.jabatan || "—"}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        display: "inline-block", padding: "4px 10px", borderRadius: "999px",
                        background: rc.bg, color: rc.color,
                        fontSize: "11px", fontWeight: 700, letterSpacing: "0.3px",
                      }}>
                        {rc.label}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "4px 10px", borderRadius: "8px",
                        background: "#f5f6fa", color: "#6b7280",
                        fontSize: "12px", fontWeight: 600,
                      }}>
                        <IconDoc /> {u._count.pengajuan}
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => { setEditUser(u); setShowModal(true) }} style={{
                          display: "flex", alignItems: "center", gap: "5px",
                          padding: "6px 12px", borderRadius: "8px",
                          border: "1.5px solid #e2e5ec", background: "#fff",
                          fontSize: "12px", fontWeight: 600, color: "#374151", cursor: "pointer",
                        }}>
                          <IconEdit /> Edit
                        </button>

                        {deleteConfirm === u.id ? (
                          <div style={{ display: "flex", gap: "4px" }}>
                            <button onClick={() => void handleDelete(u.id)} disabled={loading} style={{
                              padding: "6px 10px", borderRadius: "8px",
                              border: "none", background: "#dc2626",
                              fontSize: "12px", fontWeight: 600, color: "#fff",
                              cursor: loading ? "not-allowed" : "pointer",
                            }}>
                              {loading ? "..." : "Hapus"}
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} style={{
                              padding: "6px 10px", borderRadius: "8px",
                              border: "1.5px solid #e2e5ec", background: "#fff",
                              fontSize: "12px", fontWeight: 600, color: "#6b7280", cursor: "pointer",
                            }}>
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(u.id)} style={{
                            display: "flex", alignItems: "center", gap: "5px",
                            padding: "6px 12px", borderRadius: "8px",
                            border: "1.5px solid #fecaca", background: "#fff5f5",
                            fontSize: "12px", fontWeight: 600, color: "#dc2626", cursor: "pointer",
                          }}>
                            <IconTrash /> Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer tabel */}
        <div style={{
          padding: "12px 20px", borderTop: "1px solid #f0f1f5",
          fontSize: "12px", color: "#9ca3af",
        }}>
          Menampilkan {filtered.length} dari {users.length} user
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <UserModal
          user={editUser}
          onClose={() => { setShowModal(false); setEditUser(null) }}
          onSave={handleSave}
          loading={loading}
        />
      )}
    </>
  )
}