/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

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
          const res = await fetch("http://localhost:8080/api/v1/auth/login", {
            method: "POST",
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/json" },
          });

          const data = await res.json();

          if (res.ok && data?.success && data?.accessToken) {
            // ⚡ NextAuth-এর স্ট্যান্ডার্ড অনুযায়ী অবজেক্ট রিটার্ন করা হলো
            return {
              id: "admin-id", 
              email: credentials.email as string,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken || null, 
            };
          }

          return null;
        } catch (error) {
          console.error("Backend Auth Error:", error);
          return null;
        }
      },
    }),
  ],
  // ⚡ সেশন টাইপ JWT হিসেবে লক করা হলো যাতে কুকি তৈরি হতে পারে
  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60, // ১ দিন সেশন থাকবে
  },
  pages: {
    signIn: "/", 
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).refreshToken = token.refreshToken;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});