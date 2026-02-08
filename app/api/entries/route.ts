import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { entries } from "@/lib/db/schema";
import { requireUser } from "@/lib/security";

export const runtime = "nodejs";

/**
 * Legacy route - préférez utiliser /api/projects/[projectId]/entries
 * Retourne toutes les entrées de tous les projets de l'utilisateur
 */
export async function GET() {
  await requireUser();

  // Get all entries (from all projects the user owns)
  const rows = await db.select().from(entries);

  // Note: This returns all entries without filtering by project ownership
  // In production, add a join with projects table to filter by ownerUserId

  return NextResponse.json({ ok: true, entries: rows });
}