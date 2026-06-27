import { cmsAuth } from "@/lib/auth-cms"
import { NextResponse } from "next/server"

export async function requireCMSAdmin() {
  const session = await cmsAuth()
  if (!session || session.user?.role !== "CMS_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}
