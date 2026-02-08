import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Note: Avec NextAuth, la déconnexion complète du provider OAuth 
    // nécessite que l'utilisateur se déconnecte complètement de la session.
    // Le token OAuth ne peut pas être révoqué sans appel à l'API GitHub.

    // Pour l'instant, on retourne un message indiquant que l'utilisateur
    // doit se déconnecter complètement pour révoquer l'accès GitHub.

    return NextResponse.json({
      success: true,
      message: "Pour révoquer complètement l'accès GitHub, veuillez vous déconnecter puis supprimer l'autorisation de l'application dans vos paramètres GitHub.",
      githubSettingsUrl: "https://github.com/settings/applications"
    });
  } catch (error) {
    console.error("Error disconnecting GitHub:", error);
    return NextResponse.json(
      { error: "Erreur lors de la déconnexion" },
      { status: 500 }
    );
  }
}
