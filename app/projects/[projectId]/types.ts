// Shared types for project pages

export interface Entry {
  id: string;
  projectId: string;
  locale: string;
  namespace: string;
  dotKey: string;
  value: string;
  placeholders: string[];
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  ownerUserId: string;
  localesPath: string;
  defaultBranch: string;
  createdAt: Date;
}

export interface GitHubConnection {
  projectId?: string;
  installationId: string;
  repoOwner: string;
  repoName: string;
  defaultBranch: string;
  localesPath: string;
  createdAt?: Date;
  // Compatibilité avec l'ancien code
  repository?: string;
  branch?: string;
}

export interface ZipPreviewEntry {
  locale: string;
  namespace: string;
  data: Record<string, string>;
}

export interface GroupedRow {
  namespace: string;
  dotKey: string;
  values: Record<string, string>;
}
