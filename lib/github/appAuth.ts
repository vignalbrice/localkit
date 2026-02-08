import { SignJWT, importPKCS8 } from "jose";

function normalizePrivateKey(key: string) {
  // .env usually contains \n escaped
  return key.includes("\\n") ? key.replaceAll("\\n", "\n") : key;
}

export async function createAppJwt() {
  const appId = process.env.GITHUB_APP_ID!;
  const pk = normalizePrivateKey(process.env.GITHUB_APP_PRIVATE_KEY!);

  const privateKey = await importPKCS8(pk, "RS256");

  const now = Math.floor(Date.now() / 1000);
  // GitHub: exp <= 10 minutes
  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuedAt(now - 5)
    .setExpirationTime(now + 9 * 60)
    .setIssuer(appId)
    .sign(privateKey);

  return jwt;
}

export async function getInstallationToken(installationId: string): Promise<string> {
  const jwt = await createAppJwt();

  const res = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: "application/vnd.github+json"
    }
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Failed to create installation token: ${res.status} ${t}`);
  }

  const json = (await res.json()) as { token: string };
  return json.token;
}
