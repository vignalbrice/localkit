"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

import type { GithubStatus } from "./actions";
import {
  disconnectGithub,
  inviteTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
} from "./actions";
import {
  AccountSection,
  ApiKeysSection,
  DataManagementSection,
  GithubSection,
  SettingsHeader,
  TeamManagementSection,
} from "@/components/settings";
import type { TeamMember } from "@/components/settings/TeamManagementSection";

interface SettingsClientProps {
  initialGithubStatus: GithubStatus;
  initialTeamMembers: TeamMember[];
  currentUserPlan: "free" | "pro" | "enterprise";
  maxTeamMembers: number;
  userEmail: string;
  userName?: string;
}

export default function SettingsClient({
  initialGithubStatus,
  initialTeamMembers,
  currentUserPlan,
  maxTeamMembers,
  userEmail,
  userName,
}: SettingsClientProps) {
  const router = useRouter();
  const t = useTranslations();
  const searchParams = useSearchParams();
  const [isGithubConnected, setIsGithubConnected] = useState(
    initialGithubStatus.connected,
  );
  const [githubUser, setGithubUser] = useState<{
    username?: string;
    avatarUrl?: string;
  } | null>(
    initialGithubStatus.connected
      ? {
          username: initialGithubStatus.username,
          avatarUrl: initialGithubStatus.avatarUrl,
        }
      : null,
  );

  // Afficher un message de succès si l'utilisateur revient après OAuth
  useEffect(() => {
    if (searchParams.get("github-connected") === "true") {
      toast.success(t("settings.github.connectedSuccess"));
      // Nettoyer l'URL et recharger pour obtenir les nouvelles données
      router.replace("/settings");
      router.refresh();
    }
  }, [searchParams, router, t]);

  const handleConnectGithub = async () => {
    try {
      await signIn("github", {
        callbackUrl: "/settings?github-connected=true",
      });
    } catch (error) {
      toast.error(t("settings.github.connectFailed"));
      console.error("GitHub OAuth error:", error);
    }
  };

  const handleDisconnectGithub = async () => {
    try {
      const result = await disconnectGithub();

      if (result.success) {
        setIsGithubConnected(false);
        setGithubUser(null);
        toast.info(result.message, {
          duration: 10000,
          action: result.githubSettingsUrl
            ? {
                label: "Ouvrir les paramètres",
                onClick: () => window.open(result.githubSettingsUrl, "_blank"),
              }
            : undefined,
        });
        // Pas besoin de router.refresh() car revalidatePath est appelé dans la Server Action
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(t("settings.github.disconnectFailed"));
      console.error("Disconnect error:", error);
    }
  };

  const onHandleClearData = () => {
    localStorage.removeItem("i18n-projects");
    toast.success(t("settings.dataManagement.cleared"));
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <SettingsHeader />

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-6">
          <AccountSection
            userEmail={userEmail}
            userName={userName}
            currentPlan={currentUserPlan}
          />

          <TeamManagementSection
            teamMembers={initialTeamMembers}
            currentUserPlan={currentUserPlan}
            maxTeamMembers={maxTeamMembers}
            onInviteMember={inviteTeamMember}
            onRemoveMember={removeTeamMember}
            onUpdateRole={updateTeamMemberRole}
          />

          <GithubSection
            isConnected={isGithubConnected}
            githubUser={githubUser}
            currentUserPlan={currentUserPlan}
            onConnect={handleConnectGithub}
            onDisconnect={handleDisconnectGithub}
          />

          <ApiKeysSection />

          <DataManagementSection onClearData={onHandleClearData} />
        </div>
      </main>
    </div>
  );
}
