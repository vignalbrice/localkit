import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { projects, entries, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import DashboardClient from "./DashboardClient";
import type { PlanType } from "@/lib/plans";

interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  plan?: PlanType;
}

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = (session.user as User).id;
  const userName = (session.user as User).name;
  const userEmail = (session.user as User).email;

  // Récupérer les informations utilisateur avec le plan
  const userInfo = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  const userPlan = (userInfo?.plan as PlanType) || "free";

  // Récupérer tous les projets de l'utilisateur
  const projectList = await db
    .select()
    .from(projects)
    .where(eq(projects.ownerUserId, userId));

  // Ajouter les statistiques pour chaque projet
  const projectsWithStats = await Promise.all(
    projectList.map(async (project) => {
      const stats = await db
        .select({
          languageCount: sql<number>`COUNT(DISTINCT ${entries.locale})`,
          namespaceCount: sql<number>`COUNT(DISTINCT ${entries.namespace})`,
          entryCount: sql<number>`COUNT(*)`,
        })
        .from(entries)
        .where(eq(entries.projectId, project.id));

      return {
        ...project,
        _stats: {
          languageCount: Number(stats[0]?.languageCount || 0),
          namespaceCount: Number(stats[0]?.namespaceCount || 0),
          entryCount: Number(stats[0]?.entryCount || 0),
        },
      };
    }),
  );

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <DashboardClient
      initialProjects={projectsWithStats}
      userName={userName}
      userEmail={userEmail}
      userPlan={userPlan}
      onSignOut={handleSignOut}
    />
  );
}
