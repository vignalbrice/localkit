import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function requireUser() {
  const session = await auth();
  const userId = (session?.user as unknown as { id: string } | undefined)?.id;

  if (!userId) {
    // Throw a NextResponse to return a proper 401 instead of 500
    throw new NextResponse(
      JSON.stringify({ ok: false, error: "UNAUTHORIZED" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return { session, userId };
}
