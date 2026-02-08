import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { projects, entries } from "@/lib/db/schema";
import JSZip from "jszip";
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

    const parts = path
      .replaceAll("\\", "/")
      .replace(/^\/+/, "")
      .split("/")
      .filter(Boolean);
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

/**
 * POST /api/import-zip
 * Crée un nouveau projet et importe un fichier ZIP de traductions i18next
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Fichier requis" },
        { status: 400 },
      );
    }

    // Lire et parser le fichier ZIP
    const buffer = Buffer.from(await file.arrayBuffer());
    let parsed: ParsedEntry[];

    try {
      parsed = await parseI18NextZip(buffer);
    } catch {
      return NextResponse.json(
        { error: "Fichier ZIP invalide ou format incorrect" },
        { status: 400 },
      );
    }

    if (parsed.length === 0) {
      return NextResponse.json(
        {
          error:
            "Aucune traduction trouvée. Le ZIP doit contenir un dossier 'locales' avec la structure: locales/[langue]/[namespace].json",
        },
        { status: 400 },
      );
    }

    // Extraire les langues et namespaces uniques
    const languages = [...new Set(parsed.map((p) => p.locale))];
    const namespaces = [...new Set(parsed.map((p) => p.namespace))];

    // Créer un nouveau projet
    const projectName = file.name.replace(/\.zip$/, "") || "Imported Project";
    const [project] = await db
      .insert(projects)
      .values({
        name: projectName,
        ownerUserId: session.user.id,
        localesPath: "locales",
        defaultBranch: "main",
      })
      .returning();

    // Importer les entrées
    const toInsert = parsed.flatMap(({ locale, namespace, data }) =>
      Object.entries(data).map(([dotKey, value]) => ({
        projectId: project.id,
        locale,
        namespace,
        dotKey,
        value: String(value),
        placeholders: [],
      })),
    );

    if (toInsert.length > 0) {
      await db.insert(entries).values(toInsert);
    }

    return NextResponse.json({
      ok: true,
      projectId: project.id,
      languageCount: languages.length,
      namespaceCount: namespaces.length,
      entryCount: toInsert.length,
    });
  } catch (error) {
    console.error("Erreur lors de l'import ZIP:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de l'import ZIP",
      },
      { status: 500 },
    );
  }
}
