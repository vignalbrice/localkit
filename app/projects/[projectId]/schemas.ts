import { z } from "zod";

// Schema pour ajouter une nouvelle clé
export const addKeySchema = z.object({
  namespace: z
    .string()
    .min(1, "Namespace is required")
    .regex(/^[a-zA-Z0-9_-]+$/, "Namespace must contain only letters, numbers, hyphens and underscores"),
  dotKey: z
    .string()
    .min(1, "Key is required")
    .regex(/^[a-zA-Z0-9._-]+$/, "Key must contain only letters, numbers, dots, hyphens and underscores"),
});

export type AddKeyFormData = z.infer<typeof addKeySchema>;

// Schema pour ajouter une nouvelle locale
export const addLocaleSchema = z.object({
  locale: z
    .string()
    .min(2, "Locale must be at least 2 characters")
    .max(5, "Locale must be at most 5 characters")
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/, "Locale must be in format: 'en', 'fr', 'en-US', etc.")
    .toLowerCase(),
});

export type AddLocaleFormData = z.infer<typeof addLocaleSchema>;

// Schema pour l'import JSON
export const jsonImportSchema = z.object({
  locale: z
    .string()
    .min(2, "Locale is required")
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/, "Invalid locale format"),
  namespace: z
    .string()
    .min(1, "Namespace is required")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid namespace format"),
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "File is required")
    .refine(
      (files) => files[0]?.type === "application/json" || files[0]?.name.endsWith(".json"),
      "File must be a JSON file"
    ),
});

export type JsonImportFormData = z.infer<typeof jsonImportSchema>;

// Schema pour l'import ZIP
export const zipImportSchema = z.object({
  file: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "File is required")
    .refine(
      (files) => files[0]?.type === "application/zip" || files[0]?.name.endsWith(".zip"),
      "File must be a ZIP file"
    ),
});

export type ZipImportFormData = z.infer<typeof zipImportSchema>;

// Schema pour la connexion GitHub
export const githubConnectionSchema = z.object({
  installationId: z.string().min(1, "Installation ID is required"),
  repoOwner: z.string().min(1, "Repository owner is required"),
  repoName: z.string().min(1, "Repository name is required"),
  defaultBranch: z.string().min(1, "Default branch is required"),
  localesPath: z.string().min(1, "Locales path is required"),
});

export type GithubConnectionFormData = z.infer<typeof githubConnectionSchema>;
