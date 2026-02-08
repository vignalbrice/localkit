"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Zap } from "lucide-react";
import { PLAN_LIMITS, type PlanType } from "@/lib/plans";

interface PlanManagementProps {
  currentPlan: PlanType;
}

export function PlanManagement({ currentPlan }: PlanManagementProps) {
  const plans: PlanType[] = ["free", "pro", "enterprise"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Votre abonnement</h2>
        <p className="text-gray-600">
          Gérez votre plan et accédez à plus de fonctionnalités
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const limits = PLAN_LIMITS[plan];
          const isCurrent = plan === currentPlan;
          const isUpgrade = plans.indexOf(plan) > plans.indexOf(currentPlan);

          const icons = {
            free: null,
            pro: <Sparkles className="w-5 h-5" />,
            enterprise: <Crown className="w-5 h-5" />,
          };

          const borderColors = {
            free: "border-gray-200",
            pro: "border-blue-500",
            enterprise: "border-purple-500",
          };

          return (
            <Card
              key={plan}
              className={`relative ${isCurrent ? borderColors[plan] + " border-2" : ""}`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-green-100 text-green-800">
                    Plan actuel
                  </Badge>
                </div>
              )}

              {plan === "pro" && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-100 text-blue-800">Populaire</Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-xl flex items-center gap-2">
                    {icons[plan]}
                    {limits.name}
                  </CardTitle>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{limits.price}€</span>
                  <span className="text-gray-600">/mois</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span>
                      {limits.maxProjects === -1
                        ? "Projets illimités"
                        : `${limits.maxProjects} projet${limits.maxProjects > 1 ? "s" : ""}`}
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span>
                      {limits.maxLanguages === -1
                        ? "Langues illimitées"
                        : `Jusqu'à ${limits.maxLanguages} langues`}
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span>
                      {limits.maxKeys === -1
                        ? "Clés illimitées"
                        : `${limits.maxKeys} clés`}
                    </span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <span>
                      {limits.maxTeamMembers === -1
                        ? "Membres illimités"
                        : `${limits.maxTeamMembers} membre${limits.maxTeamMembers > 1 ? "s" : ""}`}
                    </span>
                  </li>
                  {limits.githubSync && (
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span>Intégration GitHub</span>
                    </li>
                  )}
                  {limits.githubAutoSync && (
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span>Sync GitHub auto</span>
                    </li>
                  )}
                  {limits.prioritySupport && (
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span>Support prioritaire</span>
                    </li>
                  )}
                  {limits.roleManagement && (
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span>Gestion des rôles</span>
                    </li>
                  )}
                  {limits.apiAccess && (
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span>API dédiée</span>
                    </li>
                  )}
                  {limits.sla && (
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <span>SLA 99.9%</span>
                    </li>
                  )}
                </ul>

                <div className="pt-4">
                  {isCurrent ? (
                    <Button className="w-full" variant="outline" disabled>
                      Plan actuel
                    </Button>
                  ) : isUpgrade ? (
                    <Button className="w-full" variant="default">
                      <Zap className="w-4 h-4 mr-2" />
                      Passer à {limits.name}
                    </Button>
                  ) : (
                    <Button className="w-full" variant="ghost" disabled>
                      Rétrograder
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Période d&apos;essai</CardTitle>
          <CardDescription>
            Tous les plans payants incluent 14 jours d&apos;essai gratuit, sans
            engagement
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-1">
              Puis-je changer de plan à tout moment ?
            </h4>
            <p className="text-sm text-gray-600">
              Oui, vous pouvez passer à un plan supérieur ou inférieur à tout
              moment. Les changements prennent effet immédiatement.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">
              Que se passe-t-il si j&apos;atteins ma limite ?
            </h4>
            <p className="text-sm text-gray-600">
              Vous ne pourrez plus ajouter de nouveaux projets, langues ou clés
              tant que vous n&apos;aurez pas supprimé des éléments existants ou
              passé à un plan supérieur.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">
              Comment annuler mon abonnement ?
            </h4>
            <p className="text-sm text-gray-600">
              Vous pouvez annuler votre abonnement à tout moment depuis cette
              page. Votre accès aux fonctionnalités payantes continuera
              jusqu&apos;à la fin de votre période de facturation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
