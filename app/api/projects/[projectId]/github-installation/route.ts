import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { githubInstallations, projects } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// GET - Récupérer l'installation GitHub d'un projet
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    // Vérifier que le projet appartient à l'utilisateur
    const [project] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.ownerUserId, session.user.email)
        )
      )
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Récupérer l'installation GitHub
    const [installation] = await db
      .select()
      .from(githubInstallations)
      .where(eq(githubInstallations.projectId, projectId))
      .limit(1);

    if (!installation) {
      return NextResponse.json({ connected: false });
    }

    return NextResponse.json({
      connected: true,
      installation: {
        installationId: installation.installationId,
        repoOwner: installation.repoOwner,
        repoName: installation.repoName,
        defaultBranch: installation.defaultBranch,
        localesPath: installation.localesPath,
      },
    });
  } catch (error) {
    console.error("Error fetching GitHub installation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Créer ou mettre à jour l'installation GitHub d'un projet
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;
    const body = await request.json();
    const { installationId, repoOwner, repoName, defaultBranch, localesPath } = body;

    // Validation
    if (!repoOwner || !repoName) {
      return NextResponse.json(
        { error: "repoOwner and repoName are required" },
        { status: 400 }
      );
    }

    // Vérifier que le projet appartient à l'utilisateur
    const [project] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.ownerUserId, session.user.email)
        )
      )
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Vérifier si une installation existe déjà
    const [existing] = await db
      .select()
      .from(githubInstallations)
      .where(eq(githubInstallations.projectId, projectId))
      .limit(1);

    if (existing) {
      // Mise à jour
      await db
        .update(githubInstallations)
        .set({
          installationId: installationId || existing.installationId,
          repoOwner,
          repoName,
          defaultBranch: defaultBranch || existing.defaultBranch,
          localesPath: localesPath || existing.localesPath,
        })
        .where(eq(githubInstallations.projectId, projectId));
    } else {
      // Création
      await db.insert(githubInstallations).values({
        projectId,
        installationId: installationId || "oauth",
        repoOwner,
        repoName,
        defaultBranch: defaultBranch || "main",
        localesPath: localesPath || "locales",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving GitHub installation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer l'installation GitHub d'un projet
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    // Vérifier que le projet appartient à l'utilisateur
    const [project] = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.ownerUserId, session.user.email)
        )
      )
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Supprimer l'installation
    await db
      .delete(githubInstallations)
      .where(eq(githubInstallations.projectId, projectId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting GitHub installation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
