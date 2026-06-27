import Link from "next/link"
import { BookOpen, Users, FileText, Info, Book, MessageSquare, Briefcase, Plane, Phone } from "lucide-react"

export function QuickLinks() {
  const links = [
    { icon: FileText, label: "Informasi Layanan", href: "/layanan" },
    { icon: MessageSquare, label: "Kritik & Saran", href: "/kritik-saran" },
    { icon: Info, label: "Tentang KPU", href: "/tentang" },
    { icon: BookOpen, label: "Berita", href: "/berita" },
    { icon: Plane, label: "SPPD Internal", href: "/login" },
    { icon: Phone, label: "Kontak", href: "/kontak" },
  ]

  return (
    <div className="w-full bg-surface-container-low dark:bg-surface-container py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
          {links.map((link, idx) => (
            <Link 
              key={idx} 
              href={link.href}
              className="group flex flex-col items-center p-6 bg-surface-container-lowest dark:bg-surface-container-high rounded-2xl border border-outline-variant shadow-[0_2px_10px_-3px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-primary/5 dark:bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 mb-4">
                <link.icon size={28} strokeWidth={2} />
              </div>
              <span className="text-sm md:text-xs lg:text-sm font-semibold text-zinc-700 dark:text-zinc-300 text-center leading-tight group-hover:text-primary transition-colors">
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

