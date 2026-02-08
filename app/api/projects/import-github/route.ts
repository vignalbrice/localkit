import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { projects } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = (session.user as unknown as { id: string }).id;
    const body = await request.json();
    const { repositoryName, defaultBranch, localesPath } = body;

    if (!repositoryName || !defaultBranch) {
      return NextResponse.json(
        { error: "Paramètres manquants" },
        { status: 400 }
      );
    }

    // Créer le projet
    const [project] = await db
      .insert(projects)
      .values({
        name: repositoryName.split("/")[1] || repositoryName,
        ownerUserId: userId,
        defaultBranch: defaultBranch || "main",
        localesPath: localesPath || "public/locales",
      })
      .returning();

    // TODO: Créer l'installation GitHub et importer les fichiers
    // Pour l'instant, on crée juste le projet
    // Dans une vraie implémentation, on ferait :
    // 1. Enregistrer l'installation dans githubInstallations
    // 2. Récupérer les fichiers de traduction du repo
    // 3. Parser et importer dans la table entries

    return NextResponse.json(project);
  } catch (error) {
    console.error("Erreur lors de l'import GitHub:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'import" },
      { status: 500 }
    );
  }
}
