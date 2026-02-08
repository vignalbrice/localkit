"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen, Upload, FileJson, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProjectCard } from "./ProjectCard";

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

interface ProjectsGridProps {
  projects: Project[];
  isImporting: boolean;
  onImportZip: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenJsonImportDialog: () => void;
  onOpenCreateDialog: () => void;
  onDeleteProject: (projectId: string) => void;
}

export function ProjectsGrid({
  projects,
  isImporting,
  onImportZip,
  onOpenJsonImportDialog,
  onOpenCreateDialog,
  onDeleteProject,
}: ProjectsGridProps) {
  const t = useTranslations();

  if (projects.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
          <FolderOpen className="size-12 sm:size-16 text-slate-300 mb-4" />
          <h3 className="text-base sm:text-lg font-semibold mb-2">
            {t("projects.noProjectsTitle")}
          </h3>
          <p className="text-sm sm:text-base text-slate-600 mb-6 text-center max-w-md">
            {t("projects.noProjectsDescription")}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <label htmlFor="import-zip-empty" className="flex-1 sm:flex-none">
              <Button
                variant="outline"
                disabled={isImporting}
                asChild
                className="w-full"
              >
                <span>
                  <Upload className="size-4 mr-2" />
                  {t("projects.importZip")}
                </span>
              </Button>
              <input
                id="import-zip-empty"
                type="file"
                accept=".zip"
                onChange={onImportZip}
                className="hidden"
              />
            </label>
            <Button
              variant="outline"
              onClick={onOpenJsonImportDialog}
              disabled={isImporting}
              className="flex-1 sm:flex-none"
            >
              <FileJson className="size-4 mr-2" />
              {t("projects.importJson")}
            </Button>
            <Button
              onClick={onOpenCreateDialog}
              className="flex-1 sm:flex-none"
            >
              <Plus className="size-4 mr-2" />
              {t("projects.createProject")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onDelete={onDeleteProject}
        />
      ))}
    </div>
  );
}
