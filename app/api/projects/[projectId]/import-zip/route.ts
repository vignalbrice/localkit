import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import JSZip from "jszip";
import { db } from "@/lib/db/client";
import { entries, projects } from "@/lib/db/schema";
import { requireUser } from "@/lib/security";
import { flattenI18nextJson } from "@/lib/i18next-parser";

export const runtime = "nodejs";

type ParsedEntry = {
  locale: string;
  namespace: string;
  data: Record<string, string>;
};

async function parseI18NextZip(buffer: Buffer): Promise<ParsedEntry[]> {
  const zip = await JSZip.loadAsync(buffer);
  const result: ParsedEntry[] = [];

  for (const [path, file] of Object.entries(zip.files)) {
    if (file.dir) continue;
    if (!path.toLowerCase().endsWith(".json")) continue;

    const parts = path.replaceAll("\\", "/").replace(/^\/+/, "").split("/").filter(Boolean);
    const localesIndex = parts.indexOf("locales");

    if (localesIndex === -1 || parts.length < localesIndex + 3) continue;

    const locale = parts[localesIndex + 1];
    const namespace = parts[localesIndex + 2].replace(/\.json$/i, "");

    if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(locale)) continue;
    if (!namespace) continue;

    const text = await file.async("text");
    const json = JSON.parse(text);
    const { flat } = flattenI18nextJson(json);

    result.push({ locale, namespace, data: flat });
  }

  return result;
}

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

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const mode = (formData.get("mode") as string) || "merge";

  if (!file) {
    return NextResponse.json({ ok: false, error: "No file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = await parseI18NextZip(buffer);

  // If replace mode, delete existing entries
  if (mode === "replace") {
    await db.delete(entries).where(eq(entries.projectId, projectId));
  }

  // Insert new entries
  const toInsert = parsed.flatMap(({ locale, namespace, data }) =>
    Object.entries(data).map(([dotKey, value]) => ({
      projectId: projectId,
      locale,
      namespace,
      dotKey,
      value: String(value),
      placeholders: [],
    }))
  );

  if (toInsert.length > 0) {
    // Use upsert to handle conflicts
    for (const entry of toInsert) {
      await db
        .insert(entries)
        .values(entry)
        .onConflictDoUpdate({
          target: [entries.projectId, entries.locale, entries.namespace, entries.dotKey],
          set: { value: entry.value, updatedAt: new Date() },
        });
    }
  }

  return NextResponse.json({ ok: true, imported: toInsert.length });
}
