import { getAppOctokit } from "./octokit";
import { stableSortDeep, unflattenToJson } from "@/lib/i18next";

type FileMap = Record<string, string>; // path -> content

function toBase64(s: string) {
  return Buffer.from(s, "utf8").toString("base64");
}

export async function createLocalesPr(args: {
  installationId: string;
  owner: string;
  repo: string;
  baseBranch: string;
  headBranch: string; // will be created
  title: string;
  body?: string;
  files: FileMap; // full file paths (e.g. locales/en/common.json)
}) {
  const octokit = await getAppOctokit(args.installationId);

  // 1) get base SHA
  const baseRef = await octokit.rest.git.getRef({
    owner: args.owner,
    repo: args.repo,
    ref: `heads/${args.baseBranch}`
  });
  const baseSha = baseRef.data.object.sha;

  // 2) create branch
  await octokit.rest.git.createRef({
    owner: args.owner,
    repo: args.repo,
    ref: `refs/heads/${args.headBranch}`,
    sha: baseSha
  });

  // 3) upsert files via "createOrUpdateFileContents"
  // (simple approach; okay for MVP)
  for (const [path, content] of Object.entries(args.files)) {
    // check if file exists on branch to get sha
    let existingSha: string | undefined;
    try {
      const existing = await octokit.rest.repos.getContent({
        owner: args.owner,
        repo: args.repo,
        path,
        ref: args.headBranch
      });
      if (!Array.isArray(existing.data) && "sha" in existing.data) {
        existingSha = (existing.data as unknown as { sha: string }).sha;
      }
    } catch {
      // file doesn't exist yet
    }

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: args.owner,
      repo: args.repo,
      branch: args.headBranch,
      path,
      message: `chore(i18n): update ${path}`,
      content: toBase64(content),
      sha: existingSha
    });
  }

  // 4) open PR
  const pr = await octokit.rest.pulls.create({
    owner: args.owner,
    repo: args.repo,
    base: args.baseBranch,
    head: args.headBranch,
    title: args.title,
    body: args.body ?? ""
  });

  return pr.data.html_url;
}

// Helper to build file contents from values structure
export function buildI18nextFiles(args: {
  localesPath: string; // "locales"
  values: Record<string, Record<string, Record<string, string>>>; // [lng][ns][dotKey] => value
  indent?: number;
}) {
  const indent = args.indent ?? 2;
  const files: Record<string, string> = {};

  const locales = Object.keys(args.values).sort((a, b) => a.localeCompare(b));
  for (const lng of locales) {
    const namespaces = Object.keys(args.values[lng] ?? {}).sort((a, b) => a.localeCompare(b));
    for (const ns of namespaces) {
      const flat = args.values[lng][ns] ?? {};
      const nested = stableSortDeep(unflattenToJson(flat));
      const json = JSON.stringify(nested, null, indent) + "\n";
      files[`${args.localesPath}/${lng}/${ns}.json`] = json;
    }
  }

  return files;
}
