import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Route dépréciée - utilisez /api/projects/[projectId]/preview-zip
 * Cette route n'est plus fonctionnelle depuis la migration vers PostgreSQL
 */
export async function POST() {
  return NextResponse.json(
    { 
      ok: false, 
      error: "Cette route est dépréciée. Utilisez /api/projects/[projectId]/preview-zip" 
    },
    { status: 410 } // 410 Gone
  );
}
