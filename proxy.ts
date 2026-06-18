import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  // Protect admin routes
  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login", nextUrl));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", nextUrl)); // Kick non-admins to homepage
    }
  }

  // Protect user account routes
  if (nextUrl.pathname.startsWith("/account")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  // Matcher ensures middleware runs on admin and account routes, but ignores API routes and static files
  matcher: ["/admin/:path*", "/account/:path*"],
};