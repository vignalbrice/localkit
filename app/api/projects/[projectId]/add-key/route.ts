import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { entries } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await params;

  try {
    const body = await request.json();
    const { namespace, dotKey, locales } = body;

    if (!namespace || !dotKey || !locales || !Array.isArray(locales)) {
      return NextResponse.json(
        { error: "Missing namespace, dotKey, or locales array" },
        { status: 400 },
      );
    }

    // Vérifier si la clé existe déjà
    const existingEntry = await db.query.entries.findFirst({
      where: and(
        eq(entries.projectId, projectId),
        eq(entries.namespace, namespace),
        eq(entries.dotKey, dotKey),
      ),
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: "Key already exists in this namespace" },
        { status: 409 },
      );
    }

    // Créer une entrée vide pour chaque locale
    const insertPromises = locales.map((locale: string) =>
      db.insert(entries).values({
        projectId,
        locale,
        namespace,
        dotKey,
        value: "",
        placeholders: [],
      }),
    );

    await Promise.all(insertPromises);

    return NextResponse.json({
      ok: true,
      created: locales.length,
    });
  } catch (error) {
    console.error("Add key error:", error);
    return NextResponse.json(
      { error: "Failed to add key" },
      { status: 500 },
    );
  }
}
