"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

interface CreateProjectDialogProps {
  isOpen: boolean;
  isCreating: boolean;
  projectName: string;
  onOpenChange: (open: boolean) => void;
  onProjectNameChange: (name: string) => void;
  onCreateProject: () => void;
}

export function CreateProjectDialog({
  isOpen,
  isCreating,
  projectName,
  onOpenChange,
  onProjectNameChange,
  onCreateProject,
}: CreateProjectDialogProps) {
  const t = useTranslations();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("projects.createProject")}</DialogTitle>
          <DialogDescription>
            {t("projects.noProjectsDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">{t("projects.newProject")}</Label>
            <Input
              id="project-name"
              placeholder={t("projects.newProject")}
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onCreateProject()}
              disabled={isCreating}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            {t("actions.cancel")}
          </Button>
          <Button onClick={onCreateProject} disabled={isCreating}>
            {isCreating ? t("projects.importing") : t("projects.createProject")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
