import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { entries } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;

  try {
    const body = await request.json();
    const { locale } = body;

    if (!locale) {
      return NextResponse.json(
        { error: "Missing locale" },
        { status: 400 },
      );
    }

    // Vérifier si la locale existe déjà
    const existingEntry = await db.query.entries.findFirst({
      where: and(eq(entries.projectId, projectId), eq(entries.locale, locale)),
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: "Locale already exists" },
        { status: 409 },
      );
    }

    // Récupérer toutes les clés uniques (namespace + dotKey) du projet
    const allEntries = await db.query.entries.findMany({
      where: eq(entries.projectId, projectId),
    });

    // Créer un Set de clés uniques
    const uniqueKeys = new Map<string, { namespace: string; dotKey: string }>();
    for (const entry of allEntries) {
      const key = `${entry.namespace}::${entry.dotKey}`;
      if (!uniqueKeys.has(key)) {
        uniqueKeys.set(key, {
          namespace: entry.namespace,
          dotKey: entry.dotKey,
        });
      }
    }

    // Créer une entrée vide pour chaque clé unique
    const insertPromises = Array.from(uniqueKeys.values()).map(
      ({ namespace, dotKey }) =>
        db.insert(entries).values({
          projectId,
          locale,
          namespace,
          dotKey,
          value: "",
          placeholders: [],
        }),
    );

    // Si le projet est vide, créer une entrée par défaut
    if (insertPromises.length === 0) {
      insertPromises.push(
        db.insert(entries).values({
          projectId,
          locale,
          namespace: "common",
          dotKey: "welcome",
          value: "",
          placeholders: [],
        }),
      );
    }

    await Promise.all(insertPromises);

    return NextResponse.json({
      ok: true,
      created: insertPromises.length,
      locale,
    });
  } catch (error) {
    console.error("Add locale error:", error);
    return NextResponse.json(
      { error: "Failed to add locale" },
      { status: 500 },
    );
  }
}
