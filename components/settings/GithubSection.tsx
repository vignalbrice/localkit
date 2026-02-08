"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Github, CheckCircle2, AlertCircle, Crown, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-context-menu";

interface GithubSectionProps {
  isConnected: boolean;
  githubUser: {
    username?: string;
    avatarUrl?: string;
  } | null;
  currentUserPlan: "free" | "pro" | "enterprise";
  onConnect: () => void;
  onDisconnect: () => void;
}

export function GithubSection({
  isConnected,
  githubUser,
  currentUserPlan,
  onConnect,
  onDisconnect,
}: GithubSectionProps) {
  const t = useTranslations();
  const router = useRouter();

  const isProOrEnterprise =
    currentUserPlan === "pro" || currentUserPlan === "enterprise";

  const handleConnect = () => {
    if (!isProOrEnterprise) {
      router.push("/billing");
      return;
    }
    onConnect();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="size-5" />
          {t("settings.github.title")}
        </CardTitle>
        <CardDescription>{t("settings.github.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {githubUser?.avatarUrl && (
                <Image
                  src={githubUser.avatarUrl}
                  alt={githubUser.username || "GitHub user"}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="size-5" />
                  <span className="font-semibold">
                    {t("settings.github.connected")}
                  </span>
                </div>
                {githubUser?.username && (
                  <p className="text-sm text-slate-600">
                    @{githubUser.username}
                  </p>
                )}
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {t("settings.github.status")}
                </span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  {t("settings.active")}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">
                  {t("settings.github.permissions")}
                </span>
                <span className="text-xs">{t("settings.repositories")}</span>
              </div>
            </div>
            <Button variant="outline" onClick={onDisconnect}>
              {t("settings.github.disconnect")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {!isProOrEnterprise ? (
              <>
                <div className="flex items-center gap-2 text-amber-600">
                  <Lock className="size-5" />
                  <span className="font-semibold">
                    {t("settings.github.planRequired")}
                  </span>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-amber-900">
                    {t("settings.github.upgradeDescription")}
                  </p>
                  <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                    <li>{t("settings.github.benefit1")}</li>
                    <li>{t("settings.github.benefit2")}</li>
                    <li>{t("settings.github.benefit3")}</li>
                  </ul>
                </div>
                <Button onClick={handleConnect} className="gap-2">
                  <Crown className="size-4" />
                  {t("settings.github.upgradeToPro")}
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="size-5" />
                  <span className="font-semibold">
                    {t("settings.github.notConnected")}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-slate-600">
                    {t("settings.github.oauthDescription")}
                  </p>
                </div>
                <Button onClick={handleConnect}>
                  <Github className="size-4 mr-2" />
                  {t("settings.github.connect")}
                </Button>
              </>
            )}
          </div>
        )}

        <Separator />

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">
            {t("settings.github.howItWorksTitle")}
          </h4>
          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
            <li>{t("settings.github.howItWorks1")}</li>
            <li>{t("settings.github.howItWorks2")}</li>
            <li>{t("settings.github.howItWorks3")}</li>
            <li>{t("settings.github.howItWorks4")}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
