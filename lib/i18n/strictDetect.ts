export function detectStrictLocaleNs(zipPath: string): { locale: string; namespace: string } | null {
  const p = zipPath.replaceAll("\\", "/").replace(/^\/+/, "");
  if (!p.toLowerCase().endsWith(".json")) return null;

  const parts = p.split("/").filter(Boolean);
  const i = parts.lastIndexOf("locales");
  if (i === -1) return null;

  // strict end at locales/{lng}/{ns}.json
  if (parts.length !== i + 3) return null;

  const locale = parts[i + 1];
  const file = parts[i + 2];

  if (!/^[a-z]{2}(-[A-Z]{2})?$/.test(locale)) return null;

  const namespace = file.replace(/\.json$/i, "");
  if (!namespace) return null;

  return { locale, namespace };
}
