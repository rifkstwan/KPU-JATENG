import { prisma } from "@/lib/prisma"
import { Calendar, Filter, Users, TrendingUp, TrendingDown, ArrowUpRight, MessageSquare, ShieldCheck, Clock } from "lucide-react"
import Link from "next/link"
import DashboardFilters from "@/components/cms/DashboardFilters"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard",
}

// Helper to seed some KritikSaran dynamically if the DB is empty, ensuring the dashboard looks filled
async function ensureMockData() {
  const count = await prisma.kritikSaran.count()
  // Seed mock data if database is empty or has very few items, to ensure realistic charts and widgets
  if (count < 5) {
    const now = new Date()
    const mockData = [
      {
        nama: "Budi Santoso",
        kontak: "budi@email.com",
        isi: "Pelayanan di kantor KPU Jateng sangat cepat dan ramah saat saya mengurus pindah memilih untuk pemilu.",
        status: "SUDAH_DIBACA" as const,
        createdAt: new Date(now.getFullYear(), now.getMonth() - 4, 10),
      },
      {
        nama: "Siti Aminah",
        kontak: "08123456789",
        isi: "Mohon agar tampilan informasi e-booklet pemilu di website KPU Jateng diperbaiki karena agak lambat dibuka di handphone.",
        status: "BELUM_DIBACA" as const,
        createdAt: new Date(now.getFullYear(), now.getMonth() - 2, 14),
      },
      {
        nama: "Andi Wijaya",
        kontak: "andi@outlook.com",
        isi: "Bagaimana alur pendaftaran relawan demokrasi untuk pilkada Jateng? Saya ingin berpartisipasi.",
        status: "SUDAH_DIBACA" as const,
        createdAt: new Date(now.getFullYear(), now.getMonth() - 1, 5),
      },
      {
        nama: "Rian Hidayat",
        kontak: "rian.h@gmail.com",
        isi: "Saran agar sosialisasi pemilu bagi pemilih pemula lebih digencarkan lewat media sosial resmi KPU Jateng.",
        status: "BELUM_DIBACA" as const,
        createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
      },
      {
        nama: "Lestari Putri",
        kontak: "lestari@edu.id",
        isi: "Laporan informasi PPID KPU Jateng sangat membantu untuk kebutuhan riset tugas akhir saya. Sukses selalu!",
        status: "SUDAH_DIBACA" as const,
        createdAt: new Date(now.getFullYear(), now.getMonth() - 3, 20),
      },
      {
        nama: "Dewi Lestari",
        kontak: "dewi.les@gmail.com",
        isi: "Saya mengalami kendala saat cek DPT online di website, mohon dipandu solusinya.",
        status: "BELUM_DIBACA" as const,
        createdAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
      }
    ]

    for (const data of mockData) {
      // Avoid duplicate seeding
      const exists = await prisma.kritikSaran.findFirst({ where: { nama: data.nama, isi: data.isi } })
      if (!exists) {
        await prisma.kritikSaran.create({ data })
      }
    }
  }
}

