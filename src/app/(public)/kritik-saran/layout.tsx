import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Kritik & Saran",
  description: "Sampaikan pengaduan, kritik, dan saran Anda kepada KPU Provinsi Jawa Tengah",
}

export default function KritikSaranLayout({ children }: { children: React.ReactNode }) {
  return children
}
