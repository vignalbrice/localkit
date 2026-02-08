"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SettingsHeader() {
  const router = useRouter();
  const t = useTranslations();

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            <ArrowLeft className="size-4 mr-2" />
            {t("settings.back")}
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{t("settings.title")}</h1>
            <p className="text-sm text-slate-600">
              {t("settings.accountDescription")}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
