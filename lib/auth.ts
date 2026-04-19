import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        const seedEmail = process.env.SEED_USER_EMAIL;
        const seedHash = process.env.SEED_USER_PASSWORD_HASH;
        if (!seedEmail || !seedHash) return null;
        if (!credentials?.email || !credentials.password) return null;
        if (credentials.email.toLowerCase() !== seedEmail.toLowerCase())
          return null;
        const ok = await bcrypt.compare(credentials.password, seedHash);
        if (!ok) return null;
        return { id: seedEmail, email: seedEmail, name: "Hamzah User" };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.email = user.email;
      return token;
    },
    async session({ session, token }) {
      if (token?.email) session.user = { ...session.user, email: token.email };
      return session;
    },
  },
};
