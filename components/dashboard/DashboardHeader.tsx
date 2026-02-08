"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Languages, Settings } from "lucide-react";
import { useTranslations } from "next-intl";

interface DashboardHeaderProps {
  userName?: string | null;
  userEmail?: string | null;
  onSignOut: () => Promise<void>;
}

export function DashboardHeader({
  userName,
  userEmail,
  onSignOut,
}: DashboardHeaderProps) {
  const t = useTranslations();

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-linear-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
              <Languages className="size-5 sm:size-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg sm:text-xl">
                {t("app.title")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                {t("app.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <span className="text-xs sm:text-sm text-slate-600 truncate flex-1 sm:flex-none">
              {userName || userEmail}
            </span>
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Settings className="size-4 mr-2" />
                {t("settings.title")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="sm:hidden h-8 w-8 p-0"
              >
                <Settings className="size-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="hidden sm:flex"
            >
              {t("actions.signOut")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              className="sm:hidden text-xs px-2"
            >
              {t("actions.signOut")}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
