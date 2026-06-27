import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Debug log to inspect incoming requests and cookies in the console
  console.log("MIDDLEWARE PATH:", pathname, "RECEIVED COOKIES:", req.cookies.getAll().map(c => c.name))

  if (pathname.startsWith("/cms") && pathname !== "/cms-login") {
    const token = 
      req.cookies.get("authjs.session-token") || 
      req.cookies.get("__Secure-authjs.session-token") ||
      req.cookies.get("cms-session-token") ||
      req.cookies.get("__Secure-cms-session-token")

    if (!token) {
      console.log("MIDDLEWARE: No session token found! Redirecting to /cms-login")
      return NextResponse.redirect(new URL("/cms-login", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/cms/:path*"],
}
