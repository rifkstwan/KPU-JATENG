import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

// ── Helpers ──
function bigIntToNumber(val: bigint | null | undefined): number {
  return val ? parseInt(val.toString()) : 0
}

function formatRupiah(val: number) {
  if (!val) return "Rp 0"
  return "Rp " + val.toLocaleString("id-ID")
}

function formatTanggal(iso: Date) {
  return iso.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

function timeAgo(iso: Date) {
  const diff = Date.now() - iso.getTime()
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (d > 0) return `${d} hari lalu`
  if (h > 0) return `${h} jam lalu`
  return "Baru saja"
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  DRAFT:    { label: "Draft",     bg: "#f3f4f6", color: "#6b7280", dot: "#9ca3af" },
  PENDING:  { label: "Menunggu",  bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
  APPROVED: { label: "Disetujui", bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e" },
  REJECTED: { label: "Ditolak",   bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
}

// ── Stat Card ──
function StatCard({
  label, value, sub, icon, color, href,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  color: string
  href?: string
}) {
  const content = (
    <div style={{
      background: "#fff", borderRadius: "16px",
      border: "1px solid #eef0f4",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      padding: "20px", display: "flex",
      flexDirection: "column", gap: "12px",
      height: "100%", boxSizing: "border-box",
      transition: "box-shadow 150ms ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "12px", fontWeight: 600, color: "#8f95a3", letterSpacing: "0.04em" }}>
          {label}
        </span>
        <div style={{
          width: 36, height: 36, borderRadius: "10px",
          background: color + "18",
          display: "flex", alignItems: "center", justifyContent: "center",
          color,
        }}>
          {icon}
        </div>
      </div>
      <div>
        <div style={{ fontSize: "28px", fontWeight: 800, color: "#1a1f36", lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: "12px", color: "#8f95a3", marginTop: "4px" }}>{sub}</div>}
      </div>
    </div>
  )

  if (href) return (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      {content}
    </Link>
  )
  return content
}

// ── PEGAWAI Dashboard ──
async function PegawaiDashboard({ userId, nama }: { userId: string; nama: string }) {
  const [sppds] = await Promise.all([
    prisma.pengajuanSPPD.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        approvals: {
          include: { approver: { select: { nama: true } } },
          orderBy: { approvedAt: "desc" },
          take: 1,
        },
      },
    }),
  ])

  const [total, pending, approved] = await Promise.all([
    prisma.pengajuanSPPD.count({ where: { userId } }),
    prisma.pengajuanSPPD.count({ where: { userId, status: "PENDING" } }),
    prisma.pengajuanSPPD.count({ where: { userId, status: "APPROVED" } }),
  ])

  const totalAnggaran = await prisma.pengajuanSPPD.aggregate({
    where: { userId, status: "APPROVED" },
    _sum: { anggaran: true },
  })

  const jam = new Date().getHours()
  const greeting = jam < 12 ? "Selamat pagi" : jam < 15 ? "Selamat siang" : jam < 18 ? "Selamat sore" : "Selamat malam"

  return (
    <div>
      {/* Greeting Banner */}
      <div style={{
        background: "linear-gradient(135deg, #00205b 0%, #003d9e 100%)",
        borderRadius: "20px", padding: "28px 32px",
        marginBottom: "24px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", right: 40, bottom: -40, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", marginBottom: "6px" }}>
            {greeting}, 👋
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>
            {nama}
          </div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginBottom: "20px" }}>
            {pending > 0
              ? `Kamu punya ${pending} pengajuan SPPD sedang menunggu persetujuan.`
              : approved > 0
              ? `${approved} SPPD kamu telah disetujui. Perjalanan dinas siap dilaksanakan!`
              : "Belum ada pengajuan SPPD. Yuk ajukan sekarang!"}
          </div>
          <Link href="/dashboard/pengajuan" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "10px 20px", borderRadius: "10px",
            background: "#fff", color: "#00205b",
            fontSize: "13px", fontWeight: 700, textDecoration: "none",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Ajukan SPPD Baru
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
        <StatCard label="TOTAL SPPD" value={total} sub="Semua pengajuan" color="#00205b" href="/dashboard/sppd"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
        />
        <StatCard label="MENUNGGU" value={pending} sub="Belum diproses" color="#d97706"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
        <StatCard label="DISETUJUI" value={approved} sub="Siap dilaksanakan" color="#16a34a"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
        />
        <StatCard
          label="TOTAL ANGGARAN"
          value={formatRupiah(bigIntToNumber(totalAnggaran._sum.anggaran))}
          sub="SPPD disetujui"
          color="#7c3aed"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
        />
      </div>

      {/* Riwayat Terbaru */}
      <div style={{
        background: "#fff", borderRadius: "16px",
        border: "1px solid #eef0f4",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid #eef0f4",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1f36" }}>Riwayat Pengajuan</div>
          <Link href="/dashboard/sppd" style={{
            fontSize: "12px", color: "#00205b", fontWeight: 600,
            textDecoration: "none", display: "flex", alignItems: "center", gap: "4px",
          }}>
            Lihat semua
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </Link>
        </div>

        {sppds.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "#8f95a3", fontSize: "13px" }}>
            Belum ada pengajuan SPPD
          </div>
        ) : (
          sppds.map((s, idx) => {
            const cfg = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.DRAFT
            const isLast = idx === sppds.length - 1
            return (
              <div key={s.id} style={{
                padding: "14px 20px",
                borderBottom: isLast ? "none" : "1px solid #f3f4f6",
                display: "flex", alignItems: "center", gap: "14px",
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "10px",
                  background: "#f0f3fa", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00205b" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#00205b" }}>
                      {s.nomorSppd}
                    </span>
                    <span style={{
                      padding: "2px 8px", borderRadius: "20px",
                      background: cfg.bg, color: cfg.color,
                      fontSize: "11px", fontWeight: 700,
                      display: "inline-flex", alignItems: "center", gap: "3px",
                    }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: cfg.dot }} />
                      {cfg.label}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {s.tujuan} · {formatTanggal(s.tglBerangkat)}
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "#aab0c0", whiteSpace: "nowrap" }}>
                  {timeAgo(s.createdAt)}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── APPROVER Dashboard ──
async function ApproverDashboard({ userId, nama }: { userId: string; nama: string }) {
  const [pendingCount, approvedToday, totalHandled] = await Promise.all([
    prisma.pengajuanSPPD.count({ where: { status: "PENDING" } }),
    prisma.approval.count({
      where: {
        approverId: userId,
        approvedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.approval.count({ where: { approverId: userId } }),
  ])

  const recentApprovals = await prisma.approval.findMany({
    where: { approverId: userId },
    orderBy: { approvedAt: "desc" },
    take: 5,
    include: {
      sppd: { select: { nomorSppd: true, tujuan: true, tglBerangkat: true } },
    },
  })

  const pendingList = await prisma.pengajuanSPPD.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 3,
    include: {
      user: { select: { nama: true, jabatan: true } },
    },
  })

  const jam = new Date().getHours()
  const greeting = jam < 12 ? "Selamat pagi" : jam < 15 ? "Selamat siang" : jam < 18 ? "Selamat sore" : "Selamat malam"

  return (
    <div>
      {/* Greeting Banner */}
      <div style={{
        background: "linear-gradient(135deg, #00205b 0%, #003d9e 100%)",
        borderRadius: "20px", padding: "28px 32px",
        marginBottom: "24px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", marginBottom: "6px" }}>{greeting}, 👋</div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>{nama}</div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginBottom: "20px" }}>
            {pendingCount > 0
              ? `Ada ${pendingCount} pengajuan SPPD menunggu keputusan Anda.`
              : "Semua pengajuan sudah diproses. Tidak ada antrian saat ini."}
          </div>
          <Link href="/dashboard/approval" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "10px 20px", borderRadius: "10px",
            background: "#fff", color: "#00205b",
            fontSize: "13px", fontWeight: 700, textDecoration: "none",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Review Pengajuan
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px" }}>
        <StatCard label="MENUNGGU REVIEW" value={pendingCount} sub="Perlu diproses" color="#d97706" href="/dashboard/approval"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
        <StatCard label="DIPROSES HARI INI" value={approvedToday} sub="Keputusan hari ini" color="#16a34a"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
        />
        <StatCard label="TOTAL DIPROSES" value={totalHandled} sub="Sejak awal" color="#00205b"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Antrian Pending */}
        <div style={{
          background: "#fff", borderRadius: "16px",
          border: "1px solid #eef0f4",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid #eef0f4",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1f36" }}>Antrian Terbaru</div>
            <Link href="/dashboard/approval" style={{ fontSize: "12px", color: "#00205b", fontWeight: 600, textDecoration: "none" }}>
              Lihat semua →
            </Link>
          </div>
          {pendingList.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#8f95a3", fontSize: "13px" }}>
              Tidak ada antrian
            </div>
          ) : (
            pendingList.map((s, idx) => (
              <div key={s.id} style={{
                padding: "14px 20px",
                borderBottom: idx === pendingList.length - 1 ? "none" : "1px solid #f3f4f6",
                display: "flex", alignItems: "center", gap: "12px",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "10px",
                  background: "#eef1f8", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: 700, color: "#00205b",
                }}>
                  {s.user.nama.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a1f36", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.user.nama}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {s.nomorSppd} · {s.tujuan}
                  </div>
                </div>
                <div style={{ fontSize: "11px", color: "#aab0c0", whiteSpace: "nowrap" }}>
                  {timeAgo(s.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Riwayat Keputusan */}
        <div style={{
          background: "#fff", borderRadius: "16px",
          border: "1px solid #eef0f4",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #eef0f4" }}>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1f36" }}>Riwayat Keputusan Saya</div>
          </div>
          {recentApprovals.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#8f95a3", fontSize: "13px" }}>
              Belum ada riwayat
            </div>
          ) : (
            recentApprovals.map((a, idx) => {
              const isApproved = a.keputusan === "APPROVED"
              return (
                <div key={a.id} style={{
                  padding: "14px 20px",
                  borderBottom: idx === recentApprovals.length - 1 ? "none" : "1px solid #f3f4f6",
                  display: "flex", alignItems: "center", gap: "12px",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: isApproved ? "#f0fdf4" : "#fef2f2",
                    flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {isApproved ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#1a1f36", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.sppd.nomorSppd} · {a.sppd.tujuan}
                    </div>
                    <div style={{ fontSize: "12px", color: isApproved ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
                      {isApproved ? "Disetujui" : "Ditolak"}
                    </div>
                  </div>
                  <div style={{ fontSize: "11px", color: "#aab0c0", whiteSpace: "nowrap" }}>
                    {timeAgo(a.approvedAt)}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

// ── ADMIN Dashboard ──
async function AdminDashboard({ nama }: { nama: string }) {
  const [totalUser, totalSppd, pending, approved] = await Promise.all([
    prisma.user.count(),
    prisma.pengajuanSPPD.count(),
    prisma.pengajuanSPPD.count({ where: { status: "PENDING" } }),
    prisma.pengajuanSPPD.count({ where: { status: "APPROVED" } }),
  ])

  const totalAnggaran = await prisma.pengajuanSPPD.aggregate({
    where: { status: "APPROVED" },
    _sum: { anggaran: true },
  })

  const recentSppd = await prisma.pengajuanSPPD.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { user: { select: { nama: true } } },
  })

  const userByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: { role: true },
  })

  const jam = new Date().getHours()
  const greeting = jam < 12 ? "Selamat pagi" : jam < 15 ? "Selamat siang" : jam < 18 ? "Selamat sore" : "Selamat malam"

  return (
    <div>
      {/* Greeting Banner */}
      <div style={{
        background: "linear-gradient(135deg, #00205b 0%, #003d9e 100%)",
        borderRadius: "20px", padding: "28px 32px",
        marginBottom: "24px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
        <div style={{ position: "absolute", right: 40, bottom: -40, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", marginBottom: "6px" }}>{greeting}, 👋</div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>{nama}</div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginBottom: "20px" }}>
            Sistem SPPD KPU Jawa Tengah — {totalUser} pengguna aktif, {pending} pengajuan menunggu.
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/dashboard/admin" style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "10px 20px", borderRadius: "10px",
              background: "#fff", color: "#00205b",
              fontSize: "13px", fontWeight: 700, textDecoration: "none",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
              Kelola User
            </Link>
            <Link href="/dashboard/laporan" style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "10px 20px", borderRadius: "10px",
              background: "rgba(255,255,255,0.15)", color: "#fff",
              fontSize: "13px", fontWeight: 700, textDecoration: "none",
              border: "1.5px solid rgba(255,255,255,0.3)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="20" x2="18" y2="10"/>
                <line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/>
              </svg>
              Laporan
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
        <StatCard
          label="TOTAL PENGGUNA" value={totalUser}
          sub={userByRole.map(r => `${r.role}: ${r._count.role}`).join(" · ")}
          color="#00205b" href="/dashboard/admin"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
        />
        <StatCard label="MENUNGGU" value={pending} sub="Perlu diproses" color="#d97706"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        />
        <StatCard label="DISETUJUI" value={approved} sub={`Dari ${totalSppd} total`} color="#16a34a"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
        />
        <StatCard
          label="TOTAL ANGGARAN"
          value={formatRupiah(bigIntToNumber(totalAnggaran._sum.anggaran))}
          sub="SPPD disetujui" color="#7c3aed"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
        />
      </div>

      {/* Tabel SPPD Terbaru */}
      <div style={{
        background: "#fff", borderRadius: "16px",
        border: "1px solid #eef0f4",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}>
        <div style={{
          padding: "16px 20px", borderBottom: "1px solid #eef0f4",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#1a1f36" }}>Pengajuan SPPD Terbaru</div>
          <Link href="/dashboard/laporan" style={{
            fontSize: "12px", color: "#00205b", fontWeight: 600,
            textDecoration: "none", display: "flex", alignItems: "center", gap: "4px",
          }}>
            Lihat Laporan →
          </Link>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #eef0f4" }}>
              {["NOMOR SPPD", "PEGAWAI", "TUJUAN", "TANGGAL", "STATUS"].map((h) => (
                <th key={h} style={{
                  padding: "10px 16px", textAlign: "left",
                  fontSize: "11px", fontWeight: 700, color: "#9ca3af",
                  letterSpacing: "0.06em", whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentSppd.map((s, idx) => {
              const cfg = STATUS_CONFIG[s.status] ?? STATUS_CONFIG.DRAFT
              const isLast = idx === recentSppd.length - 1
              return (
                <tr key={s.id} style={{ borderBottom: isLast ? "none" : "1px solid #f3f4f6" }}>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#00205b" }}>{s.nomorSppd}</span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ fontSize: "13px", color: "#1a1f36" }}>{s.user.nama}</span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ fontSize: "13px", color: "#6b7280" }}>{s.tujuan}</span>
                  </td>
                  <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>{formatTanggal(s.tglBerangkat)}</span>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{
                      padding: "3px 9px", borderRadius: "20px",
                      background: cfg.bg, color: cfg.color,
                      fontSize: "11px", fontWeight: 700,
                      display: "inline-flex", alignItems: "center", gap: "4px",
                    }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", background: cfg.dot }} />
                      {cfg.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Root Page ──
export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id, role, nama } = session.user as { id: string; role: string; nama: string }

  if (role === "ADMIN") return <AdminDashboard nama={nama} />
  if (role === "APPROVER") return <ApproverDashboard userId={id} nama={nama} />
  return <PegawaiDashboard userId={id} nama={nama} />
}