"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import type { Entry, Project, GitHubConnection } from "./types";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  addLocale,
  addKey,
  deleteKey,
  updateEntry,
  connectGithub,
  disconnectGithub,
  pushToGithub,
} from "./actions";
import ProjectHeader from "../../../components/projects/ProjectHeader";
import ProjectStats from "../../../components/projects/ProjectStats";
import ProjectSidebar from "../../../components/projects/ProjectSidebar";
import ProjectEditor from "../../../components/projects/ProjectEditor";
import GitHubDialog from "../../../components/projects/GitHubDialog";
import PushDialog from "../../../components/projects/PushDialog";

interface ProjectClientProps {
  initialProject: Project;
  initialEntries: Entry[];
  initialGithubConnection: GitHubConnection | null;
  githubAuthParam?: string;
}

export function ProjectClient({
  initialProject,
  initialEntries,
  initialGithubConnection,
  githubAuthParam,
}: ProjectClientProps) {
  const router = useRouter();
  const t = useTranslations();
  const { data: session } = useSession();

  const [project] = useState<Project>(initialProject);
  const [entries, setEntries] = useState<Entry[]>(initialEntries);
  const [githubConnection, setGithubConnection] =
    useState<GitHubConnection | null>(initialGithubConnection);

  const [isAddLanguageOpen, setIsAddLanguageOpen] = useState(false);
  const [isAddNamespaceOpen, setIsAddNamespaceOpen] = useState(false);
  const [isAddKeyOpen, setIsAddKeyOpen] = useState(false);
  const [newLanguage, setNewLanguage] = useState("");
  const [newNamespace, setNewNamespace] = useState("");
  const [newKeyNamespace, setNewKeyNamespace] = useState("");
  const [newKeyDotKey, setNewKeyDotKey] = useState("");
  const [selectedNamespace, setSelectedNamespace] = useState<string>("all");
  const [filterIssues, setFilterIssues] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isGithubDialogOpen, setIsGithubDialogOpen] = useState(false);
  const [isPushDialogOpen, setIsPushDialogOpen] = useState(false);

  // Debounce timer pour les mises à jour
  const updateTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Afficher un message si l'utilisateur revient après OAuth
  useEffect(() => {
    if (githubAuthParam === "true") {
      toast.success(t("projects.github.connectedSuccess"));
      // Nettoyer l'URL
      router.replace(`/projects/${project.id}`);
      // Ouvrir le dialogue après un court délai
      setTimeout(() => {
        setIsGithubDialogOpen(true);
      }, 100);
    }
  }, [githubAuthParam, router, project.id, t]);

  // Vérifier si l'utilisateur a GitHub connecté
  const [hasGithubAuth, setHasGithubAuth] = useState(false);
  useEffect(() => {
    const checkGithubAuth = async () => {
      try {
        const res = await fetch("/api/user/github-status");
        if (res.ok) {
          const data = await res.json();
          setHasGithubAuth(data.connected);
        }
      } catch (error) {
        console.error("Error checking GitHub auth:", error);
      }
    };
    if (session) {
      checkGithubAuth();
    }
  }, [session]);

  async function handleUpdateEntry(
    locale: string,
    namespace: string,
    dotKey: string,
    value: string,
  ) {
    // Mise à jour immédiate de l'état local
    setEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.locale === locale &&
        entry.namespace === namespace &&
        entry.dotKey === dotKey
          ? { ...entry, value }
          : entry,
      ),
    );

    // Debounce de l'appel API (500ms)
    const key = `${locale}-${namespace}-${dotKey}`;
    const timers = updateTimers.current;

    if (timers.has(key)) {
      clearTimeout(timers.get(key)!);
    }

    const timer = setTimeout(async () => {
      try {
        const result = await updateEntry(
          project.id,
          locale,
          namespace,
          dotKey,
          value,
        );
        if (result.error) {
          toast.error(result.error);
          router.refresh();
        }
        timers.delete(key);
      } catch {
        toast.error(t("projects.errorSaving"));
        router.refresh();
      }
    }, 500);

    timers.set(key, timer);
  }

  const handleAddLanguage = async () => {
    if (!newLanguage.trim()) return;

    if (locales.includes(newLanguage)) {
      toast.error(t("projects.languageExists"));
      return;
    }

    // Mise à jour optimiste : créer les nouvelles entrées pour toutes les clés existantes
    const existingKeys = Array.from(
      new Set(entries.map((e) => `${e.namespace}:${e.dotKey}`)),
    );

    const newEntries: Entry[] = existingKeys.map((key) => {
      const [namespace, dotKey] = key.split(":");
      return {
        id: `temp-${Date.now()}-${namespace}-${dotKey}`,
        projectId: project.id,
        locale: newLanguage,
        namespace,
        dotKey,
        value: "",
        placeholders: [],
        updatedAt: new Date(),
      };
    });

    setEntries((prev) => [...prev, ...newEntries]);

    const result = await addLocale(project.id, newLanguage);

    if (result.error) {
      // En cas d'erreur, annuler la mise à jour optimiste
      setEntries((prev) => prev.filter((e) => !e.id.startsWith("temp-")));
      toast.error(result.error);
      return;
    }

    const isFirstLanguage = locales.length === 0;

    if (isFirstLanguage) {
      toast.success(
        t("projects.languageAddedFirst", { language: newLanguage }),
      );
    } else {
      toast.success(
        t("projects.languageAddedWithKeys", {
          language: newLanguage,
          count: result.created || 0,
        }),
      );
    }

    setNewLanguage("");
    setIsAddLanguageOpen(false);

    // Rafraîchir pour obtenir les vrais IDs de la base de données
    router.refresh();
  };

  const handleAddNamespace = async () => {
    if (!newNamespace.trim()) return;

    if (namespaces.includes(newNamespace)) {
      toast.error(t("projects.namespaceExists"));
      return;
    }

    // Un namespace est créé en ajoutant une clé de démonstration
    // Mise à jour optimiste : ajouter une clé par défaut dans ce namespace
    const defaultKey = "placeholder";
    const newEntries: Entry[] = locales.map((locale) => ({
      id: `temp-${Date.now()}-${locale}`,
      projectId: project.id,
      locale,
      namespace: newNamespace,
      dotKey: defaultKey,
      value: "",
      placeholders: [],
      updatedAt: new Date(),
    }));

    setEntries((prev) => [...prev, ...newEntries]);

    // Créer le namespace en ajoutant une clé par défaut
    const result = await addKey(project.id, newNamespace, defaultKey, locales);

    if (result.error) {
      // En cas d'erreur, annuler la mise à jour optimiste
      setEntries((prev) => prev.filter((e) => !e.id.startsWith("temp-")));
      toast.error(result.error);
      return;
    }

    toast.success(t("projects.namespaceAdded", { namespace: newNamespace }));
    setNewNamespace("");
    setIsAddNamespaceOpen(false);
    setSelectedNamespace(newNamespace);

    // Rafraîchir pour obtenir les vrais IDs
    router.refresh();
  };

  const handleAddKey = async () => {
    const finalNamespace = newKeyNamespace.trim() || "common";

    if (!newKeyDotKey.trim()) {
      toast.error(t("projects.enterKey"));
      return;
    }

    // Mise à jour optimiste : ajouter immédiatement les nouvelles entrées dans l'état local
    const newEntries: Entry[] = locales.map((locale) => ({
      id: `temp-${Date.now()}-${locale}`,
      projectId: project.id,
      locale,
      namespace: finalNamespace,
      dotKey: newKeyDotKey,
      value: "",
      placeholders: [],
      updatedAt: new Date(),
    }));

    setEntries((prev) => [...prev, ...newEntries]);

    const result = await addKey(
      project.id,
      finalNamespace,
      newKeyDotKey,
      locales,
    );

    if (result.error) {
      // En cas d'erreur, annuler la mise à jour optimiste
      setEntries((prev) => prev.filter((e) => !e.id.startsWith("temp-")));
      toast.error(result.error);
      return;
    }

    toast.success(
      t("projects.keyAdded", {
        key: newKeyDotKey,
        namespace: finalNamespace,
      }),
    );
    setNewKeyNamespace("");
    setNewKeyDotKey("");
    setIsAddKeyOpen(false);

    // Rafraîchir pour obtenir les vrais IDs de la base de données
    router.refresh();
  };

  const handleDeleteLanguage = async (lang: string) => {
    if (!confirm(t("projects.deleteLanguageConfirm", { language: lang })))
      return;

    // TODO: Implement API call to delete language
    toast.success(t("projects.languageDeleted", { language: lang }));
    router.refresh();
  };

  const handleDeleteKey = async (namespace: string, dotKey: string) => {
    if (!confirm(t("projects.deleteKeyConfirm", { key: dotKey, namespace })))
      return;

    // Mise à jour optimiste : supprimer immédiatement les entrées de l'état local
    const previousEntries = entries;
    setEntries((prev) =>
      prev.filter((e) => !(e.namespace === namespace && e.dotKey === dotKey)),
    );

    const result = await deleteKey(project.id, namespace, dotKey);

    if (result.error) {
      // En cas d'erreur, restaurer les entrées
      setEntries(previousEntries);
      toast.error(result.error);
      return;
    }

    toast.success(t("projects.keyDeleted", { key: dotKey }));
  };

  const handleConnectGithub = async (repository: string, branch: string) => {
    if (!hasGithubAuth) {
      toast.info(t("projects.github.needAuth"));
      await signIn("github", {
        callbackUrl: `/projects/${project.id}?github-auth=true`,
      });
      return;
    }

    if (!repository.trim()) {
      toast.error(t("projects.github.enterRepo"));
      return;
    }

    const result = await connectGithub(project.id, repository, branch);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(t("projects.github.connectedSuccess"));
    setIsGithubDialogOpen(false);
    router.refresh();
  };

  const handleDisconnectGithub = async () => {
    if (!confirm(t("projects.github.disconnectConfirm"))) return;

    const result = await disconnectGithub(project.id);
    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(t("projects.github.disconnected"));
    setGithubConnection(null);
    router.refresh();
  };

  const handlePushToGithub = async (
    commitMessage: string,
    createPullRequest: boolean,
  ) => {
    if (!githubConnection) {
      toast.error(t("projects.github.notConnected"));
      return;
    }

    if (!commitMessage.trim()) {
      toast.error(t("projects.github.commitMessageRequired"));
      return;
    }

    const result = await pushToGithub(
      project.id,
      commitMessage,
      createPullRequest,
    );

    // Si l'action retourne useApiRoute, on appelle l'API route côté client
    if (result.useApiRoute) {
      try {
        const res = await fetch(result.apiPath!, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result.payload),
        });

        if (res.ok) {
          const data = await res.json();
          setIsPushDialogOpen(false);

          if (data.type === "pull_request") {
            toast.success(t("projects.github.prCreated"), {
              action: {
                label: t("projects.github.viewPr"),
                onClick: () => window.open(data.url, "_blank"),
              },
            });
          } else {
            toast.success(t("projects.github.pushedSuccessfully"), {
              action: data.url
                ? {
                    label: t("projects.github.viewCommit"),
                    onClick: () => window.open(data.url, "_blank"),
                  }
                : undefined,
            });
          }
        } else {
          const data = await res.json();
          toast.error(data.error || t("projects.github.pushFailed"));
        }
      } catch (error) {
        toast.error(
          t("projects.github.pushFailedWithError", {
            error: error instanceof Error ? error.message : "Unknown error",
          }),
        );
      }
      return;
    }

    if (result.error) {
      toast.error(result.error);
    }
  };

  const handleImportUpdate = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/projects/${project.id}/import-merge`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        toast.success(t("projects.importSuccess"));
        router.refresh();
      } else {
        toast.error(t("projects.importFailed"));
      }
    } catch (error) {
      toast.error(
        t("projects.importFailedWithError", {
          error: error instanceof Error ? error.message : t("errors.unknown"),
        }),
      );
    }
  };

  // Compute unique locales and namespaces
  const locales = Array.from(new Set(entries.map((e) => e.locale)));
  const namespaces = Array.from(new Set(entries.map((e) => e.namespace)));

  // Compute translation keys grouped by namespace and key
  const translationKeys = useMemo(() => {
    const keysMap = new Map<
      string,
      {
        namespace: string;
        dotKey: string;
        translations: Record<string, string>;
        issues: {
          missingLanguages: string[];
          placeholderMismatches: Record<string, string[]>;
        };
      }
    >();

    for (const entry of entries) {
      const key = `${entry.namespace}:${entry.dotKey}`;

      if (!keysMap.has(key)) {
        keysMap.set(key, {
          namespace: entry.namespace,
          dotKey: entry.dotKey,
          translations: {},
          issues: {
            missingLanguages: [],
            placeholderMismatches: {},
          },
        });
      }

      const item = keysMap.get(key)!;
      item.translations[entry.locale] = entry.value;
    }

    // Calculate missing translations
    for (const item of keysMap.values()) {
      for (const locale of locales) {
        if (!item.translations[locale]) {
          item.issues.missingLanguages.push(locale);
        }
      }

      // Check for placeholder mismatches
      const allPlaceholders = new Map<string, string[]>();
      for (const [locale, value] of Object.entries(item.translations)) {
        const placeholders = value.match(/\{\{[^}]+\}\}/g) || [];
        allPlaceholders.set(locale, placeholders);
      }

      if (allPlaceholders.size > 0) {
        const referencePlaceholders =
          Array.from(allPlaceholders.values())[0] || [];
        for (const [locale, placeholders] of allPlaceholders) {
          const missing = referencePlaceholders.filter(
            (p) => !placeholders.includes(p),
          );
          if (missing.length > 0) {
            item.issues.placeholderMismatches[locale] = missing;
          }
        }
      }
    }

    return Array.from(keysMap.values());
  }, [entries, locales]);

  // Filter keys by namespace, search query, and issues
  const filteredKeys = useMemo(() => {
    let filtered = translationKeys;

    if (selectedNamespace !== "all") {
      filtered = filtered.filter((tk) => tk.namespace === selectedNamespace);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (tk) =>
          tk.dotKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
          Object.values(tk.translations).some((t) =>
            t.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    if (filterIssues === "missing") {
      filtered = filtered.filter((tk) => tk.issues.missingLanguages.length > 0);
    } else if (filterIssues === "placeholders") {
      filtered = filtered.filter(
        (tk) => Object.keys(tk.issues.placeholderMismatches).length > 0,
      );
    } else if (filterIssues === "any") {
      filtered = filtered.filter(
        (tk) =>
          tk.issues.missingLanguages.length > 0 ||
          Object.keys(tk.issues.placeholderMismatches).length > 0,
      );
    }

    return filtered;
  }, [translationKeys, searchQuery, selectedNamespace, filterIssues]);

  const stats = useMemo(() => {
    const total = translationKeys.length;
    const withMissing = translationKeys.filter(
      (tk) => tk.issues.missingLanguages.length > 0,
    ).length;
    const withPlaceholderIssues = translationKeys.filter(
      (tk) => Object.keys(tk.issues.placeholderMismatches).length > 0,
    ).length;
    const complete = total - withMissing;

    const totalMissingTranslations = translationKeys.reduce(
      (acc, tk) => acc + tk.issues.missingLanguages.length,
      0,
    );

    const totalPossibleTranslations = total * locales.length;

    return {
      entries: entries.length,
      locales: locales.length,
      namespaces: namespaces.length,
      total,
      complete,
      withMissing,
      withPlaceholderIssues,
      totalMissingTranslations,
      totalPossibleTranslations,
    };
  }, [entries.length, locales.length, namespaces.length, translationKeys]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <ProjectHeader
        project={project}
        stats={stats}
        githubConnection={githubConnection}
        onImportUpdate={handleImportUpdate}
        onOpenGithubDialog={() => setIsGithubDialogOpen(true)}
        onOpenPushDialog={() => setIsPushDialogOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <ProjectStats stats={stats} />

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mt-6">
          <ProjectSidebar
            locales={locales}
            namespaces={namespaces}
            selectedNamespace={selectedNamespace}
            filterIssues={filterIssues}
            isAddLanguageOpen={isAddLanguageOpen}
            isAddNamespaceOpen={isAddNamespaceOpen}
            newLanguage={newLanguage}
            newNamespace={newNamespace}
            onSelectedNamespaceChange={setSelectedNamespace}
            onFilterIssuesChange={setFilterIssues}
            onAddLanguageOpenChange={setIsAddLanguageOpen}
            onAddNamespaceOpenChange={setIsAddNamespaceOpen}
            onNewLanguageChange={setNewLanguage}
            onNewNamespaceChange={setNewNamespace}
            onAddLanguage={handleAddLanguage}
            onAddNamespace={handleAddNamespace}
            onDeleteLanguage={handleDeleteLanguage}
          />

          <ProjectEditor
            locales={locales}
            filteredKeys={filteredKeys}
            translationKeys={translationKeys}
            searchQuery={searchQuery}
            selectedNamespace={selectedNamespace}
            isAddKeyOpen={isAddKeyOpen}
            namespaces={namespaces}
            newKeyNamespace={newKeyNamespace}
            newKeyDotKey={newKeyDotKey}
            onSearchQueryChange={setSearchQuery}
            onAddKeyOpenChange={setIsAddKeyOpen}
            onNewKeyNamespaceChange={setNewKeyNamespace}
            onNewKeyDotKeyChange={setNewKeyDotKey}
            onAddKey={handleAddKey}
            onDeleteKey={handleDeleteKey}
            onUpdateEntry={handleUpdateEntry}
            onAddLanguageOpenChange={setIsAddLanguageOpen}
          />
        </div>
      </div>

      <GitHubDialog
        isOpen={isGithubDialogOpen}
        githubConnection={githubConnection}
        hasGithubAuth={hasGithubAuth}
        projectId={project.id}
        onOpenChange={setIsGithubDialogOpen}
        onConnect={handleConnectGithub}
        onDisconnect={handleDisconnectGithub}
      />

      <PushDialog
        isOpen={isPushDialogOpen}
        githubConnection={githubConnection}
        stats={stats}
        onOpenChange={setIsPushDialogOpen}
        onPush={handlePushToGithub}
      />
    </div>
  );
}

export default ProjectClient;
