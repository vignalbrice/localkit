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

interface ImportJsonDialogProps {
  isOpen: boolean;
  isImporting: boolean;
  projectName: string;
  language: string;
  namespace: string;
  file: File | null;
  onOpenChange: (open: boolean) => void;
  onProjectNameChange: (name: string) => void;
  onLanguageChange: (language: string) => void;
  onNamespaceChange: (namespace: string) => void;
  onFileChange: (file: File | null) => void;
  onImport: () => void;
}

export function ImportJsonDialog({
  isOpen,
  isImporting,
  projectName,
  language,
  namespace,
  file,
  onOpenChange,
  onProjectNameChange,
  onLanguageChange,
  onNamespaceChange,
  onFileChange,
  onImport,
}: ImportJsonDialogProps) {
  const t = useTranslations();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("import.title")}</DialogTitle>
          <DialogDescription>{t("import.description")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="json-project-name">
              {t("projects.newProject")}
            </Label>
            <Input
              id="json-project-name"
              placeholder={t("projects.newProject")}
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
            />
            <p className="text-xs text-slate-500">{t("projects.newProject")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="json-import-file">{t("import.jsonFile")}</Label>
            <div className="flex gap-2">
              <Input
                id="json-import-file"
                type="file"
                accept=".json"
                onChange={(e) => onFileChange(e.target.files?.[0] || null)}
              />
            </div>
            {file && (
              <p className="text-sm text-slate-600">
                {t("import.jsonFile")}: {file.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="json-language">{t("import.locale")}</Label>
            <Input
              id="json-language"
              placeholder={t("import.localePlaceholder")}
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
            />
            <p className="text-xs text-slate-500">{t("import.localeHelp")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="json-namespace">{t("import.namespace")}</Label>
            <Input
              id="json-namespace"
              placeholder={t("import.namespacePlaceholder")}
              value={namespace}
              onChange={(e) => onNamespaceChange(e.target.value)}
            />
            <p className="text-xs text-slate-500">
              {t("import.namespaceHelp")}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isImporting}
          >
            {t("actions.cancel")}
          </Button>
          <Button onClick={onImport} disabled={isImporting}>
            {isImporting ? t("projects.importing") : t("projects.importJson")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
