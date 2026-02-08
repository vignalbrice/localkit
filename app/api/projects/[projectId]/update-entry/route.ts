import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { entries, projects } from "@/lib/db/schema";
import { requireUser } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(
  req: Request,
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

  const body = await req.json().catch(() => null);
  const { locale, namespace, dotKey, value } = body || {};

  if (!locale || !namespace || !dotKey || value === undefined) {
    return NextResponse.json(
      { ok: false, error: "Missing locale/namespace/dotKey/value" },
      { status: 400 }
    );
  }

  await db
    .update(entries)
    .set({ value: String(value), updatedAt: new Date() })
    .where(
      and(
        eq(entries.projectId, projectId),
        eq(entries.locale, locale),
        eq(entries.namespace, namespace),
        eq(entries.dotKey, dotKey)
      )
    );

  return NextResponse.json({ ok: true });
}
