import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import JSZip from "jszip";
import { db } from "@/lib/db/client";
import { projects } from "@/lib/db/schema";
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

  if (!file) {
    return NextResponse.json({ ok: false, error: "No file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = await parseI18NextZip(buffer);

  return NextResponse.json({ ok: true, preview: parsed });
}
