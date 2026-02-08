import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { projects, entries } from "@/lib/db/schema";
import { requireUser } from "@/lib/security";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await requireUser();
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.ownerUserId, userId));

  // Récupérer les statistiques pour chaque projet
  const projectsWithStats = await Promise.all(
    rows.map(async (project) => {
      const stats = await db
        .select({
          languageCount: sql<number>`COUNT(DISTINCT ${entries.locale})`,
          namespaceCount: sql<number>`COUNT(DISTINCT ${entries.namespace})`,
          entryCount: sql<number>`COUNT(*)`,
        })
        .from(entries)
        .where(eq(entries.projectId, project.id));

      return {
        ...project,
        _stats: {
          languageCount: Number(stats[0]?.languageCount || 0),
          namespaceCount: Number(stats[0]?.namespaceCount || 0),
          entryCount: Number(stats[0]?.entryCount || 0),
        },
      };
    }),
  );

  return NextResponse.json({ ok: true, projects: projectsWithStats });
}

export async function POST(req: Request) {
  const { userId } = await requireUser();
  const body = await req.json().catch(() => null);

  const name = String(body?.name || "").trim();
  if (!name) return NextResponse.json({ ok: false, error: "Missing name" }, { status: 400 });

  const inserted = await db
    .insert(projects)
    .values({
      ownerUserId: userId,
      name,
      localesPath: body?.localesPath || "locales",
      defaultBranch: body?.defaultBranch || "main"
    })
    .returning();

  return NextResponse.json({ ok: true, project: inserted[0] });
}
