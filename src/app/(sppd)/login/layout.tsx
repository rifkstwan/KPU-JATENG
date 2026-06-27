import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login | SPPD Internal KPU Jateng",
  description: "Masuk ke sistem informasi perjalanan dinas KPU Provinsi Jawa Tengah",
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
