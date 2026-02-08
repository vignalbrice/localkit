"use server";

import { redirect } from "next/navigation";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

import { signIn } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";

export async function signupUser(formData: FormData) {
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
    redirect("/login");
  }

  const passwordHash = await hash(password, 12);
  const userId = crypto.randomUUID();

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
}
