import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth; 
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname === "/";

  const isDashboardRoute = 
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/products") ||
    pathname.startsWith("/categories") ||
    pathname.startsWith("/brands-config") ||
    pathname.startsWith("/shades-config") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/payment-method") ||
    pathname.startsWith("/payment-history") ||
    pathname.startsWith("/add-products") ||
    pathname.startsWith("/coupons") ||
    pathname.startsWith("/faqs");

  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [

    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};