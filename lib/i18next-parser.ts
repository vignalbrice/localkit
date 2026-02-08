export function extractPlaceholders(text: string): string[] {
  const set = new Set<string>();

  const mustache = /{{\s*([\w.-]+)\s*}}/g;
  for (const m of text.matchAll(mustache)) set.add(m[1]);

  const braces = /{([\w.-]+)}/g;
  for (const m of text.matchAll(braces)) set.add(m[1]);

  const printf = /%s/g;
  const printfCount = (text.match(printf) ?? []).length;
  if (printfCount > 0) set.add("%s".repeat(printfCount));

  return Array.from(set);
}

export function flattenI18nextJson(
  input: unknown,
  opts?: { sortKeys?: boolean }
): { flat: Record<string, string>; nonString: { key: string; valueType: string }[] } {
  const flat: Record<string, string> = {};
  const nonString: { key: string; valueType: string }[] = [];

  function walk(node: unknown, prefix: string) {
    if (node === null || node === undefined) return;

    if (typeof node === "string") {
      flat[prefix] = node;
      return;
    }

    if (typeof node === "number" || typeof node === "boolean") {
      nonString.push({ key: prefix, valueType: typeof node });
      return;
    }

    if (Array.isArray(node)) {
      nonString.push({ key: prefix, valueType: "array" });
      return;
    }

    if (typeof node === "object") {
      const obj = node as Record<string, unknown>;
      const keys = Object.keys(obj);
      if (opts?.sortKeys) keys.sort((a, b) => a.localeCompare(b));
      for (const k of keys) {
        const nextPrefix = prefix ? `${prefix}.${k}` : k;
        walk(obj[k], nextPrefix);
      }
      return;
    }

    nonString.push({ key: prefix, valueType: typeof node });
  }

  if (typeof input !== "object" || input === null) {
    return { flat: {}, nonString: [{ key: "", valueType: typeof input }] };
  }

  walk(input, "");
  return { flat, nonString };
}
