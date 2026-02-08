import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Octokit } from "octokit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const { owner, repo } = await params;

    // Récupérer le token GitHub de la session
    const accessToken = process.env.AUTH_GITHUB_TOKEN || (session as { accessToken?: string }).accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Token GitHub non trouvé. Veuillez vous reconnecter." },
        { status: 401 }
      );
    }

    const octokit = new Octokit({ auth: accessToken });

    // Récupérer les branches du dépôt
    const { data: branches } = await octokit.rest.repos.listBranches({
      owner,
      repo,
      per_page: 100,
    });

    // Formater les données
    const formattedBranches = branches.map((branch: { name: string; protected: boolean; commit: { sha: string } }) => ({
      name: branch.name,
      protected: branch.protected,
      sha: branch.commit.sha,
    }));

    return NextResponse.json({ branches: formattedBranches });
  } catch (error) {
    console.error("Error fetching GitHub branches:", error);

    const err = error as { status?: number; message?: string };

    if (err.status === 404) {
      return NextResponse.json(
        { error: "Dépôt non trouvé ou accès refusé" },
        { status: 404 }
      );
    }

    if (err.status === 401) {
      return NextResponse.json(
        { error: "Token GitHub invalide ou expiré. Veuillez vous reconnecter." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la récupération des branches" },
      { status: 500 }
    );
  }
}
