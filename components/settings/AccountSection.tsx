"use client";

import { useTranslations } from "next-intl";
import { User, Crown, ArrowRight } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AccountSectionProps {
  userEmail?: string;
  userName?: string;
  currentPlan: "free" | "pro" | "enterprise";
}

export function AccountSection({
  userEmail = "demo@example.com",
  userName,
  currentPlan = "free",
}: AccountSectionProps) {
  const t = useTranslations();
  const router = useRouter();

  const planNames = {
    free: t("settings.planFree"),
    pro: t("settings.planPro"),
    enterprise: t("settings.planEnterprise"),
  };

  const planColors = {
    free: "secondary",
    pro: "default",
    enterprise: "default",
  } as const;

  const handleChangePlan = () => {
    router.push("/billing");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="size-5" />
          {t("settings.accountTitle")}
        </CardTitle>
        <CardDescription>{t("settings.accountDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {userName && (
          <div className="space-y-2">
            <Label>{t("settings.nameLabel")}</Label>
            <Input value={userName} disabled />
          </div>
        )}
        <div className="space-y-2">
          <Label>{t("settings.emailLabel")}</Label>
          <Input value={userEmail} disabled />
          <p className="text-xs text-slate-500">
            {t("settings.accountDescription")}
          </p>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-semibold flex items-center gap-2">
                {t("settings.plan")}
                {currentPlan !== "free" && (
                  <Crown className="size-4 text-yellow-600" />
                )}
              </p>
              <p className="text-sm text-slate-600">
                {t("settings.currentPlan")} {planNames[currentPlan]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={planColors[currentPlan]}>
              {planNames[currentPlan]}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleChangePlan}
              className="gap-2"
            >
              {currentPlan === "free"
                ? t("settings.upgradeToPro")
                : t("settings.changePlan")}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
