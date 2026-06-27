import { cmsAuth } from "@/lib/auth-cms"
import { auth } from "@/lib/auth"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    template: "%s | Admin CMS KPU Jateng",
    default: "Admin CMS KPU Jateng",
  },
}
import { redirect } from "next/navigation"
import CMSSidebar from "@/components/cms/CMSSidebar"
import CMSHeader from "@/components/cms/CMSHeader"
import { prisma } from "@/lib/prisma"

export default async function CMSLayout({ children }: { children: React.ReactNode }) {
  // Fallback to standard auth if cmsAuth session is not found
  const session = (await cmsAuth()) || (await auth())

  // Hanya proteksi kalau bukan halaman login
  if (!session || (session.user as any)?.role !== "CMS_ADMIN") {
    redirect("/cms-login")
  }

  // Fetch initial notifications for the header from DB
  const [unreadCount, unreadItems] = await Promise.all([
    prisma.kritikSaran.count({
      where: { status: "BELUM_DIBACA" }
    }),
    prisma.kritikSaran.findMany({
      where: { status: "BELUM_DIBACA" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        nama: true,
        isi: true,
        createdAt: true,
      }
    })
  ])

  // Convert Date objects to ISO string for safe props passing
  const serializedItems = unreadItems.map(item => ({
    ...item,
    createdAt: item.createdAt.toISOString()
  }))

  return (
    <div className="h-screen flex overflow-hidden bg-[#f8f9fa] dark:bg-zinc-950 font-sans">
      {/* Sidebar */}
      <CMSSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Dynamic Header */}
        <CMSHeader 
          user={{
            name: session.user?.name,
            email: session.user?.email,
            role: (session.user as any)?.role
          }}
          initialUnreadCount={unreadCount}
          initialUnreadItems={serializedItems}
        />

        {/* Scrollable Content Container */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
