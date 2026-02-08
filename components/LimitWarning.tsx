"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Zap } from "lucide-react";
import Link from "next/link";
import { PlanType, getPlanLimits } from "@/lib/plans";

interface LimitWarningProps {
  plan: PlanType;
  currentValue: number;
  limitType: "projects" | "languages" | "keys" | "teamMembers";
  className?: string;
}

export function LimitWarning({
  plan,
  currentValue,
  limitType,
  className,
}: LimitWarningProps) {
  const limits = getPlanLimits(plan);

  const limitConfig = {
    projects: {
      max: limits.maxProjects,
      label: "projets",
      upgradeMessage: "Passez à un plan supérieur pour créer plus de projets",
    },
    languages: {
      max: limits.maxLanguages,
      label: "langues",
      upgradeMessage: "Passez à un plan supérieur pour ajouter plus de langues",
    },
    keys: {
      max: limits.maxKeys,
      label: "clés de traduction",
      upgradeMessage: "Passez à un plan supérieur pour ajouter plus de clés",
    },
    teamMembers: {
      max: limits.maxTeamMembers,
      label: "membres d'équipe",
      upgradeMessage: "Passez à un plan supérieur pour inviter plus de membres",
    },
  };

  const config = limitConfig[limitType];

  // Si illimité, pas d'alerte
  if (config.max === -1) return null;

  const percentage = (currentValue / config.max) * 100;

  // Alerte critique (>= 90%)
  if (percentage >= 90) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Limite presque atteinte !</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            Vous utilisez {currentValue} sur {config.max} {config.label} (
            {Math.round(percentage)}%).
          </p>
          <p>{config.upgradeMessage}.</p>
          <Link href="/pricing-plan">
            <Button size="sm" variant="outline" className="mt-2">
              <Zap className="w-4 h-4 mr-2" />
              Voir les plans
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  // Avertissement (>= 75%)
  if (percentage >= 75) {
    return (
      <Alert className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Attention à vos limites</AlertTitle>
        <AlertDescription>
          Vous utilisez {currentValue} sur {config.max} {config.label} (
          {Math.round(percentage)}%).{" "}
          <Link href="/pricing-plan" className="underline font-medium">
            Passez à un plan supérieur
          </Link>{" "}
          pour éviter toute interruption.
        </AlertDescription>
      </Alert>
    );
  }

  // Pas d'alerte si < 75%
  return null;
}
