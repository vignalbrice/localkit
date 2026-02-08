import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { projects, entries, githubInstallations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import type { Entry, GitHubConnection } from "./types";
import ProjectClient from "./ProjectClient";

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { projectId } = await params;
  const resolvedSearchParams = await searchParams;

  // Charger le projet
  const projectData = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, projectId),
      eq(projects.ownerUserId, session.user.id),
    ),
  });

  if (!projectData) {
    redirect("/dashboard");
  }

  // Charger les entrées
  const entriesData = await db.query.entries.findMany({
    where: eq(entries.projectId, projectId),
    orderBy: (entries, { asc }) => [
      asc(entries.namespace),
      asc(entries.dotKey),
    ],
  });

  const projectEntries: Entry[] = entriesData.map((e) => ({
    id: e.id,
    projectId: e.projectId,
    locale: e.locale,
    namespace: e.namespace,
    dotKey: e.dotKey,
    value: e.value,
    placeholders: e.placeholders as string[],
    updatedAt: e.updatedAt,
  }));

  // Charger la connexion GitHub si elle existe
  const githubConnectionData = await db.query.githubInstallations.findFirst({
    where: eq(githubInstallations.projectId, projectId),
  });

  const githubConnection: GitHubConnection | null = githubConnectionData
    ? {
        projectId: githubConnectionData.projectId,
        installationId: githubConnectionData.installationId,
        repoOwner: githubConnectionData.repoOwner,
        repoName: githubConnectionData.repoName,
        defaultBranch: githubConnectionData.defaultBranch,
        localesPath: githubConnectionData.localesPath,
        createdAt: githubConnectionData.createdAt,
        // Compatibilité avec l'ancien code
        repository: `${githubConnectionData.repoOwner}/${githubConnectionData.repoName}`,
        branch: githubConnectionData.defaultBranch,
      }
    : null;

  return (
    <ProjectClient
      initialProject={projectData}
      initialEntries={projectEntries}
      initialGithubConnection={githubConnection}
      githubAuthParam={
        resolvedSearchParams["github-auth"] as string | undefined
      }
    />
  );
}
