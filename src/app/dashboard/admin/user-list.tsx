"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

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

const roleColor: Record<string, string> = {
  ADMIN: "#7c3aed",
  APPROVER: "#01696f",
  PEGAWAI: "#2563eb",
}
const roleBg: Record<string, string> = {
  ADMIN: "#ede9fe",
  APPROVER: "#cedcd8",
  PEGAWAI: "#dbeafe",
}
const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  APPROVER: "Approver",
  PEGAWAI: "Pegawai",
}

export default function UserList({ initialUsers }: { initialUsers: User[] }) {
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [printing, setPrinting] = useState(false)
  const [search, setSearch] = useState("")
  const [filterRole, setFilterRole] = useState("ALL")
  const [form, setForm] = useState({
    nama: "", email: "", nip: "", jabatan: "", divisi: "",
    role: "PEGAWAI", password: "",
  })

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch =
      u.nama.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.nip || "").includes(q)
    const matchRole = filterRole === "ALL" || u.role === filterRole
    return matchSearch && matchRole
  })

  const inputStyle = {
    width: "100%", padding: "8px 12px", border: "1px solid #d1d5db",
    borderRadius: "6px", fontSize: "0.875rem", outline: "none",
    boxSizing: "border-box" as const,
  }

  const openAdd = () => {
    setEditUser(null)
    setForm({ nama: "", email: "", nip: "", jabatan: "", divisi: "", role: "PEGAWAI", password: "" })
    setShowModal(true)
  }

  const openEdit = (u: User) => {
    setEditUser(u)
    setForm({ nama: u.nama, email: u.email, nip: u.nip || "", jabatan: u.jabatan || "", divisi: u.divisi || "", role: u.role, password: "" })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingId("form")
    try {
      const url = editUser ? `/api/admin/users/${editUser.id}` : "/api/admin/users"
      const method = editUser ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setShowModal(false)
        router.refresh()
        const data = await res.json()
        if (editUser) {
          setUsers(users.map(u => u.id === editUser.id ? { ...u, ...data } : u))
        } else {
          setUsers([...users, { ...data, _count: { pengajuan: 0 } }])
        }
      } else {
        const err = await res.json()
        alert(err.error || "Gagal menyimpan user.")
      }
    } finally {
      setLoadingId(null)
    }
  }

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus user "${nama}"? Semua data SPPD-nya akan ikut terhapus.`)) return
    setLoadingId(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      if (res.ok) setUsers(users.filter(u => u.id !== id))
      else alert("Gagal menghapus user.")
    } finally {
      setLoadingId(null)
    }
  }

  // ── CETAK REKAP USER ──
  const handlePrint = () => {
    setPrinting(true)
    const tanggalCetak = new Date().toLocaleDateString("id-ID", {
      day: "2-digit", month: "long", year: "numeric",
    })
    const filterLabel =
      filterRole === "ALL" ? "Semua Role" : roleLabel[filterRole] ?? filterRole

    const totalPegawai  = filtered.filter(u => u.role === "PEGAWAI").length
    const totalApprover = filtered.filter(u => u.role === "APPROVER").length
    const totalAdmin    = filtered.filter(u => u.role === "ADMIN").length
    const totalSppd     = filtered.reduce((acc, u) => acc + u._count.pengajuan, 0)

    const rows = filtered.map((u, idx) => `
      <tr>
        <td style="text-align:center">${idx + 1}</td>
        <td>
          <div style="font-weight:700">${u.nama}</div>
          <div style="color:#9ca3af;font-size:10px">${u.divisi || "—"}</div>
        </td>
        <td style="font-size:11px;color:#6b7280;font-variant-numeric:tabular-nums">
          ${u.nip || "—"}
        </td>
        <td style="font-size:11px;color:#6b7280">${u.jabatan || "—"}</td>
        <td style="font-size:11px;color:#6b7280">${u.email}</td>
        <td style="text-align:center">
          <span style="padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;
            background:${roleBg[u.role] || "#f3f4f6"};color:${roleColor[u.role] || "#374151"}">
            ${roleLabel[u.role] ?? u.role}
          </span>
        </td>
        <td style="text-align:center;font-weight:700;color:#00205b">${u._count.pengajuan}</td>
        <td style="font-size:11px;color:#9ca3af">
          ${u.createdAt
            ? new Date(u.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
            : "—"}
        </td>
      </tr>
    `).join("")

    const printHTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8"/>
  <title>Rekap Data User — SPPD KPU</title>
  <style>
    * { box-sizing:border-box;margin:0;padding:0; }
    body { font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#1a1f36;padding:28px 32px; }
    .kop { display:flex;align-items:center;gap:16px;border-bottom:3px solid #00205b;padding-bottom:14px;margin-bottom:20px; }
    .kop-logo { width:54px;height:54px;background:#00205b;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:20px;flex-shrink:0; }
    .kop-text h1 { font-size:15px;font-weight:800;color:#00205b; }
    .kop-text p  { font-size:11px;color:#6b7280;margin-top:2px; }
    .judul { text-align:center;margin-bottom:18px; }
    .judul h2 { font-size:16px;font-weight:800;color:#00205b;text-transform:uppercase;letter-spacing:0.5px; }
    .judul p  { font-size:12px;color:#6b7280;margin-top:4px; }
    .stats { display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px; }
    .stat-card { border:1px solid #e5e7eb;border-radius:8px;padding:10px 14px; }
    .stat-label { font-size:10px;color:#9ca3af;font-weight:600;text-transform:uppercase; }
    .stat-value { font-size:22px;font-weight:800;margin-top:2px;line-height:1; }
    .stat-sub   { font-size:10px;color:#aab0c0;margin-top:3px; }
    table { width:100%;border-collapse:collapse;font-size:11px; }
    thead tr { background:#00205b;color:#fff; }
    thead th { padding:9px 10px;text-align:left;font-size:10px;font-weight:700;letter-spacing:0.05em;white-space:nowrap; }
    tbody tr { border-bottom:1px solid #f3f4f6; }
    tbody tr:nth-child(even) { background:#fafbfc; }
    tbody td { padding:9px 10px;vertical-align:middle; }
    tfoot td { padding:10px 10px;font-weight:700;background:#f8f9fb;border-top:2px solid #00205b; }
    .print-footer { margin-top:20px;display:flex;justify-content:space-between;align-items:flex-end; }
    .ttd-block { text-align:center; }
    .ttd-space { height:56px; }
    .ttd-nama { font-weight:700;border-top:1px solid #1a1f36;padding-top:4px;font-size:11px; }
    .ttd-nip  { font-size:10px;color:#6b7280; }
    @media print { body{padding:0;} @page{size:A4 landscape;margin:15mm;} }
  </style>
</head>
<body>
  <div class="kop">
    <div class="kop-logo">KPU</div>
    <div class="kop-text">
      <h1>KOMISI PEMILIHAN UMUM</h1>
      <p>Sistem Informasi Manajemen Surat Perintah Perjalanan Dinas (SPPD)</p>
    </div>
  </div>
  <div class="judul">
    <h2>Rekap Data User</h2>
    <p>Filter: ${filterLabel} &nbsp;|&nbsp; Total: ${filtered.length} user &nbsp;|&nbsp; Dicetak: ${tanggalCetak}</p>
  </div>
  <div class="stats">
    <div class="stat-card"><div class="stat-label">Total User</div><div class="stat-value" style="color:#00205b">${filtered.length}</div><div class="stat-sub">Terdaftar</div></div>
    <div class="stat-card"><div class="stat-label">Pegawai</div><div class="stat-value" style="color:#2563eb">${totalPegawai}</div><div class="stat-sub">User aktif</div></div>
    <div class="stat-card"><div class="stat-label">Approver</div><div class="stat-value" style="color:#01696f">${totalApprover}</div><div class="stat-sub">Pejabat</div></div>
    <div class="stat-card"><div class="stat-label">Total SPPD</div><div class="stat-value" style="color:#7c3aed">${totalSppd}</div><div class="stat-sub">Pengajuan semua user</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width:28px">No</th>
        <th>Nama / Divisi</th>
        <th>NIP</th>
        <th>Jabatan</th>
        <th>Email</th>
        <th style="text-align:center">Role</th>
        <th style="text-align:center">Jml SPPD</th>
        <th>Tgl Bergabung</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan="8" style="text-align:center;padding:24px;color:#9ca3af">Tidak ada data user</td></tr>`}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="6" style="padding:10px">
          Total ${filtered.length} user (Pegawai: ${totalPegawai} | Approver: ${totalApprover} | Admin: ${totalAdmin})
        </td>
        <td style="text-align:center;color:#7c3aed">${totalSppd}</td>
        <td></td>
      </tr>
    </tfoot>
  </table>
  <div class="print-footer">
    <div style="font-size:11px;color:#6b7280">
      <p>Dokumen ini digenerate secara otomatis oleh sistem SPPD-KPU.</p>
      <p>Dicetak pada: ${tanggalCetak}</p>
    </div>
    <div class="ttd-block">
      <p style="font-size:11px">Mengetahui,</p>
      <div class="ttd-space"></div>
      <div class="ttd-nama">( _________________________ )</div>
      <div class="ttd-nip">NIP. ____________________</div>
    </div>
  </div>
  <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}<\/script>
