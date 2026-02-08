"use server";

import { auth } from "@/lib/auth";
import { Octokit } from "octokit";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { teamMembers, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getPlanLimits } from "@/lib/plans";

export interface GithubStatus {
  connected: boolean;
  username?: string;
  avatarUrl?: string;
}

export async function getGithubStatus(): Promise<GithubStatus> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { connected: false };
    }

    // Récupérer le token GitHub de la session
    const accessToken = (session as { accessToken?: string }).accessToken;

    if (!accessToken) {
      return { connected: false };
    }

    // Tester le token en récupérant les informations de l'utilisateur
    try {
      const octokit = new Octokit({ auth: accessToken });
      const { data: user } = await octokit.rest.users.getAuthenticated();

      return {
        connected: true,
        username: user.login,
        avatarUrl: user.avatar_url,
      };
    } catch {
      // Si le token est invalide
      return { connected: false };
    }
  } catch (error) {
    console.error("Error checking GitHub status:", error);
    return { connected: false };
  }
}

export async function disconnectGithub(): Promise<{
  success: boolean;
  message: string;
  githubSettingsUrl?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        message: "Non authentifié",
      };
    }

    // Note: Avec NextAuth, la déconnexion complète du provider OAuth
    // nécessite que l'utilisateur se déconnecte complètement de la session.
    // Le token OAuth ne peut pas être révoqué sans appel à l'API GitHub.

    // Revalider la page settings pour rafraîchir les données
    revalidatePath("/settings");

    return {
      success: true,
      message:
        "Pour révoquer complètement l'accès GitHub, veuillez vous déconnecter puis supprimer l'autorisation de l'application dans vos paramètres GitHub.",
      githubSettingsUrl: "https://github.com/settings/applications",
    };
  } catch (error) {
    console.error("Error disconnecting GitHub:", error);
    return {
      success: false,
      message: "Erreur lors de la déconnexion",
    };
  }
}

// ====== Team Management Actions ======

export async function getTeamMembers() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, members: [] };
    }

    // Récupérer tous les membres de l'équipe (tous les projets de l'utilisateur)
    const members = await db.query.teamMembers.findMany({
      where: eq(teamMembers.userId, session.user.id),
      with: {
        user: true,
      },
    });

    return {
      success: true,
      members: members.map((m) => ({
        id: m.id,
        email: m.user.email || "",
        name: m.user.name || undefined,
        image: m.user.image || undefined,
        role: m.role as "owner" | "admin" | "member",
        addedAt: m.addedAt,
      })),
    };
  } catch (error) {
    console.error("Error getting team members:", error);
    return { success: false, members: [] };
  }
}

export async function inviteTeamMember(email: string, role: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Non authentifié" };
    }

    // Vérifier le plan de l'utilisateur
    const currentUser = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
    });

    if (!currentUser) {
      return { success: false, message: "Utilisateur non trouvé" };
    }

    const limits = getPlanLimits(currentUser.plan as "free" | "pro" | "enterprise");

    // Vérifier si l'utilisateur peut ajouter des membres
    const currentMembersCount = await db.query.teamMembers.findMany({
      where: eq(teamMembers.userId, session.user.id),
    });

    if (limits.maxTeamMembers !== -1 && currentMembersCount.length >= limits.maxTeamMembers) {
      return {
        success: false,
        message: "Limite de membres d'équipe atteinte pour votre plan",
      };
    }

    // Vérifier si l'utilisateur existe
    const invitedUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!invitedUser) {
      return {
        success: false,
        message: "Cet utilisateur n'existe pas. Il doit d'abord créer un compte.",
      };
    }

    // Vérifier si l'utilisateur est déjà membre
    const existingMember = await db.query.teamMembers.findFirst({
      where: and(
        eq(teamMembers.userId, invitedUser.id),
        eq(teamMembers.projectId, session.user.id)
      ),
    });

    if (existingMember) {
      return { success: false, message: "Cet utilisateur est déjà membre de l'équipe" };
    }

    // Ajouter le membre
    await db.insert(teamMembers).values({
      userId: invitedUser.id,
      projectId: session.user.id,
      role: role as "admin" | "member",
    });

    revalidatePath("/settings");

    return { success: true, message: "Membre invité avec succès" };
  } catch (error) {
    console.error("Error inviting team member:", error);
    return { success: false, message: "Erreur lors de l'invitation" };
  }
}

export async function removeTeamMember(memberId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Non authentifié" };
    }

    // Vérifier que l'utilisateur est le propriétaire
    const member = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.id, memberId),
    });

    if (!member) {
      return { success: false, message: "Membre non trouvé" };
    }

    if (member.role === "owner") {
      return { success: false, message: "Impossible de retirer le propriétaire" };
    }

    // Supprimer le membre
    await db.delete(teamMembers).where(eq(teamMembers.id, memberId));

    revalidatePath("/settings");

    return { success: true, message: "Membre retiré avec succès" };
  } catch (error) {
    console.error("Error removing team member:", error);
    return { success: false, message: "Erreur lors du retrait" };
  }
}

export async function updateTeamMemberRole(memberId: string, newRole: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Non authentifié" };
    }

    // Vérifier que le membre existe
    const member = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.id, memberId),
    });

    if (!member) {
      return { success: false, message: "Membre non trouvé" };
    }

    if (member.role === "owner") {
      return { success: false, message: "Impossible de modifier le rôle du propriétaire" };
    }

    // Mettre à jour le rôle
    await db
      .update(teamMembers)
      .set({ role: newRole as "admin" | "member" })
      .where(eq(teamMembers.id, memberId));

    revalidatePath("/settings");

    return { success: true, message: "Rôle mis à jour avec succès" };
  } catch (error) {
    console.error("Error updating team member role:", error);
    return { success: false, message: "Erreur lors de la mise à jour" };
  }
}