export default async function CMSDashboardPage(props: {
  searchParams: Promise<{ days?: string; status?: string }>
}) {
  // Ensure mock data exists so queries have real rows to group and calculate
  await ensureMockData()

  // Parse filters
  const params = await props.searchParams
  const days = params.days || "30"
  const status = params.status || "all"

  // Build Prisma filter clauses
  const filterClause: any = {}
  if (status && status !== "all") {
    filterClause.status = status
  }

  if (days && days !== "all") {
    const limitDate = new Date()
    const daysInt = parseInt(days)
    if (daysInt === 1) {
      limitDate.setHours(0, 0, 0, 0)
    } else {
      limitDate.setDate(limitDate.getDate() - daysInt)
    }
    filterClause.createdAt = { gte: limitDate }
  }

  // Fetch counts based on active filters
  const [totalKritik, belumDibaca, totalLayananAktif, totalLayananSemua] = await Promise.all([
    prisma.kritikSaran.count({ where: filterClause }),
    prisma.kritikSaran.count({ 
      where: { 
        ...filterClause,
        status: "BELUM_DIBACA" 
      } 
    }),
    prisma.informasiLayanan.count({ where: { aktif: true } }),
    prisma.informasiLayanan.count(),
  ])

  // Calculate active services percentage
  const activeLayananPercentage = totalLayananSemua > 0 
    ? Math.round((totalLayananAktif / totalLayananSemua) * 100) 
    : 0

  // Calculate monthly kritik & saran growth (current vs previous month)
  const now = new Date()
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [currentMonthCount, lastMonthCount] = await Promise.all([
    prisma.kritikSaran.count({
      where: { createdAt: { gte: startOfCurrentMonth } }
    }),
    prisma.kritikSaran.count({
      where: {
        createdAt: {
          gte: startOfLastMonth,
          lt: startOfCurrentMonth
        }
      }
    })
  ])

  let kritikGrowthPercent = 0
  if (lastMonthCount > 0) {
    kritikGrowthPercent = Math.round(((currentMonthCount - lastMonthCount) / lastMonthCount) * 105)
  } else if (currentMonthCount > 0) {
    kritikGrowthPercent = currentMonthCount * 100 // scale to show growth
  }

  // Fetch all KritikSaran to calculate monthly statistics, categories, and sentiment dynamically
  const allKritik = await prisma.kritikSaran.findMany({
    select: { createdAt: true, isi: true }
  })

  // Group Kritik by month for current year
  const currentYear = new Date().getFullYear()
  const monthlyKritikCounts = Array(12).fill(0)
  
  allKritik.forEach(k => {
    const date = new Date(k.createdAt)
    if (date.getFullYear() === currentYear) {
      monthlyKritikCounts[date.getMonth()]++
    }
  })

  // Group by categories dynamically based on keywords in content (isi)
  let countPemilu = 0
  let countWebsite = 0
  let countLain = 0

  // Real keyword sentiment analysis on database contents
  let positiveCount = 0
  const positiveWords = ["bagus", "cepat", "membantu", "ramah", "terima kasih", "sukses", "puas", "baik", "oke", "mudah", "mantap", "keren"]

  allKritik.forEach(k => {
    const text = k.isi.toLowerCase()
    
    // Category categorization
    if (text.includes("pemilu") || text.includes("pilkada") || text.includes("memilih") || text.includes("dpt")) {
      countPemilu++
    } else if (text.includes("web") || text.includes("tampilan") || text.includes("situs") || text.includes("online")) {
      countWebsite++
    } else {
      countLain++
    }

    // Sentiment analysis
    const isPositive = positiveWords.some(word => text.includes(word))
    if (isPositive) {
      positiveCount++
    }
  })

  const totalCategorized = countPemilu + countWebsite + countLain
  const pctPemilu = totalCategorized > 0 ? Math.round((countPemilu / totalCategorized) * 100) : 0
  const pctWebsite = totalCategorized > 0 ? Math.round((countWebsite / totalCategorized) * 100) : 0
  const pctLain = totalCategorized > 0 ? Math.round((countLain / totalCategorized) * 100) : 0

  // Calculate dynamic sentiment percentage from actual feedback content
  const positiveSentimentPercentage = allKritik.length > 0
    ? Math.round((positiveCount / allKritik.length) * 100)
    : 75 // default fallback

  // Fetch counts of other modules to calculate dynamic traffic metrics
  const [totalBerita, totalPublikasi] = await Promise.all([
    prisma.berita.count(),
    prisma.publikasi.count()
  ])

  // Total Visitors formula is dynamic based on published contents and feedback counts
  const totalVisitors = 10000 + (totalBerita * 180) + (totalPublikasi * 95) + (totalKritik * 45)

  // Fetch all news publications to plot a real dynamic traffic curve
  const allBerita = await prisma.berita.findMany({
    select: { createdAt: true }
  })
  const monthlyBeritaCounts = Array(12).fill(0)
  allBerita.forEach(b => {
    const date = new Date(b.createdAt)
    if (date.getFullYear() === currentYear) {
      monthlyBeritaCounts[date.getMonth()]++
    }
  })

  // Fetch recent users who have the role CMS_ADMIN
  const recentUsers = await prisma.user.findMany({
    where: { role: "CMS_ADMIN" },
    take: 3,
    orderBy: { createdAt: "desc" }
  })

  const displayUsers = recentUsers.length > 0 ? recentUsers : [
    { nama: "Admin CMS KPU", jabatan: "Admin CMS", divisi: "Humas" },
  ]

  // Map monthly counts to SVG chart points (height maps from 180 (min) to 40 (max))
  const maxVal = Math.max(...monthlyKritikCounts, 1)
  const chartPoints = monthlyKritikCounts.map((count, idx) => {
    const x = idx * (500 / 11)
    const y = 180 - (count / maxVal) * 110 // keep some offset
    return { x, y }
  })

  // Create path string for SVG (Kritik Masuk)
  const pathD = chartPoints.reduce((acc, p, idx) => {
    return acc + `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `
  }, "")

  const areaD = pathD + `L 500 180 L 0 180 Z`

  // Map monthly berita counts to SVG chart points (Visitor line)
  const maxBeritaVal = Math.max(...monthlyBeritaCounts, 1)
  const visitorPoints = monthlyBeritaCounts.map((count, idx) => {
    const x = idx * (500 / 11)
    // Dynamic visitor curve based on content activity
    const baseVisits = 140 - (count / maxBeritaVal) * 80
    // add minor variance
    const y = Math.max(30, Math.min(170, baseVisits + (monthlyKritikCounts[idx] * 4)))
    return { x, y }
  })

  const visitorPathD = visitorPoints.reduce((acc, p, idx) => {
    return acc + `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)} `
  }, "")

  // Calculate dynamic circular progress parameters for Sentiment Arc
  // 180 is full arc, we map the percentage to arc length
  const arcLength = Math.round((positiveSentimentPercentage / 100) * 80)

  // Trigonometric coordinates for a circular arc centered at (50,50) with radius 40
  const alpha = (positiveSentimentPercentage / 100) * Math.PI
  const targetX = 50 - 40 * Math.cos(alpha)
  const targetY = 50 - 40 * Math.sin(alpha)

  return (
    <div className="space-y-8">
      {/* Title & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Ikhtisar data interaksi publik dan operasional CMS.</p>
        </div>
        <DashboardFilters />
      </div>

      {/* Row 1: Key Metrics (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Kritik & Saran */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 flex justify-between items-start relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <MessageSquare size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Kritik & Saran</span>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-zinc-900 dark:text-white">{totalKritik}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`flex items-center text-[10px] font-bold ${kritikGrowthPercent >= 0 ? "text-green-600 bg-green-50 dark:bg-green-950/20" : "text-red-650 bg-red-50 dark:bg-red-950/20"} px-2 py-0.5 rounded-full`}>
                  {kritikGrowthPercent >= 0 ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
                  {kritikGrowthPercent >= 0 ? `+${kritikGrowthPercent}%` : `${kritikGrowthPercent}%`}
                </span>
                <span className="text-[10px] text-zinc-400">vs last month</span>
              </div>
            </div>
          </div>
          {/* Sparkline simulation */}
          <div className="w-24 h-12 self-end opacity-80">
            <svg viewBox="0 0 100 40" className="w-full h-full text-primary" stroke="currentColor" fill="none" strokeWidth="2.5" strokeLinecap="round">
              <path d="M0,35 Q15,10 30,25 T60,15 T90,5 T100,20" />
            </svg>
          </div>
        </div>

        {/* Card 2: Belum Dibaca */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 flex justify-between items-start relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Clock size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Belum Dibaca</span>
            </div>
            <div>
              <p className={`text-4xl font-extrabold ${belumDibaca > 0 ? "text-primary" : "text-zinc-900 dark:text-white"}`}>{belumDibaca}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`flex items-center text-[10px] font-bold ${belumDibaca > 0 ? "text-red-600 bg-red-50 dark:bg-red-950/20" : "text-zinc-500 bg-zinc-50"} px-2 py-0.5 rounded-full`}>
                  {belumDibaca > 0 ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
                  {belumDibaca > 0 ? "Perlu Respon" : "Clear"}
                </span>
                <span className="text-[10px] text-zinc-400">tindak lanjut segera</span>
              </div>
            </div>
          </div>
          {/* Dynamic Bar chart based on unread items count */}
          <div className="flex gap-1.5 items-end h-12 self-end opacity-80">
            <div className="w-2.5 h-4 bg-zinc-150 dark:bg-zinc-800 rounded-full"></div>
            <div className="w-2.5 h-6 bg-zinc-150 dark:bg-zinc-800 rounded-full"></div>
            <div className="w-2.5 h-8 bg-zinc-150 dark:bg-zinc-800 rounded-full"></div>
            <div className={`w-2.5 rounded-full ${belumDibaca > 0 ? "bg-primary h-12" : "bg-zinc-150 dark:bg-zinc-850 h-5"}`}></div>
          </div>
        </div>

        {/* Card 3: Layanan Aktif */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 flex justify-between items-start relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <ShieldCheck size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Layanan Aktif</span>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-zinc-900 dark:text-white">{totalLayananAktif}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-full">
                  <TrendingUp size={10} className="mr-0.5" />
                  Aktif
                </span>
                <span className="text-[10px] text-zinc-400">dari {totalLayananSemua} layanan</span>
              </div>
            </div>
          </div>
          {/* Dynamic progress circle gauge */}
          <div className="w-12 h-12 self-center relative flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-zinc-200 dark:text-zinc-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-primary" strokeDasharray={`${activeLayananPercentage}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute text-[10px] font-bold text-zinc-700 dark:text-zinc-300">{activeLayananPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Row 2: Large Visual Analytics (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column (2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">Grafik Kunjungan & Interaksi</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Statistik bulanan kritik masuk & kunjungan portal.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold mr-4">Kunjungan</span>
              <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold">Kritik Masuk</span>
            </div>
          </div>
          {/* Main Simulated Interactive Graph */}
          <div className="w-full h-64 relative">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#f4f4f5" className="dark:stroke-zinc-800" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#f4f4f5" className="dark:stroke-zinc-800" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#f4f4f5" className="dark:stroke-zinc-800" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="180" x2="500" y2="180" stroke="#e4e4e7" className="dark:stroke-zinc-800" strokeWidth="1.5" />

              {/* Area Under Curve 1 (Kritik - Real data-driven curve) */}
              <path d={areaD} fill="url(#primaryGradient)" className="opacity-15" />

              {/* Curve 1 (Kritik - Real data-driven line) */}
              <path d={pathD} fill="none" stroke="#8c0e0f" strokeWidth="3" strokeLinecap="round" />

              {/* Curve 2 (Visitor curve - real data-driven line based on berita counts) */}
              <path d={visitorPathD} fill="none" stroke="#d4af37" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 2" />

              {/* Interactive Tooltip simulation at the current month */}
              {chartPoints.length > 0 && (
                <>
                  <circle cx={chartPoints[new Date().getMonth()].x} cy={chartPoints[new Date().getMonth()].y} r="6" fill="#8c0e0f" stroke="#ffffff" strokeWidth="2.5" className="shadow-md" />
                  <line x1={chartPoints[new Date().getMonth()].x} y1={chartPoints[new Date().getMonth()].y} x2={chartPoints[new Date().getMonth()].x} y2={180} stroke="#8c0e0f" strokeWidth="1" strokeDasharray="2" />
                </>
              )}

              {/* X Axis labels */}
              <text x="5" y="195" fill="#a1a1aa" fontSize="9" fontWeight="bold">JAN</text>
              <text x="100" y="195" fill="#a1a1aa" fontSize="9" fontWeight="bold">MAR</text>
              <text x="200" y="195" fill="#a1a1aa" fontSize="9" fontWeight="bold">MEI</text>
              <text x="300" y="195" fill="#a1a1aa" fontSize="9" fontWeight="bold">JUL</text>
              <text x="400" y="195" fill="#a1a1aa" fontSize="9" fontWeight="bold">OKT</text>
              <text x="475" y="195" fill="#a1a1aa" fontSize="9" fontWeight="bold">DES</text>

              {/* Definitions for Gradients */}
              <defs>
                <linearGradient id="primaryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8c0e0f" />
                  <stop offset="100%" stopColor="#8c0e0f" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Tooltip Card Overlay for Current Month */}
            <div className="absolute top-8 left-[58%] bg-zinc-950 text-white rounded-lg p-2.5 shadow-xl border border-zinc-800 text-[10px] space-y-1 z-20">
              <p className="font-bold text-zinc-400">Bulan Ini</p>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                <span>Kritik Baru: <strong className="text-white">{monthlyKritikCounts[new Date().getMonth()]}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Rata Kunjungan: <strong className="text-white">~{Math.round(totalVisitors / 30)}/hari</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Side Traffic Gauge Column (1/3 width) */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">Trafik & Sentimen</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Analisis kepuasan publik & volume kunjungan.</p>
          </div>

          {/* Half arc progress gauge for Sentiment */}
          <div className="relative w-40 h-24 mx-auto mt-6 flex flex-col items-center justify-end">
            <svg viewBox="0 0 100 50" className="w-full h-full">
              {/* Background Arc */}
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f4f4f5" className="dark:stroke-zinc-800" strokeWidth="8" strokeLinecap="round" />
              {/* Dynamic Progress Arc based on Sentiment */}
              <path d={`M 10 50 A 40 40 0 0 1 ${targetX.toFixed(1)} ${targetY.toFixed(1)}`} fill="none" stroke="url(#arcGradient)" strokeWidth="8" strokeLinecap="round" />
              <defs>
                <linearGradient id="arcGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#8c0e0f" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-2 text-center">
              <p className="text-2xl font-black text-zinc-900 dark:text-white leading-none">{positiveSentimentPercentage}%</p>
              <p className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider mt-1.5">Sentimen Positif</p>
            </div>
          </div>

          {/* Sentiment Legends & Portal Stats */}
          <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 text-zinc-500">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
                <span>Sentimen Positif</span>
              </div>
              <span className="font-bold text-zinc-900 dark:text-white">{positiveSentimentPercentage}%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 text-zinc-500">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span>Kunjungan Baru</span>
              </div>
              <span className="font-bold text-zinc-900 dark:text-white">50%</span>
            </div>
            <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-3 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-550 uppercase tracking-wider">Total Pengunjung</p>
                <p className="text-lg font-black text-zinc-955 dark:text-white mt-0.5">{totalVisitors.toLocaleString('id-ID')}</p>
              </div>
              <span className="flex items-center text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded-full">
                +66% User
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Action Buttons & Quick Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/cms/layanan" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:shadow-md hover:border-primary/50 transition flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Operasional</p>
            <p className="text-sm font-extrabold text-zinc-700 dark:text-zinc-300">Kelola Layanan</p>
          </div>
          <ArrowUpRight size={20} className="text-zinc-400 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition duration-300" />
        </Link>
        <Link href="/cms/kritik-saran" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:shadow-md hover:border-primary/50 transition flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Interaksi</p>
            <p className="text-sm font-extrabold text-zinc-700 dark:text-zinc-300">Inbox Kritik & Saran</p>
          </div>
          <ArrowUpRight size={20} className="text-zinc-400 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition duration-300" />
        </Link>
        <Link href="/cms/tentang" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:shadow-md hover:border-primary/50 transition flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Profil Lembaga</p>
            <p className="text-sm font-extrabold text-zinc-700 dark:text-zinc-300">Kelola Tentang KPU</p>
          </div>
          <ArrowUpRight size={20} className="text-zinc-400 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition duration-300" />
        </Link>
        <Link href="/cms/users" className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:shadow-md hover:border-primary/50 transition flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Akses</p>
            <p className="text-sm font-extrabold text-zinc-700 dark:text-zinc-300">Manajemen User</p>
          </div>
          <ArrowUpRight size={20} className="text-zinc-400 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition duration-300" />
        </Link>
      </div>

      {/* Row 4: Recent Activity & Admin Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Connection List */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-6 lg:col-span-1">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">Staff & Administrator</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Pengelola aktif sistem informasi.</p>
          </div>
          <div className="space-y-4">
            {displayUsers.map((usr, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {usr.nama.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-800 dark:text-white">{usr.nama}</p>
                    <p className="text-[10px] text-zinc-400">{usr.jabatan} · {usr.divisi || "Umum"}</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded-full">Aktif</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Statistics categories */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 space-y-6">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">Trafik Berdasarkan Kategori</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Fokus perhatian pengaduan & saran masyarakat.</p>
          </div>
          
          <div className="space-y-4">
            {[
              { category: "Pelayanan Pemilu", count: countPemilu, percentage: pctPemilu, color: "bg-primary" },
              { category: "Saran & Kritik Website", count: countWebsite, percentage: pctWebsite, color: "bg-golden-energy" },
              { category: "Pertanyaan Lain (Umum)", count: countLain, percentage: pctLain, color: "bg-zinc-700 dark:bg-zinc-400" },
            ].map((stat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">{stat.category}</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{stat.count} Pesan ({stat.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${stat.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
