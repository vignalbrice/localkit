"use server";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

import { signIn } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

export async function signupUser(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Email and password are required" };
  }

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    return { ok: false, message: "User already exists. Please login." };
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

  // désactive la redirection automatique
  await signIn("credentials", { email, password, redirect: false });

  return { ok: true };
}
