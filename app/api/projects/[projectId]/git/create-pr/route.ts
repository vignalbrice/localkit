import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { entries, githubInstallations, projects } from "@/lib/db/schema";
import { requireUser } from "@/lib/security";
import { createLocalesPr, buildI18nextFiles } from "@/lib/github/pr";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { userId } = await requireUser();
  const { projectId } = await params;
  const body = await req.json().catch(() => null);

  const title = String(body?.title || "chore(i18n): update translations");
  const prBody = String(body?.body || "");
  const headBranch = String(body?.headBranch || `i18nflow/${Date.now()}`);

  // Ensure project belongs to user
  const p = await db.select().from(projects).where(and(eq(projects.id, projectId), eq(projects.ownerUserId, userId)));
  if (!p.length) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  // Get GitHub install
  const gh = await db.select().from(githubInstallations).where(eq(githubInstallations.projectId, projectId));
  if (!gh.length) return NextResponse.json({ ok: false, error: "GitHub not connected" }, { status: 400 });

  // Load entries
  const rows = await db.select().from(entries).where(eq(entries.projectId, projectId));

  // Build values structure
  const values: Record<string, Record<string, Record<string, string>>> = {};
  for (const r of rows) {
    values[r.locale] ??= {};
    values[r.locale][r.namespace] ??= {};
    values[r.locale][r.namespace][r.dotKey] = r.value;
  }

  const files = buildI18nextFiles({
    localesPath: gh[0].localesPath,
    values,
    indent: 2
  });

  const prUrl = await createLocalesPr({
    installationId: gh[0].installationId,
    owner: gh[0].repoOwner,
    repo: gh[0].repoName,
    baseBranch: gh[0].defaultBranch,
    headBranch,
    title,
    body: prBody,
    files
  });

  return NextResponse.json({ ok: true, prUrl });
}
