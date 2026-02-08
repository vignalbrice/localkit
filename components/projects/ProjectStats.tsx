"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface ProjectStatsProps {
  stats: {
    total: number;
    complete: number;
    totalMissingTranslations: number;
    totalPossibleTranslations: number;
    withPlaceholderIssues: number;
  };
}

export default function ProjectStats({ stats }: ProjectStatsProps) {
  const t = useTranslations("projects");

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      <Card>
        <CardContent className="pt-3 pb-2 sm:pt-4 sm:pb-3">
          <div className="text-xl sm:text-2xl font-semibold text-slate-900">
            {stats.total}
          </div>
          <div className="text-xs sm:text-sm text-slate-600">
            {t("totalKeys")}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-3 pb-2 sm:pt-4 sm:pb-3">
          <div className="text-xl sm:text-2xl font-semibold text-green-600">
            {stats.complete}
          </div>
          <div className="text-xs sm:text-sm text-slate-600">
            {t("complete")}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-3 pb-2 sm:pt-4 sm:pb-3">
          <div className="text-xl sm:text-2xl font-semibold text-amber-600">
            {stats.totalMissingTranslations}
          </div>
          <div className="text-xs sm:text-sm text-slate-600">
            {t("missingTranslationsCount")}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {t("onPossible", { count: stats.totalPossibleTranslations })}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-3 pb-2 sm:pt-4 sm:pb-3">
          <div className="text-xl sm:text-2xl font-semibold text-red-600">
            {stats.withPlaceholderIssues}
          </div>
          <div className="text-xs sm:text-sm text-slate-600">
            {t("placeholderProblems")}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
