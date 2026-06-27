import CMSLoginForm from "@/components/cms/CMSLoginForm"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "CMS Login - KPU Provinsi Jawa Tengah",
  description: "Halaman login administrator Content Management System (CMS) KPU Provinsi Jawa Tengah.",
}

export default function CMSLoginPage() {
  return <CMSLoginForm />
}
