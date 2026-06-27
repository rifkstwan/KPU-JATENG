import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import "./globals.css"
import Providers from "./providers"


const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-montserrat",
})

export const metadata: Metadata = {
  title: {
    template: "%s | KPU Provinsi Jawa Tengah",
    default: "KPU Provinsi Jawa Tengah",
  },
  description: "Portal Informasi Resmi Komisi Pemilihan Umum (KPU) Provinsi Jawa Tengah",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${montserrat.variable} font-sans antialiased m-0 p-0`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

