import SettingsClient from "./SettingsClient";
import { getGithubStatus, getTeamMembers } from "./actions";
import { getCurrentUser } from "@/utils/getCurrentUser";

export default async function SettingsPage() {
  // Récupérer les données GitHub côté serveur
  const githubStatus = await getGithubStatus();

  // Récupérer les données de l'équipe
  const teamData = await getTeamMembers();

  // Récupérer les informations du plan de l'utilisateur
  const { plan, planLimits, email, name } = await getCurrentUser();

  return (
    <SettingsClient
      initialGithubStatus={githubStatus}
      initialTeamMembers={teamData.members}
      currentUserPlan={plan}
      maxTeamMembers={planLimits.maxTeamMembers}
      userEmail={email}
      userName={name}
    />
  );
}
