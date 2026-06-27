"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"

if (typeof window !== "undefined") {
  const originalError = console.error
  console.error = (...args: any[]) => {
    if (typeof args[0] === "string" && (
      args[0].includes("Encountered a script tag") || 
      args[0].includes("Scripts inside React components are never executed")
    )) {
      return
    }
    originalError.apply(console, args)
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  )
}