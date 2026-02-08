"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github } from "lucide-react";
import { useTranslations } from "next-intl";

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

interface ProjectCardProps {
  project: Project;
  onDelete: (projectId: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const router = useRouter();
  const t = useTranslations();

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-start justify-between text-base sm:text-lg">
          <span className="truncate pr-2">{project.name}</span>
          {project.githubRepo && (
            <Github className="size-4 text-slate-400 shrink-0" />
          )}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {t("table.updatedOn")}{" "}
          {new Date(
            project.updatedAt || project.createdAt,
          ).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-600">{t("filter.locales")}</span>
            <Badge variant="secondary" className="text-xs">
              {project._stats?.languageCount || project.languages?.length || 0}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-slate-600">{t("preview.namespaces")}</span>
            <Badge variant="secondary" className="text-xs">
              {project._stats?.namespaceCount ||
                project.namespaces?.length ||
                0}
            </Badge>
          </div>
          {project.languages && project.languages.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
              {project.languages.slice(0, 5).map((lang) => (
                <Badge key={lang} variant="outline" className="text-xs">
                  {lang}
                </Badge>
              ))}
              {project.languages.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{project.languages.length - 5}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-3 sm:mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-xs sm:text-sm h-8"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.id);
            }}
          >
            {t("table.delete")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
