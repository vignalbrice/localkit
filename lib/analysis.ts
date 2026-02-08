export type UiCell = {
  id?: number;
  value: string;
  placeholders: string[];
  updatedAt: string;
};

export type MatrixRow = {
  namespace: string;
  dotKey: string;
  fullKey: string; // ns.dotKey
  cells: Record<string, UiCell | null>; // locale => cell or null
  missingLocales: string[];
  placeholderIssues: { locale: string; expected: string[]; got: string[] }[];
};

function eqSet(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const A = new Set(a);
  for (const x of b) if (!A.has(x)) return false;
  return true;
}

export function buildMatrix(args: {
  entries: {
    id: number;
    locale: string;
    namespace: string;
    dotKey: string;
    value: string;
    placeholders: string[];
    updatedAt: string;
  }[];
}) {
  const localesSet = new Set<string>();
  const nsSet = new Set<string>();
  const keySet = new Set<string>(); // ns||dotKey

  const index = new Map<string, Map<string, unknown>>(); // key -> locale -> entry

  for (const e of args.entries) {
    localesSet.add(e.locale);
    nsSet.add(e.namespace);
    keySet.add(`${e.namespace}||${e.dotKey}`);

    const k = `${e.namespace}||${e.dotKey}`;
    if (!index.has(k)) index.set(k, new Map());
    index.get(k)!.set(e.locale, e);
  }

  const locales = Array.from(localesSet).sort((a, b) => a.localeCompare(b));
  const rows: MatrixRow[] = [];

  for (const k of Array.from(keySet).sort((a, b) => a.localeCompare(b))) {
    const [namespace, dotKey] = k.split("||");
    const byLocale = index.get(k)!;

    const cells: Record<string, UiCell | null> = {};
    for (const lng of locales) {
      const e = byLocale.get(lng) as
        | {
          id: number;
          value: string;
          placeholders: string[];
          updatedAt: string;
        }
        | undefined;
      cells[lng] = e
        ? { id: e.id, value: e.value, placeholders: e.placeholders, updatedAt: e.updatedAt }
        : null;
    }

    const missingLocales = locales.filter((lng) => !byLocale.has(lng));

    // placeholder issues: compare to first non-null as baseline
    const baselineLocale = locales.find((lng) => byLocale.has(lng));
    const placeholderIssues: MatrixRow["placeholderIssues"] = [];

    if (baselineLocale) {
      const base = byLocale.get(baselineLocale) as { placeholders: string[] } | undefined;
      const expected = (base?.placeholders ?? []) as string[];

      for (const lng of locales) {
        const cur = byLocale.get(lng) as { placeholders: string[] } | undefined;
        if (!cur) continue;
        const got = (cur.placeholders ?? []) as string[];
        if (!eqSet(expected, got)) {
          placeholderIssues.push({ locale: lng, expected, got });
        }
      }
    }

    rows.push({
      namespace,
      dotKey,
      fullKey: `${namespace}.${dotKey}`,
      cells,
      missingLocales,
      placeholderIssues,
    });
  }

  return { locales, rows, namespaces: Array.from(nsSet).sort((a, b) => a.localeCompare(b)) };
}
