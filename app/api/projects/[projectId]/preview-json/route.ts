import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  await params; // Acknowledge params even if not used

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const text = await file.text();
    const jsonData = JSON.parse(text);

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

    return NextResponse.json({
      ok: true,
      preview: flattened,
      keysCount: Object.keys(flattened).length,
    });
  } catch (error) {
    console.error("Preview JSON error:", error);
    return NextResponse.json(
      { error: "Failed to parse JSON file" },
      { status: 500 },
    );
  }
}
