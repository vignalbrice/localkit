"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { projects, entries, githubInstallations, teamMembers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
}

export async function createProject(name: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = (session.user as User).id;

  const [newProject] = await db
    .insert(projects)
    .values({
      name,
      ownerUserId: userId,
      localesPath: "locales",
      defaultBranch: "main",
    })
    .returning();

  revalidatePath("/dashboard");
  return { projectId: newProject.id };
}

export async function deleteProject(projectId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = (session.user as User).id;

  // Vérifier que le projet appartient à l'utilisateur
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId));

  if (!project || project.ownerUserId !== userId) {
    throw new Error("Project not found or unauthorized");
  }

  // Supprimer en cascade tous les éléments liés au projet
  // 1. Supprimer les entrées de traduction
  await db.delete(entries).where(eq(entries.projectId, projectId));

  // 2. Supprimer les installations GitHub associées
  await db.delete(githubInstallations).where(eq(githubInstallations.projectId, projectId));

  // 3. Supprimer les membres de l'équipe
  await db.delete(teamMembers).where(eq(teamMembers.projectId, projectId));

  // 4. Enfin, supprimer le projet lui-même
  await db.delete(projects).where(eq(projects.id, projectId));

  revalidatePath("/dashboard");
}

export async function importZip(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = (session.user as User).id;
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("Fichier requis");
  }

  // Lire et parser le fichier ZIP
  const JSZip = (await import("jszip")).default;
  const { flattenI18nextJson } = await import("@/lib/i18next-parser");

  const buffer = Buffer.from(await file.arrayBuffer());
  let parsed: Array<{
    locale: string;
    namespace: string;
    data: Record<string, string>;
  }>;

  try {
    const zip = await JSZip.loadAsync(buffer);
    const result: typeof parsed = [];

    for (const [path, zipFile] of Object.entries(zip.files)) {
      if (zipFile.dir) continue;
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

      const text = await zipFile.async("text");
      const json = JSON.parse(text);
      const { flat } = flattenI18nextJson(json);

      result.push({ locale, namespace, data: flat });
    }

    parsed = result;
  } catch {
    throw new Error("Fichier ZIP invalide ou format incorrect");
  }

  if (parsed.length === 0) {
    throw new Error(
      "Aucune traduction trouvée. Le ZIP doit contenir un dossier 'locales' avec la structure: locales/[langue]/[namespace].json"
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
      ownerUserId: userId,
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
    }))
  );

  if (toInsert.length > 0) {
    await db.insert(entries).values(toInsert);
  }

  revalidatePath("/dashboard");

  return {
    ok: true,
    projectId: project.id,
    languageCount: languages.length,
    namespaceCount: namespaces.length,
    entryCount: toInsert.length,
  };
}

export async function importJson(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const userId = (session.user as User).id;
  const file = formData.get("file") as File;
  const projectName = formData.get("projectName") as string;
  const language = formData.get("language") as string;
  const namespace = formData.get("namespace") as string;

  if (!file || !language || !namespace) {
    throw new Error("Fichier, langue et namespace requis");
  }

  // Lire le contenu du fichier JSON
  const text = await file.text();
  let jsonData: Record<string, unknown>;

  try {
    jsonData = JSON.parse(text);
  } catch {
    throw new Error("Fichier JSON invalide");
  }

  // Aplatir le JSON au cas où il serait imbriqué
  const { flattenI18nextJson } = await import("@/lib/i18next-parser");
  const { flat } = flattenI18nextJson(jsonData);

  // Créer un nouveau projet
  const finalProjectName = projectName?.trim() || file.name.replace(/\.json$/, "") || "Imported Project";
  const [project] = await db
    .insert(projects)
    .values({
      name: finalProjectName,
      ownerUserId: userId,
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

  revalidatePath("/dashboard");

  return {
    ok: true,
    projectId: project.id,
    languageCount: 1,
    namespaceCount: 1,
    entryCount: entriesToInsert.length,
  };
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
