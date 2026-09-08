import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const isAdminRoute = pathname.startsWith("/admin")
  const isBarberRoute = pathname.startsWith("/barbero")
  const isPortalRoute = pathname === "/portal"

  if ((isAdminRoute || isBarberRoute || isPortalRoute) && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isAdminRoute && req.auth?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/barbero", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*", "/barbero/:path*", "/portal"],
}
