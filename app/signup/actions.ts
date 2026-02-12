"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

import { signIn } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

export async function signupUser(formData: FormData) {
  try {
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      throw new Error("User already exists. Please login.");
    }

    const passwordHash = await hash(password, 12);
    const userId = randomUUID();

    await db.insert(users).values({
      id: userId,
      email,
      name: name || email.split("@")[0],
      image: null,
      passwordHash,
    });

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    // Si c'est une redirection de signIn, on la propage
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    // Sinon, on throw l'erreur pour qu'elle soit gérée côté client
    throw error;
  }
}
