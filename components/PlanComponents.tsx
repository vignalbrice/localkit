"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { PlanType, getPlanLimits, getPlanFeatures } from "@/lib/plans";

interface PlanBadgeProps {
  plan: PlanType;
  className?: string;
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const icons = {
    free: null,
    pro: <Sparkles className="w-3 h-3" />,
    enterprise: <Crown className="w-3 h-3" />,
  };

  const colors = {
    free: "bg-gray-100 text-gray-800",
    pro: "bg-blue-100 text-blue-800",
    enterprise: "bg-purple-100 text-purple-800",
  };

  const limits = getPlanLimits(plan);

  return (
    <Badge className={`${colors[plan]} ${className}`}>
      {icons[plan]}
      <span className={icons[plan] ? "ml-1" : ""}>{limits.name}</span>
    </Badge>
  );
}

interface CurrentPlanCardProps {
  plan: PlanType;
  projectCount: number;
  languageCount?: number;
  keyCount?: number;
  teamMemberCount?: number;
}

export function CurrentPlanCard({
  plan,
  projectCount,
  languageCount = 0,
  keyCount = 0,
  teamMemberCount = 1,
}: CurrentPlanCardProps) {
  const limits = getPlanLimits(plan);

  const calculatePercentage = (current: number, max: number) => {
    if (max === -1) return 0; // illimité
    return Math.min((current / max) * 100, 100);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Votre plan actuel</CardTitle>
          <PlanBadge plan={plan} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Projets */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Projets</span>
            <span className="font-medium">
              {projectCount}
              {limits.maxProjects === -1 ? "" : ` / ${limits.maxProjects}`}
            </span>
          </div>
          {limits.maxProjects !== -1 && (
            <Progress
              value={calculatePercentage(projectCount, limits.maxProjects)}
              className="h-2"
            />
          )}
        </div>

        {/* Langues */}
        {languageCount > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Langues</span>
              <span className="font-medium">
                {languageCount}
                {limits.maxLanguages === -1 ? "" : ` / ${limits.maxLanguages}`}
              </span>
            </div>
            {limits.maxLanguages !== -1 && (
              <Progress
                value={calculatePercentage(languageCount, limits.maxLanguages)}
                className="h-2"
              />
            )}
          </div>
        )}

        {/* Clés */}
        {keyCount > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Clés de traduction</span>
              <span className="font-medium">
                {keyCount}
                {limits.maxKeys === -1 ? "" : ` / ${limits.maxKeys}`}
              </span>
            </div>
            {limits.maxKeys !== -1 && (
              <Progress
                value={calculatePercentage(keyCount, limits.maxKeys)}
                className="h-2"
              />
            )}
          </div>
        )}

        {/* Membres d'équipe */}
        {plan !== "free" && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Membres d&apos;équipe</span>
              <span className="font-medium">
                {teamMemberCount}
                {limits.maxTeamMembers === -1
                  ? ""
                  : ` / ${limits.maxTeamMembers}`}
              </span>
            </div>
            {limits.maxTeamMembers !== -1 && (
              <Progress
                value={calculatePercentage(
                  teamMemberCount,
                  limits.maxTeamMembers,
                )}
                className="h-2"
              />
            )}
          </div>
        )}

        {/* CTA Upgrade */}
        {plan !== "enterprise" && (
          <div className="pt-4 border-t">
            <Link href="/pricing-plan">
              <Button className="w-full" variant="default">
                <Zap className="w-4 h-4 mr-2" />
                {plan === "free" ? "Passer à Pro" : "Passer à Enterprise"}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface PlanFeaturesListProps {
  plan: PlanType;
}

export function PlanFeaturesList({ plan }: PlanFeaturesListProps) {
  const features = getPlanFeatures(plan);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Fonctionnalités du plan</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li
              key={index}
              className={`flex items-start gap-3 ${!feature.available ? "opacity-50" : ""}`}
            >
              <svg
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  feature.available ? "text-green-600" : "text-gray-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {feature.available ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                )}
              </svg>
              <div>
                <div className="font-medium text-sm">{feature.name}</div>
                <div className="text-sm text-gray-600">
                  {feature.description}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
