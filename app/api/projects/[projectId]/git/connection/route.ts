import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { githubInstallations, projects } from "@/lib/db/schema";
import { requireUser } from "@/lib/security";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { userId } = await requireUser();
  const { projectId } = await params;

  // Verify project ownership
  const project = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));

  if (!project.length || project[0].ownerUserId !== userId) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  // Get GitHub install
  const gh = await db
    .select()
    .from(githubInstallations)
    .where(eq(githubInstallations.projectId, projectId));

  if (!gh.length) {
    return NextResponse.json({ ok: true, connection: null });
  }

  const installation = gh[0];

  return NextResponse.json({
    ok: true,
    connection: {
      ...installation,
      repository: `${installation.repoOwner}/${installation.repoName}`,
      branch: installation.defaultBranch,
    },
  });
}
