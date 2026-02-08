import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Octokit } from "octokit";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Pour GitHub OAuth, on utilise le token de l'utilisateur
    // Note: Il faut configurer NextAuth pour stocker le token GitHub
    const accessToken = process.env.AUTH_GITHUB_TOKEN || (session as { accessToken?: string }).accessToken;

    if (!accessToken) {
      return NextResponse.json({
        repositories: [],
        message: "Token GitHub non disponible. Veuillez vous reconnecter via OAuth.",
      }, { status: 401 });
    }

    const octokit = new Octokit({ auth: accessToken });

    // Récupérer les repositories de l'utilisateur
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      per_page: 100,
      affiliation: "owner,collaborator,organization_member",
    });

    // Formater les données
    const formattedRepos = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner?.login || "",
      private: repo.private,
      defaultBranch: repo.default_branch,
      description: repo.description,
      updatedAt: repo.updated_at,
    }));

    return NextResponse.json({
      repositories: formattedRepos,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des repositories:", error);

    const err = error as { status?: number; message?: string };

    if (err.status === 401) {
      return NextResponse.json(
        { error: "Token GitHub invalide ou expiré. Veuillez vous reconnecter." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
