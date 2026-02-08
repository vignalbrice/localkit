import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { projects, entries } from "@/lib/db/schema";
import { flattenI18nextJson } from "@/lib/i18next-parser";

export const runtime = "nodejs";

/**
 * POST /api/import-json
 * Crée un nouveau projet et importe un fichier JSON de traductions
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const projectName = formData.get("projectName") as string;
    const language = formData.get("language") as string;
    const namespace = formData.get("namespace") as string;

    if (!file || !language || !namespace) {
      return NextResponse.json(
        { error: "Fichier, langue et namespace requis" },
        { status: 400 },
      );
    }

    // Lire le contenu du fichier JSON
    const text = await file.text();
    let jsonData: Record<string, unknown>;

    try {
      jsonData = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Fichier JSON invalide" },
        { status: 400 },
      );
    }

    // Aplatir le JSON au cas où il serait imbriqué
    const { flat } = flattenI18nextJson(jsonData);

    // Créer un nouveau projet
    // Utiliser le nom fourni, sinon utiliser le nom du fichier
    const finalProjectName = projectName?.trim() || file.name.replace(/\.json$/, "") || "Imported Project";
    const [project] = await db
      .insert(projects)
      .values({
        name: finalProjectName,
        ownerUserId: session.user.id,
        localesPath: "locales",
        defaultBranch: "main",
      })
      .returning();

    // Importer les entrées
    const entriesToInsert = Object.entries(flat).map(([key, value]) => ({
      projectId: project.id,
      locale: language,
      namespace: namespace,
      dotKey: key,
      value: String(value),
      placeholders: extractPlaceholders(String(value)),
    }));

    if (entriesToInsert.length > 0) {
      await db.insert(entries).values(entriesToInsert);
    }

    return NextResponse.json({
      ok: true,
      projectId: project.id,
      languageCount: 1,
      namespaceCount: 1,
      entryCount: entriesToInsert.length,
    });
  } catch (error) {
    console.error("Erreur lors de l'import JSON:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de l'import JSON",
      },
      { status: 500 },
    );
  }
}

/**
 * Extrait les placeholders d'une chaîne de traduction
 * Supporte les formats: {{key}}, {key}, ${key}, %s, %d, etc.
 */
function extractPlaceholders(text: string): string[] {
  const patterns = [
    /\{\{([^}]+)\}\}/g, // {{placeholder}}
    /\{([^}]+)\}/g, // {placeholder}
    /\$\{([^}]+)\}/g, // ${placeholder}
    /%[sdif]/g, // %s, %d, %i, %f
    /\[([^\]]+)\]/g, // [placeholder]
  ];

  const placeholders = new Set<string>();

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      placeholders.add(match[0]);
    }
  }

  return Array.from(placeholders);
}
