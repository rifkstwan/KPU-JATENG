import { TopNav } from "@/components/public/top-nav"
import { Footer } from "@/components/public/footer"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans">
      <TopNav />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
    </div>
  )
}
