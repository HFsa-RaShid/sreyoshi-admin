/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (error) {
    console.log(error);
    return null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const email = String(credentials.email).trim().toLowerCase();
          const password = String(credentials.password);

          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({ identity: email, password }),
            cache: 'no-store'
          });

          if (!res.ok) return null;

          const responseData = await res.json();
          const actualData = responseData?.data || responseData;
          const token = responseData?.accessToken || responseData?.token || actualData?.accessToken;

          if (!token) return null;

          const decodedToken = decodeJwt(token);

          // ফ্রন্টএন্ড সেশনের জন্য ডাটা রিটার্ন
          return {
            id: decodedToken?._id || "admin-id", 
            email: email,
            role: decodedToken?.role || "admin", 
            accessToken: token,
            refreshToken: responseData?.refreshToken || actualData?.refreshToken || null, 
          };

        } catch (error) {
          console.error("💥 NextAuth Authorize Error:", error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 1 * 24 * 60 * 60 },
  pages: { signIn: "/" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).refreshToken = token.refreshToken;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});