</body>
</html>`

    const win = window.open("", "_blank", "width=1100,height=750")
    if (win) { win.document.write(printHTML); win.document.close() }
    setTimeout(() => setPrinting(false), 1500)
  }

  return (
    <>
      {/* Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", gap: "10px",
        marginBottom: "16px", flexWrap: "wrap",
      }}>
        {/* Search */}
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: "#f5f6fa", borderRadius: "8px",
          padding: "8px 12px", border: "1px solid #eef0f4",
          flex: "1 1 200px", maxWidth: 280,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama, email, NIP..."
            style={{
              border: "none", background: "transparent",
              fontSize: "13px", color: "#1a1f36", outline: "none",
              width: "100%", fontFamily: "inherit",
            }}
          />
        </div>

        {/* Filter Role Pills */}
        {(["ALL", "PEGAWAI", "APPROVER", "ADMIN"] as const).map(r => (
          <button key={r} onClick={() => setFilterRole(r)} style={{
            padding: "7px 14px", borderRadius: "999px",
            border: `1.5px solid ${filterRole === r ? "#00205b" : "#e2e5ec"}`,
            background: filterRole === r ? "#00205b" : "#fff",
            color: filterRole === r ? "#fff" : "#6b7280",
            fontSize: "12px", fontWeight: 600, cursor: "pointer",
            transition: "all 0.15s",
          }}>
            {r === "ALL" ? "Semua" : roleLabel[r]}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Tombol Cetak */}
        <button
          onClick={handlePrint}
          disabled={printing || filtered.length === 0}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "8px 16px", borderRadius: "8px",
            border: "1.5px solid #bfdbfe",
            background: printing || filtered.length === 0 ? "#f3f4f6" : "#eff6ff",
            color: printing || filtered.length === 0 ? "#9ca3af" : "#1d4ed8",
            fontSize: "12px", fontWeight: 700,
            cursor: printing || filtered.length === 0 ? "not-allowed" : "pointer",
            transition: "all 150ms ease", whiteSpace: "nowrap",
          }}
        >
          {printing ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ animation: "spin 1s linear infinite" }}>
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              Membuka...
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Cetak Rekap User
            </>
          )}
        </button>

        {/* Tombol Tambah */}
        <button onClick={openAdd} style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: "#01696f", color: "white", border: "none",
          padding: "9px 18px", borderRadius: "8px",
          fontWeight: 700, cursor: "pointer", fontSize: "13px",
          whiteSpace: "nowrap",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Tambah User
        </button>
      </div>

      {/* Info jumlah */}
      <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "10px" }}>
        Menampilkan {filtered.length} dari {users.length} user
      </div>

      {/* Tabel */}
      <div style={{
        background: "white", border: "1px solid #e5e7eb",
        borderRadius: "8px", overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Nama", "Email", "NIP", "Jabatan", "Role", "SPPD", "Aksi"].map(h => (
                <th key={h} style={{
                  padding: "10px 16px", textAlign: "left",
                  fontSize: "0.75rem", color: "#666", fontWeight: 600,
                  borderBottom: "1px solid #e5e7eb",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{
                  padding: "40px", textAlign: "center",
                  color: "#9ca3af", fontSize: "14px",
                }}>
                  Tidak ada user ditemukan
                </td>
              </tr>
            ) : filtered.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{u.nama}</div>
                  <div style={{ fontSize: "0.75rem", color: "#888" }}>{u.divisi || "-"}</div>
                </td>
                <td style={{ padding: "12px 16px", fontSize: "0.875rem", color: "#555" }}>
                  {u.email}
                </td>
                <td style={{ padding: "12px 16px", fontSize: "0.875rem", color: "#555" }}>
                  {u.nip || "-"}
                </td>
                <td style={{ padding: "12px 16px", fontSize: "0.875rem", color: "#555" }}>
                  {u.jabatan || "-"}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    background: roleBg[u.role] || "#f3f4f6",
                    color: roleColor[u.role] || "#374151",
                    padding: "2px 8px", borderRadius: "9999px",
                    fontSize: "0.75rem", fontWeight: 600,
                  }}>
                    {roleLabel[u.role] ?? u.role}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: "0.875rem", color: "#555", textAlign: "center" }}>
                  {u._count.pengajuan}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => openEdit(u)} style={{
                      background: "none", border: "1px solid #01696f",
                      color: "#01696f", padding: "4px 10px",
                      borderRadius: "4px", cursor: "pointer",
                      fontSize: "0.75rem", fontWeight: 600,
                      display: "flex", alignItems: "center", gap: "4px",
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                    <button
                      disabled={loadingId === u.id}
                      onClick={() => void handleDelete(u.id, u.nama)}
                      style={{
                        background: "none", border: "1px solid #dc2626",
                        color: "#dc2626", padding: "4px 10px",
                        borderRadius: "4px", cursor: "pointer",
                        fontSize: "0.75rem", fontWeight: 600,
                        display: "flex", alignItems: "center", gap: "4px",
                      }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                      </svg>
                      {loadingId === u.id ? "..." : "Hapus"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 999,
        }}>
          <div style={{
            background: "white", borderRadius: "10px",
            padding: "24px", width: "480px", maxWidth: "90vw",
            maxHeight: "90vh", overflowY: "auto",
          }}>
            <h2 style={{ fontWeight: 700, marginBottom: "20px" }}>
              {editUser ? "Edit User" : "Tambah User Baru"}
            </h2>
            <form onSubmit={e => void handleSubmit(e)} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "4px", fontSize: "0.875rem" }}>Nama Lengkap</label>
                <input style={inputStyle} required value={form.nama}
                  onChange={e => setForm({ ...form, nama: e.target.value })} />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "4px", fontSize: "0.875rem" }}>Email</label>
                <input type="email" style={inputStyle} required value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "4px", fontSize: "0.875rem" }}>
                  Password {editUser && <span style={{ color: "#999", fontWeight: 400 }}>(kosongkan jika tidak diubah)</span>}
                </label>
                <input type="password" style={inputStyle}
                  required={!editUser} value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder={editUser ? "Kosongkan jika tidak diubah" : "Min. 6 karakter"} />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "4px", fontSize: "0.875rem" }}>NIP</label>
                <input style={inputStyle} value={form.nip}
                  onChange={e => setForm({ ...form, nip: e.target.value })}
                  placeholder="Nomor Induk Pegawai" />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "4px", fontSize: "0.875rem" }}>Jabatan</label>
                <input style={inputStyle} value={form.jabatan}
                  onChange={e => setForm({ ...form, jabatan: e.target.value })} />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "4px", fontSize: "0.875rem" }}>Divisi</label>
                <input style={inputStyle} value={form.divisi}
                  onChange={e => setForm({ ...form, divisi: e.target.value })} />
              </div>
              <div>
                <label style={{ display: "block", fontWeight: 600, marginBottom: "4px", fontSize: "0.875rem" }}>Role</label>
                <select style={inputStyle} value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="PEGAWAI">PEGAWAI</option>
                  <option value="APPROVER">APPROVER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end", marginTop: "4px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{
                  background: "none", border: "1px solid #d1d5db",
                  padding: "8px 20px", borderRadius: "6px",
                  cursor: "pointer", fontWeight: 600, fontSize: "0.875rem",
                }}>
                  Batal
                </button>
                <button type="submit" disabled={loadingId === "form"} style={{
                  background: loadingId === "form" ? "#9ca3af" : "#01696f",
                  color: "white", border: "none",
                  padding: "8px 20px", borderRadius: "6px",
                  cursor: loadingId === "form" ? "not-allowed" : "pointer",
                  fontWeight: 600, fontSize: "0.875rem",
                }}>
                  {loadingId === "form" ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}