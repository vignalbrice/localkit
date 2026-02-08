export function extractPlaceholders(text: string): string[] {
  const set = new Set<string>();

  // i18next interpolation: {{ name }}
  const mustache = /{{\s*([\w.-]+)\s*}}/g;
  for (const m of text.matchAll(mustache)) set.add(m[1]);

  // {name}
  const braces = /{([\w.-]+)}/g;
  for (const m of text.matchAll(braces)) set.add(m[1]);

  // %s occurrences (tokenized as "%s%s" etc. for count compare)
  const printf = /%s/g;
  const c = (text.match(printf) ?? []).length;
  if (c > 0) set.add("%s".repeat(c));

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
      const keys = Object.keys(node);
      if (opts?.sortKeys) keys.sort((a, b) => a.localeCompare(b));
      for (const k of keys) {
        const nextPrefix = prefix ? `${prefix}.${k}` : k;
        walk((node as Record<string, unknown>)[k], nextPrefix);
      }
      return;
    }

    nonString.push({ key: prefix, valueType: typeof node });
  }

  if (!input || typeof input !== "object") {
    return { flat: {}, nonString: [{ key: "", valueType: typeof input }] };
  }

  walk(input, "");
  return { flat, nonString };
}

export function unflattenToJson(flat: Record<string, string>) {
  const root: Record<string, unknown> = {};
  const keys = Object.keys(flat).sort((a, b) => a.localeCompare(b));

  for (const dotKey of keys) {
    const parts = dotKey.split(".");
    let cur = root;

    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      const isLeaf = i === parts.length - 1;

      if (isLeaf) cur[p] = flat[dotKey];
      else {
        if (!cur[p] || typeof cur[p] !== "object" || Array.isArray(cur[p])) cur[p] = {};
        cur = cur[p] as Record<string, unknown>;
      }
    }
  }

  return root;
}

export function stableSortDeep(obj: unknown): unknown {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;
  const out: Record<string, unknown> = {};
  const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
  for (const k of keys) out[k] = stableSortDeep((obj as Record<string, unknown>)[k]);
  return out;
}
