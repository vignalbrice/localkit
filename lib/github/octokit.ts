import { Octokit } from "octokit";
import { getInstallationToken } from "./appAuth";

export async function getAppOctokit(installationId: string) {
  const token = await getInstallationToken(installationId);
  return new Octokit({ auth: token });
}
