"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Upload, Github, GitCommit } from "lucide-react";
import { useTranslations } from "next-intl";
import type {
  Project,
  GitHubConnection,
} from "@/app/projects/[projectId]/types";

interface ProjectHeaderProps {
  project: Project;
  stats: {
    entries: number;
    locales: number;
    namespaces: number;
  };
  githubConnection: GitHubConnection | null;
  onImportUpdate: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenGithubDialog: () => void;
  onOpenPushDialog: () => void;
}

export default function ProjectHeader({
  project,
  stats,
  githubConnection,
  onImportUpdate,
  onOpenGithubDialog,
  onOpenPushDialog,
}: ProjectHeaderProps) {
  const router = useRouter();
  const t = useTranslations("projects");

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="shrink-0"
              >
                <ArrowLeft className="size-4 sm:mr-2" />
                <span className="hidden sm:inline">{t("back")}</span>
              </Button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-semibold text-slate-900 truncate">
                  {project.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600">
                  {stats.locales} {t("languages")} • {stats.namespaces}{" "}
                  {t("namespaces")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {stats.entries} {t("keys")}
              </Badge>
              {githubConnection ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onOpenGithubDialog}
                    className="text-xs"
                  >
                    <Github className="size-3 sm:size-4 sm:mr-2" />
                    <span className="hidden sm:inline truncate max-w-30">
                      {githubConnection.repoOwner}/{githubConnection.repoName}
                    </span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onOpenPushDialog}
                    className="text-xs"
                  >
                    <GitCommit className="size-3 sm:size-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t("push")}</span>
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenGithubDialog}
                  className="text-xs"
                >
                  <Github className="size-3 sm:size-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t("connectGithub")}</span>
                </Button>
              )}
              <label htmlFor="import-update">
                <Button
                  className="font-medium text-xs"
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <span>
                    <Upload className="size-3 sm:size-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t("importMerge")}</span>
                  </span>
                </Button>
                <input
                  id="import-update"
                  type="file"
                  accept=".zip"
                  onChange={onImportUpdate}
                  className="hidden"
                />
              </label>
              <Button variant="outline" size="sm" asChild className="text-xs">
                <a href={`/api/projects/${project.id}/export`}>
                  <Download className="size-3 sm:size-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t("exportZip")}</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
