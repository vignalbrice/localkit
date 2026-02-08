"use client";

import { useTranslations } from "next-intl";
import { Key } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ApiKeysSection() {
  const t = useTranslations();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="size-5" />
          {t("settings.api.title")}
        </CardTitle>
        <CardDescription>{t("settings.api.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Badge variant="secondary" className="mb-2">
            {t("settings.api.comingSoon")}
          </Badge>
          <p className="text-sm text-slate-600">
            {t("settings.api.apiAccessDescription")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
