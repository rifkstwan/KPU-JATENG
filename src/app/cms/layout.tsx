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
import CMSClientWrapper from "@/components/cms/cms-client-wrapper"
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
    <CMSClientWrapper
      user={{
        name: session.user?.name,
        email: session.user?.email,
        role: (session.user as any)?.role,
      }}
      initialUnreadCount={unreadCount}
      initialUnreadItems={serializedItems}
    >
      {children}
    </CMSClientWrapper>
  )
}
