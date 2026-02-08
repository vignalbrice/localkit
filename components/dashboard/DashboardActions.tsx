"use client";

import { Button } from "@/components/ui/button";
import { Plus, Upload, FileJson } from "lucide-react";
import { useTranslations } from "next-intl";

interface DashboardActionsProps {
  isImporting: boolean;
  onImportZip: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenJsonImportDialog: () => void;
  onOpenCreateDialog: () => void;
}

export function DashboardActions({
  isImporting,
  onImportZip,
  onOpenJsonImportDialog,
  onOpenCreateDialog,
}: DashboardActionsProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-semibold mb-1">
          {t("projects.title")}
        </h2>
        <p className="text-sm sm:text-base text-slate-600">
          {t("projects.subtitle")}
        </p>
      </div>
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        <label htmlFor="import-zip" className="flex-1 sm:flex-none">
          <Button
            variant="outline"
            disabled={isImporting}
            asChild
            className="w-full"
          >
            <span>
              <Upload className="size-4 mr-2" />
              {isImporting ? t("projects.importing") : t("projects.importZip")}
            </span>
          </Button>
          <input
            id="import-zip"
            type="file"
            accept=".zip"
            onChange={onImportZip}
            className="hidden"
          />
        </label>

        <Button
          variant="outline"
          disabled={isImporting}
          className="flex-1 sm:flex-none"
          onClick={onOpenJsonImportDialog}
        >
          <FileJson className="size-4 mr-2" />
          <span className="hidden sm:inline">{t("projects.importJson")}</span>
          <span className="sm:hidden">JSON</span>
        </Button>

        <Button className="flex-1 sm:flex-none" onClick={onOpenCreateDialog}>
          <Plus className="size-4 mr-2" />
          <span className="hidden sm:inline">{t("projects.newProject")}</span>
          <span className="sm:hidden">{t("projects.newProject")}</span>
        </Button>
      </div>
    </div>
  );
}
