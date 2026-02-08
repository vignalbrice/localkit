import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { githubInstallations, projects } from "@/lib/db/schema";
import { requireUser } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { userId } = await requireUser();
  const { projectId } = await params;

  // Ensure project belongs to user
  const p = await db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.ownerUserId, userId)));
  if (!p.length) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  // Delete GitHub installation
  await db
    .delete(githubInstallations)
    .where(eq(githubInstallations.projectId, projectId));

  return NextResponse.json({ ok: true });
}
