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
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const mode = formData.get("mode") as "merge" | "replace";
    const locale = formData.get("locale") as string;
    const namespace = formData.get("namespace") as string;

    if (!file || !locale || !namespace) {
      return NextResponse.json(
        { error: "Missing file, locale, or namespace" },
        { status: 400 },
      );
    }

    const text = await file.text();
    const jsonData = JSON.parse(text);

    // Si mode = replace, supprimer toutes les entrées existantes pour ce locale/namespace
    if (mode === "replace") {
      await db
        .delete(entries)
        .where(
          and(
            eq(entries.projectId, projectId),
            eq(entries.locale, locale),
            eq(entries.namespace, namespace),
          ),
        );
    }

    // Fonction récursive pour flatten les clés JSON
    function flattenKeys(
      obj: Record<string, unknown>,
      prefix = "",
    ): Record<string, string> {
      const result: Record<string, string> = {};

      for (const [key, value] of Object.entries(obj)) {
        const dotKey = prefix ? `${prefix}.${key}` : key;

        if (typeof value === "string") {
          result[dotKey] = value;
        } else if (typeof value === "object" && value !== null) {
          Object.assign(result, flattenKeys(value as Record<string, unknown>, dotKey));
        } else {
          // Convertir autres types en string
          result[dotKey] = String(value);
        }
      }

      return result;
    }

    const flattened = flattenKeys(jsonData);

    // Fonction pour détecter les placeholders
    function extractPlaceholders(value: string): string[] {
      const patterns = [
        /\{\{(\w+)\}\}/g, // {{placeholder}}
        /\{(\w+)\}/g, // {placeholder}
        /%\((\w+)\)s/g, // %(placeholder)s (Python style)
      ];

      const placeholders = new Set<string>();

      for (const pattern of patterns) {
        const matches = value.matchAll(pattern);
        for (const match of matches) {
          placeholders.add(match[1]);
        }
      }

      return Array.from(placeholders);
    }

    // Insérer ou mettre à jour les entrées
    const insertPromises = Object.entries(flattened).map(
      async ([dotKey, value]) => {
        const placeholders = extractPlaceholders(value);

        // Vérifier si l'entrée existe déjà
        const existing = await db.query.entries.findFirst({
          where: and(
            eq(entries.projectId, projectId),
            eq(entries.locale, locale),
            eq(entries.namespace, namespace),
            eq(entries.dotKey, dotKey),
          ),
        });

        if (existing) {
          // Mettre à jour
          await db
            .update(entries)
            .set({
              value,
              placeholders,
              updatedAt: new Date(),
            })
            .where(eq(entries.id, existing.id));
        } else {
          // Insérer
          await db.insert(entries).values({
            projectId,
            locale,
            namespace,
            dotKey,
            value,
            placeholders,
          });
        }
      },
    );

    await Promise.all(insertPromises);

    return NextResponse.json({
      ok: true,
      imported: Object.keys(flattened).length,
    });
  } catch (error) {
    console.error("Import JSON error:", error);
    return NextResponse.json(
      { error: "Failed to import JSON" },
      { status: 500 },
    );
  }
}
