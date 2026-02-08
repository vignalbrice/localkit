"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { createProject, deleteProject, importZip, importJson } from "./actions";
import {
  DashboardHeader,
  DashboardActions,
  ProjectsGrid,
  CreateProjectDialog,
  ImportJsonDialog,
} from "../../components/dashboard";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Sparkles } from "lucide-react";

import type { PlanType } from "@/lib/plans";
import { canCreateProject, getPlanLimits } from "@/lib/plans";

interface Project {
  id: string;
  name: string;
  ownerUserId: string;
  localesPath: string;
  defaultBranch: string;
  createdAt: Date;
  githubRepo?: string | null;
  languages?: string[];
  namespaces?: { name: string; keys: string[] }[];
  updatedAt?: Date;
  _stats?: {
    languageCount: number;
    namespaceCount: number;
    entryCount: number;
  };
}

interface ProjectsClientProps {
  initialProjects: Project[];
  userName?: string | null;
  userEmail?: string | null;
  userPlan?: PlanType;
  onSignOut: () => Promise<void>;
}

export default function DashboardClient({
  initialProjects,
  userName,
  userEmail,
  userPlan = "free",
  onSignOut,
}: ProjectsClientProps) {
  const router = useRouter();
  const t = useTranslations();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJsonImportDialogOpen, setIsJsonImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [jsonImportFile, setJsonImportFile] = useState<File | null>(null);
  const [jsonProjectName, setJsonProjectName] = useState("");
  const [jsonLanguage, setJsonLanguage] = useState("");
  const [jsonNamespace, setJsonNamespace] = useState("");

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error(t("projects.newProject"));
      return;
    }

    // Vérifier les limites du plan
    if (!canCreateProject(initialProjects.length, userPlan)) {
      const planLimits = getPlanLimits(userPlan);
      toast.error(
        t("dashboard.planLimitReached", {
          limit: planLimits.maxProjects,
          plan: userPlan,
        }),
      );
      return;
    }

    setIsCreating(true);
    try {
      const { projectId } = await createProject(newProjectName);
      toast.success(t("dashboard.projectCreated") + " ✔");
      setNewProjectName("");
      setIsCreateDialogOpen(false);
      router.push(`/projects/${projectId}`);
    } catch (error) {
      toast.error(
        `${error instanceof Error ? error.message : t("errors.unknown")}`,
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      toast.success(t("dashboard.deleteProject") + " ✔");
      router.refresh();
    } catch (error) {
      toast.error(
        `${error instanceof Error ? error.message : t("errors.unknown")}`,
      );
    }
  };

  const handleSignOut = async () => {
    await onSignOut();
  };

  const handleImportZip = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await importZip(formData);
      toast.success(
        t("projects.importedSummary", {
          languageCount: data.languageCount || 0,
          namespaceCount: data.namespaceCount || 0,
        }),
      );
      router.push(`/projects/${data.projectId}`);
    } catch (error) {
      toast.error(
        `${error instanceof Error ? error.message : t("errors.unknown")}`,
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportJson = async () => {
    if (
      !jsonImportFile ||
      !jsonProjectName ||
      !jsonLanguage ||
      !jsonNamespace
    ) {
      toast.error(t("errors.fillAllFields") || "Please fill all fields");
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", jsonImportFile);
      formData.append("projectName", jsonProjectName);
      formData.append("language", jsonLanguage);
      formData.append("namespace", jsonNamespace);
      const data = await importJson(formData);
      toast.success(
        t("projects.importedSummary", {
          languageCount: data.languageCount || 0,
          namespaceCount: data.namespaceCount || 0,
        }),
      );
      setIsJsonImportDialogOpen(false);
      setJsonImportFile(null);
      setJsonProjectName("");
      setJsonLanguage("");
      setJsonNamespace("");
      router.push(`/projects/${data.projectId}`);
    } catch (error) {
      toast.error(
        `${error instanceof Error ? error.message : t("errors.unknown")}`,
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      <DashboardHeader
        userName={userName}
        userEmail={userEmail}
        onSignOut={handleSignOut}
      />

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Bannière du plan */}
        {userPlan === "free" && (
          <Alert className="mb-6 bg-linear-to-r from-blue-50 to-purple-50 border-blue-200">
            <Zap className="size-4" />
            <AlertTitle>{t("dashboard.freePlanBanner")}</AlertTitle>
            <AlertDescription className="flex items-center justify-between flex-wrap gap-4">
              <span>
                {initialProjects.length}/{getPlanLimits(userPlan).maxProjects}{" "}
                projet(s) • Limite: {getPlanLimits(userPlan).maxLanguages}{" "}
                langues • {getPlanLimits(userPlan).maxKeys} clés
              </span>
              <Button
                size="sm"
                className="ml-4"
                onClick={() => router.push("/billing")}
              >
                <Crown className="size-4 mr-2" />
                Passer au Pro
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {userPlan === "pro" && (
          <Alert className="mb-6 bg-linear-to-r from-blue-50 to-purple-50 border-blue-500">
            <Sparkles className="size-4 text-blue-600" />
            <AlertTitle className="text-blue-900">
              {t("dashboard.proPlanBanner")}
            </AlertTitle>
            <AlertDescription className="text-blue-800">
              {t("dashboard.proPlanDescription")}
            </AlertDescription>
          </Alert>
        )}
        {userPlan === "enterprise" && (
          <Alert className="mb-6 bg-linear-to-r from-purple-50 to-pink-50 border-purple-500">
            <Crown className="size-4 text-purple-600" />
            <AlertTitle className="text-purple-900">
              {t("dashboard.enterprisePlanBanner")}
            </AlertTitle>
            <AlertDescription className="text-purple-800">
              {t("dashboard.enterprisePlanDescription")}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-[1fr] gap-6 mb-6">
          <div className="space-y-4">
            <DashboardActions
              isImporting={isImporting}
              onImportZip={handleImportZip}
              onOpenJsonImportDialog={() => setIsJsonImportDialogOpen(true)}
              onOpenCreateDialog={() => setIsCreateDialogOpen(true)}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr] gap-6">
          <ProjectsGrid
            projects={initialProjects}
            isImporting={isImporting}
            onImportZip={handleImportZip}
            onOpenJsonImportDialog={() => setIsJsonImportDialogOpen(true)}
            onOpenCreateDialog={() => setIsCreateDialogOpen(true)}
            onDeleteProject={handleDeleteProject}
          />
        </div>
      </main>

      <CreateProjectDialog
        isOpen={isCreateDialogOpen}
        isCreating={isCreating}
        projectName={newProjectName}
        onOpenChange={setIsCreateDialogOpen}
        onProjectNameChange={setNewProjectName}
        onCreateProject={handleCreateProject}
      />

      <ImportJsonDialog
        isOpen={isJsonImportDialogOpen}
        isImporting={isImporting}
        projectName={jsonProjectName}
        language={jsonLanguage}
        namespace={jsonNamespace}
        file={jsonImportFile}
        onOpenChange={setIsJsonImportDialogOpen}
        onProjectNameChange={setJsonProjectName}
        onLanguageChange={setJsonLanguage}
        onNamespaceChange={setJsonNamespace}
        onFileChange={setJsonImportFile}
        onImport={handleImportJson}
      />
    </div>
  );
}
