import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { projects, entries, githubInstallations, teamMembers } from "@/lib/db/schema";
import { requireUser } from "@/lib/security";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await requireUser();
  const { projectId } = await params;

  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));

  if (!project.length || project[0].ownerUserId !== userId) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, project: project[0] });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await requireUser();
  const { projectId } = await params;

  // Vérifier que le projet appartient à l'utilisateur
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));

  if (!project || project.ownerUserId !== userId) {
    return NextResponse.json(
      { ok: false, error: "Project not found" },
      { status: 404 }
    );
  }

  // Supprimer en cascade tous les éléments liés au projet
  // 1. Supprimer les entrées de traduction
  await db.delete(entries).where(eq(entries.projectId, projectId));

  // 2. Supprimer les installations GitHub associées
  await db.delete(githubInstallations).where(eq(githubInstallations.projectId, projectId));

  // 3. Supprimer les membres de l'équipe
  await db.delete(teamMembers).where(eq(teamMembers.projectId, projectId));

  // 4. Enfin, supprimer le projet lui-même
  await db.delete(projects).where(eq(projects.id, projectId));

  return NextResponse.json({ ok: true });
}
