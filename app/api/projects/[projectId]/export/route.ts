import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { entries, projects } from "@/lib/db/schema";
import { requireUser } from "@/lib/security";
import { exportI18nextZip } from "@/lib/i18next-export-zip";

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

  // Get all entries for this project
  const rows = await db
    .select()
    .from(entries)
    .where(eq(entries.projectId, projectId));

  // Build values structure
  const values: Record<string, Record<string, Record<string, string>>> = {};
  for (const r of rows) {
    values[r.locale] ??= {};
    values[r.locale][r.namespace] ??= {};
    values[r.locale][r.namespace][r.dotKey] = r.value;
  }

  // Extract unique locales and namespaces
  const locales = Object.keys(values);
  const namespacesSet = new Set<string>();
  for (const locale of locales) {
    for (const ns of Object.keys(values[locale])) {
      namespacesSet.add(ns);
    }
  }
  const namespaces = Array.from(namespacesSet);

  const zipBuffer = await exportI18nextZip({
    locales,
    namespaces,
    values,
    indent: 2,
  });

  return new Response(Buffer.from(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${project[0].name}-locales.zip"`,
    },
  });
}
