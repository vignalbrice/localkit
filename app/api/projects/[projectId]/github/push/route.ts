import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { projects, entries, githubInstallations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { Octokit } from "octokit";
import { stableSortDeep, unflattenToJson } from "@/lib/i18next";

function toBase64(s: string) {
  return Buffer.from(s, "utf8").toString("base64");
}

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
    const { commitMessage, createPullRequest } = body;

    // Récupérer le projet
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

    // Récupérer la connexion GitHub
    const [installation] = await db
      .select()
      .from(githubInstallations)
      .where(eq(githubInstallations.projectId, projectId))
      .limit(1);

    if (!installation) {
      return NextResponse.json(
        { error: "No GitHub connection found for this project" },
        { status: 400 }
      );
    }

    // Récupérer toutes les entrées du projet
    const projectEntries = await db
      .select()
      .from(entries)
      .where(eq(entries.projectId, projectId));

    // Organiser les entrées par locale/namespace
    const values: Record<string, Record<string, Record<string, string>>> = {};

    for (const entry of projectEntries) {
      if (!values[entry.locale]) {
        values[entry.locale] = {};
      }
      if (!values[entry.locale][entry.namespace]) {
        values[entry.locale][entry.namespace] = {};
      }
      values[entry.locale][entry.namespace][entry.dotKey] = entry.value;
    }

    // Générer les fichiers JSON
    const files: Record<string, string> = {};
    const locales = Object.keys(values).sort();

    for (const locale of locales) {
      const namespaces = Object.keys(values[locale]).sort();
      for (const namespace of namespaces) {
        const flat = values[locale][namespace];
        const nested = stableSortDeep(unflattenToJson(flat));
        const json = JSON.stringify(nested, null, 2) + "\n";
        files[`${installation.localesPath}/${locale}/${namespace}.json`] = json;
      }
    }

    // Récupérer le token GitHub OAuth de la session
    const accessToken = (session as { accessToken?: string }).accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: "GitHub token not found in session" },
        { status: 400 }
      );
    }

    const octokit = new Octokit({ auth: accessToken });

    if (createPullRequest) {
      // Créer une Pull Request
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const branchName = `localkit-update-${timestamp}`;

      // Récupérer le SHA de la branche de base
      const baseRef = await octokit.rest.git.getRef({
        owner: installation.repoOwner,
        repo: installation.repoName,
        ref: `heads/${installation.defaultBranch}`,
      });
      const baseSha = baseRef.data.object.sha;

      // Créer la nouvelle branche
      await octokit.rest.git.createRef({
        owner: installation.repoOwner,
        repo: installation.repoName,
        ref: `refs/heads/${branchName}`,
        sha: baseSha,
      });

      // Créer ou mettre à jour chaque fichier
      for (const [path, content] of Object.entries(files)) {
        let existingSha: string | undefined;

        try {
          const existing = await octokit.rest.repos.getContent({
            owner: installation.repoOwner,
            repo: installation.repoName,
            path,
            ref: branchName,
          });

          if (!Array.isArray(existing.data) && "sha" in existing.data) {
            existingSha = existing.data.sha;
          }
        } catch {
          // Le fichier n'existe pas encore
        }

        await octokit.rest.repos.createOrUpdateFileContents({
          owner: installation.repoOwner,
          repo: installation.repoName,
          branch: branchName,
          path,
          message: commitMessage || `chore(i18n): update ${path}`,
          content: toBase64(content),
          sha: existingSha,
        });
      }

      // Créer la Pull Request
      const pr = await octokit.rest.pulls.create({
        owner: installation.repoOwner,
        repo: installation.repoName,
        base: installation.defaultBranch,
        head: branchName,
        title: commitMessage || "Update i18n translations",
        body: `This PR updates the translation files from LocalKit.\n\n**Files updated:**\n${Object.keys(files).map(f => `- ${f}`).join("\n")}`,
      });

      return NextResponse.json({
        success: true,
        type: "pull_request",
        url: pr.data.html_url,
        number: pr.data.number,
        branch: branchName,
      });
    } else {
      // Push directement sur la branche principale
      for (const [path, content] of Object.entries(files)) {
        let existingSha: string | undefined;

        try {
          const existing = await octokit.rest.repos.getContent({
            owner: installation.repoOwner,
            repo: installation.repoName,
            path,
            ref: installation.defaultBranch,
          });

          if (!Array.isArray(existing.data) && "sha" in existing.data) {
            existingSha = existing.data.sha;
          }
        } catch {
          // Le fichier n'existe pas encore
        }

        await octokit.rest.repos.createOrUpdateFileContents({
          owner: installation.repoOwner,
          repo: installation.repoName,
          branch: installation.defaultBranch,
          path,
          message: commitMessage || `chore(i18n): update ${path}`,
          content: toBase64(content),
          sha: existingSha,
        });
      }

      // Récupérer le dernier commit pour retourner l'URL
      const commits = await octokit.rest.repos.listCommits({
        owner: installation.repoOwner,
        repo: installation.repoName,
        sha: installation.defaultBranch,
        per_page: 1,
      });

      return NextResponse.json({
        success: true,
        type: "direct_push",
        url: commits.data[0]?.html_url,
        branch: installation.defaultBranch,
        filesUpdated: Object.keys(files).length,
      });
    }
  } catch (error) {
    console.error("Error pushing to GitHub:", error);
    return NextResponse.json(
      {
        error: "Failed to push to GitHub",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
