import JSZip from "jszip";

function unflattenToJson(flat: Record<string, string>) {
  const root: Record<string, unknown> = {};
  for (const dotKey of Object.keys(flat).sort((a, b) => a.localeCompare(b))) {
    const parts = dotKey.split(".");
    let cur: Record<string, unknown> = root;
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      const isLeaf = i === parts.length - 1;
      if (isLeaf) cur[p] = flat[dotKey];
      else {
        if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
        cur = cur[p] as Record<string, unknown>;
      }
    }
  }
  return root;
}

function stableSortDeep(obj: unknown): unknown {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return obj;
  const out: Record<string, unknown> = {};
  const record = obj as Record<string, unknown>;
  for (const k of Object.keys(record).sort((a, b) => a.localeCompare(b))) {
    out[k] = stableSortDeep(record[k]);
  }
  return out;
}

/**
 * Create a ZIP with layout locales/{lng}/{ns}.json
 */
export async function exportI18nextZip(args: {
  locales: string[];
  namespaces: string[];
  values: Record<string, Record<string, Record<string, string>>>; // [locale][ns][dotKey] => value
  indent?: number;
}) {
  const zip = new JSZip();
  const indent = args.indent ?? 2;

  for (const locale of args.locales) {
    for (const ns of args.namespaces) {
      const flat = args.values?.[locale]?.[ns] ?? {};
      const nested = stableSortDeep(unflattenToJson(flat));
      const json = JSON.stringify(nested, null, indent) + "\n";
      zip.file(`locales/${locale}/${ns}.json`, json);
    }
  }

  return zip.generateAsync({ type: "nodebuffer" });
}
