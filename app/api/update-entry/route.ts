import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Route dépréciée - utilisez /api/projects/[projectId]/update-entry
 * Cette route n'est plus fonctionnelle depuis la migration vers PostgreSQL
 */
export async function POST() {
  return NextResponse.json(
    { 
      ok: false, 
      error: "Cette route est dépréciée. Utilisez /api/projects/[projectId]/update-entry" 
    },
    { status: 410 } // 410 Gone
  );
}
