import NextAuth from "next-auth";
import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

// Minimal auth: users sign in with GitHub.
// In production, add a DB adapter (Drizzle/Prisma) for persisted users/teams.
// For V2 starter, session is enough; projects are owned by session user id.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().trim();
        const password = credentials?.password?.toString();

        if (!email || !password) {
          return null;
        }

        const adminEmail = process.env.AUTH_ADMIN_EMAIL;
        const adminPassword = process.env.AUTH_ADMIN_PASSWORD;

        if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
          return {
            id: "admin",
            name: "Admin",
            email,
          };
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await compare(password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name ?? user.email ?? "Utilisateur",
          email: user.email ?? email,
          image: user.image ?? undefined
        };
      },
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Stocker le token GitHub dans le JWT
      if (account?.provider === "github" && account.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      // expose user id and GitHub token
      if (session.user) {
        (session.user as unknown as { id: string }).id = token.sub!;
      }
      // Ajouter le token d'accès à la session
      if (token.accessToken) {
        (session as unknown as { accessToken: string }).accessToken = token.accessToken as string;
      }
      return session;
    }
  }
});
