import { NextRequest, NextResponse } from "next/server";
import { runAutoSync } from "@/lib/auto-sync";

/**
 * Endpoint pour déclencher la synchronisation automatique
 * Devrait être appelé par un cron job (ex: Vercel Cron, GitHub Actions)
 * 
 * Sécurité: Nécessite un token d'autorisation dans les headers
 */
export async function POST(req: NextRequest) {
  try {
    // Vérifier le token d'autorisation
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.AUTO_SYNC_SECRET;

    if (!expectedToken) {
      return NextResponse.json(
        { error: "Auto-sync not configured" },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Exécuter la synchronisation
    const results = await runAutoSync();

    // Compter les succès et échecs
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Auto-sync completed: ${successCount} succeeded, ${failureCount} failed`,
      totalProjects: results.length,
      successCount,
      failureCount,
      results: results.map((r) => ({
        projectId: r.projectId,
        projectName: r.projectName,
        success: r.success,
        message: r.message,
        commitSha: r.commitSha,
      })),
    });
  } catch (error) {
    console.error("Error in auto-sync endpoint:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Endpoint GET pour vérifier le statut de la synchronisation automatique
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const expectedToken = process.env.AUTO_SYNC_SECRET;

    if (!expectedToken) {
      return NextResponse.json(
        { error: "Auto-sync not configured" },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Auto-sync endpoint is operational",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error checking auto-sync status:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
