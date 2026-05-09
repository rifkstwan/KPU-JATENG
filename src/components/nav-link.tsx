"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavLinkProps {
  href: string
  label: string
  icon: React.ReactNode
}

export default function NavLink({ href, label, icon }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = href === "/dashboard"
    ? pathname === "/dashboard"
    : pathname.startsWith(href)

  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.6rem 0.875rem",
        borderRadius: "8px",
        color: isActive ? "#ffffff" : "rgba(255,255,255,0.5)",
        textDecoration: "none",
        fontSize: "0.82rem",
        fontWeight: isActive ? 600 : 400,
        marginBottom: "2px",
        background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
        transition: "all 150ms ease",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "rgba(255,255,255,0.08)"
          e.currentTarget.style.color = "rgba(255,255,255,0.85)"
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "transparent"
          e.currentTarget.style.color = "rgba(255,255,255,0.5)"
        }
      }}
    >
      <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.6 }}>{icon}</span>
      {label}
    </Link>
  )
}