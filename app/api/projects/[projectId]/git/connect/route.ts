import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { githubInstallations, projects } from "@/lib/db/schema";
import { requireUser } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { userId } = await requireUser();
  const { projectId } = await params;
  const body = await req.json().catch(() => null);

  // Support pour deux formats :
  // 1. Format direct : { installationId, repoOwner, repoName, defaultBranch, localesPath }
  // 2. Format simplifié : { repository: "owner/repo", branch: "main" }

  const installationId = String(body?.installationId || "oauth");
  let repoOwner = String(body?.repoOwner || "");
  let repoName = String(body?.repoName || "");
  const defaultBranch = String(body?.defaultBranch || body?.branch || "main");
  const localesPath = String(body?.localesPath || "locales");

  // Si format simplifié avec "repository"
  if (body?.repository && !repoOwner && !repoName) {
    const repository = String(body.repository);

    // Parser le repository (format: "owner/repo" ou "https://github.com/owner/repo")
    if (repository.startsWith("http")) {
      const match = repository.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        return NextResponse.json({ ok: false, error: "Invalid repository URL" }, { status: 400 });
      }
      repoOwner = match[1];
      repoName = match[2].replace(/\.git$/, "");
    } else {
      const parts = repository.split("/");
      if (parts.length !== 2) {
        return NextResponse.json({ ok: false, error: "Invalid repository format. Use 'owner/repo'" }, { status: 400 });
      }
      repoOwner = parts[0];
      repoName = parts[1];
    }
  }

  if (!repoOwner || !repoName) {
    return NextResponse.json({ ok: false, error: "Missing repoOwner/repoName or repository" }, { status: 400 });
  }

  // Ensure project belongs to user
  const p = await db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.ownerUserId, userId)));
  if (!p.length) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  await db
    .insert(githubInstallations)
    .values({
      projectId: projectId,
      installationId,
      repoOwner,
      repoName,
      defaultBranch,
      localesPath
    })
    .onConflictDoUpdate({
      target: githubInstallations.projectId,
      set: { installationId, repoOwner, repoName, defaultBranch, localesPath }
    });

  return NextResponse.json({ ok: true });
}
