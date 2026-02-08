import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Octokit } from "octokit";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ connected: false }, { status: 401 });
    }

    // Vérifier si l'utilisateur a un token GitHub dans la session
    const accessToken = (session as { accessToken?: string }).accessToken;

    if (!accessToken) {
      return NextResponse.json({
        connected: false,
        provider: null
      });
    }

    // Tester le token en essayant de récupérer les informations de l'utilisateur
    try {
      const octokit = new Octokit({ auth: accessToken });
      const { data: user } = await octokit.rest.users.getAuthenticated();

      return NextResponse.json({
        connected: true,
        provider: "github",
        username: user.login,
        avatarUrl: user.avatar_url,
      });
    } catch {
      // Si le token est invalide
      return NextResponse.json({
        connected: false,
        error: "Token invalide ou expiré"
      });
    }
  } catch (error) {
    console.error("Error checking GitHub status:", error);
    return NextResponse.json({ connected: false }, { status: 500 });
  }
}