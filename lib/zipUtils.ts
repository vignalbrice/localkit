import JSZip from 'jszip';


type Project = {
  languages: string[];
  namespaces: { name: string }[];
  translations: Record<string, Record<string, Record<string, string>>>;
};

export async function importFromJson(file: File, language: string, namespace: string): Promise<{
  languages: string[];
  namespaces: string[];
  translations: Record<string, Record<string, Record<string, string>>>;
}> {
  const content = await file.text();
  const json = JSON.parse(content);

  const translations: Record<string, Record<string, Record<string, string>>> = {};

  // Flatten nested JSON structure
  const flattenJson = (obj: object, prefix = ''): Record<string, string> => {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(result, flattenJson(value, newKey));
      } else {
        result[newKey] = String(value);
      }
    }
    return result;
  };

  translations[namespace] = {
    [language]: flattenJson(json),
  };

  return {
    languages: [language],
    namespaces: [namespace],
    translations,
  };
}

export async function importFromZip(file: File): Promise<{
  languages: string[];
  namespaces: string[];
  translations: Record<string, Record<string, Record<string, string>>>;
}> {
  const zip = new JSZip();
  const zipData = await zip.loadAsync(file);

  const languages = new Set<string>();
  const namespaces = new Set<string>();
  const translations: Record<string, Record<string, Record<string, string>>> = {};

  // Expected structure: locales/{lang}/{namespace}.json
  const localesFolder = zipData.folder('locales');
  if (!localesFolder) {
    throw new Error('ZIP must contain a "locales" folder');
  }

  // Process all files
  for (const [path, zipEntry] of Object.entries(zipData.files)) {
    if (zipEntry.dir) continue;

    // Parse path: locales/{lang}/{namespace}.json
    const match = path.match(/^locales\/([^\/]+)\/([^\/]+)\.json$/);
    if (!match) continue;

    const [, lang, namespace] = match;
    languages.add(lang);
    namespaces.add(namespace);

    const content = await zipEntry.async('text');
    const json = JSON.parse(content);

    if (!translations[namespace]) {
      translations[namespace] = {};
    }
    if (!translations[namespace][lang]) {
      translations[namespace][lang] = {};
    }

    // Flatten nested JSON structure
    const flattenJson = (obj: object, prefix = ''): Record<string, string> => {
      const result: Record<string, string> = {};
      for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          Object.assign(result, flattenJson(value, newKey));
        } else {
          result[newKey] = String(value);
        }
      }
      return result;
    };

    translations[namespace][lang] = flattenJson(json);
  }

  return {
    languages: Array.from(languages).sort(),
    namespaces: Array.from(namespaces).sort(),
    translations,
  };
}

export async function exportToZip(project: Project): Promise<Blob> {
  const zip = new JSZip();
  const localesFolder = zip.folder('locales');

  if (!localesFolder) {
    throw new Error('Failed to create locales folder');
  }

  // Create structure: locales/{lang}/{namespace}.json
  for (const namespace of project.namespaces) {
    for (const lang of project.languages) {
      const translations = project.translations[namespace.name]?.[lang] || {};

      // Unflatten the keys back to nested structure
      const unflattenJson = (flat: Record<string, string>): object => {
        const result: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(flat)) {
          const parts = key.split('.');
          let current = result;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) {
              current[parts[i]] = {};
            }
            current = current[parts[i]] as Record<string, unknown>;
          }
          current[parts[parts.length - 1]] = value;
        }
        return result;
      };

      const nestedJson = unflattenJson(translations);
      const langFolder = localesFolder.folder(lang);
      if (langFolder) {
        langFolder.file(`${namespace.name}.json`, JSON.stringify(nestedJson, null, 2));
      }
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}

export function extractPlaceholders(text: string): string[] {
  const placeholders: string[] = [];
  // Match {{placeholder}}, {placeholder}, $t(key), and ${variable} patterns
  const patterns = [
    /\{\{(\w+)\}\}/g,
    /\{(\w+)\}/g,
    /\$t\(([^)]+)\)/g,
    /\$\{(\w+)\}/g,
  ];

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      placeholders.push(match[0]);
    }
  }

  return [...new Set(placeholders)];
}