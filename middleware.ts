import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth; // সেশন থাকলে true হবে
  const { pathname } = req.nextUrl;

  // কোন কোন রুট প্রটেক্ট করতে চান তা ডিফাইন করুন
  const isDashboardRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/products");

  // ⚡ সিনারিও ১: ইউজার লগইন ছাড়া ড্যাশবোর্ডে যেতে চাইলে হোমে পাঠিয়ে দাও
  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // ⚡ সিনারিও ২: ইউজার অলরেডি লগইনড, তাও যদি লগইন পেজে (হোমে) আসতে চায়, ড্যাশবোর্ডে পাঠিয়ে দাও
  if (pathname === "/" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
});

// ⚡ এই ম্যাচারটি একদম পারফেক্ট। এটি স্ট্যাটিক ফাইল ও নেক্সট-অথ এপিআই বাদে সব রান করবে
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};