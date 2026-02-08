"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAN_LIMITS } from "@/lib/plans";
import type { PlanType } from "@/lib/plans";
import {
  ArrowLeft,
  Sparkles,
  Crown,
  Building2,
  Check,
  X,
  RefreshCw,
  MessageSquare,
  Shield,
  Code2,
  Zap,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { updateUserPlan, getUserPlan } from "./actions";

export default function BillingPage() {
  const router = useRouter();
  const t = useTranslations("billing");
  const tPlanDetails = useTranslations("billing.planDetails");
  const [currentPlan, setCurrentPlan] = useState<PlanType>("free");
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Charger le plan actuel depuis la base de données
  useEffect(() => {
    async function loadPlan() {
      try {
        const { plan } = await getUserPlan();
        setCurrentPlan(plan);
      } catch (error) {
        console.error("Erreur chargement plan:", error);
        toast.error(t("loadPlanError"));
      } finally {
        setIsLoading(false);
      }
    }
    loadPlan();
  }, [t]);

  const handleSelectPlan = async (plan: PlanType) => {
    if (plan === currentPlan) return;

    setIsUpdating(true);
    try {
      // Mettre à jour dans la base de données
      await updateUserPlan(plan);

      // Mettre à jour le localStorage pour la compatibilité
      const subscription = {
        plan,
        limits: PLAN_LIMITS[plan],
      };
      localStorage.setItem("i18n-subscription", JSON.stringify(subscription));

      // Mettre à jour l'état local
      setCurrentPlan(plan);

      // Message de succès
      const planName = t(`plan${plan.charAt(0).toUpperCase() + plan.slice(1)}`);
      toast.success(t("planSuccessMessage", { plan: planName }));

      // Rediriger vers le dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Erreur changement de plan:", error);
      toast.error(
        error instanceof Error ? error.message : t("planChangeError"),
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const plans = [
    {
      id: "free" as PlanType,
      name: "Gratuit",
      price: "0€",
      period: "/mois",
      description: "Pour découvrir et tester",
      icon: Sparkles,
      iconColor: "text-slate-600",
      bgColor: "from-slate-50 to-slate-100",
      popular: false,
      features: [
        { text: "1 projet", included: true },
        { text: "Jusqu'à 5 langues", included: true },
        { text: "1 000 clés de traduction", included: true },
        { text: "Import/Export ZIP et JSON", included: true },
        { text: "Intégration GitHub", included: true },
        { text: "Collaboration en équipe", included: false },
        { text: "Synchronisation auto", included: false },
        { text: "Support prioritaire", included: false },
      ],
    },
    {
      id: "pro" as PlanType,
      name: "Pro",
      price: "19€",
      period: "/mois",
      description: "Pour les équipes en croissance",
      icon: Crown,
      iconColor: "text-blue-600",
      bgColor: "from-blue-50 to-purple-50",
      popular: true,
      features: [
        { text: "Projets illimités", included: true },
        { text: "Langues illimitées", included: true },
        { text: "Clés illimitées", included: true },
        { text: "Import/Export ZIP et JSON", included: true },
        { text: "Intégration GitHub", included: true },
        { text: "Collaboration équipe (5 membres)", included: true },
        { text: "Synchronisation GitHub auto", included: true },
        { text: "Support prioritaire", included: true },
      ],
    },
    {
      id: "enterprise" as PlanType,
      name: "Entreprise",
      price: "99€",
      period: "/mois",
      description: "Pour les grandes organisations",
      icon: Building2,
      iconColor: "text-purple-600",
      bgColor: "from-purple-50 to-pink-50",
      popular: false,
      features: [
        { text: "Tout du plan Pro", included: true },
        { text: "Membres illimités", included: true },
        { text: "Gestion des rôles et permissions", included: true },
        { text: "API dédiée", included: true },
        { text: "SLA garanti 99.9%", included: true },
        { text: "Support dédié 24/7", included: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft className="size-4 mr-2" />
            {t("backToProjects")}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="size-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const isCurrentPlan = currentPlan === plan.id;

                return (
                  <Card
                    key={plan.id}
                    className={`relative ${
                      plan.popular
                        ? "border-2 border-blue-500 shadow-xl scale-105"
                        : "border-slate-200"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Badge className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                          {tPlanDetails("popular")}
                        </Badge>
                      </div>
                    )}

                    <CardHeader>
                      <div
                        className={`w-12 h-12 rounded-lg bg-linear-to-br ${plan.bgColor} flex items-center justify-center mb-4`}
                      >
                        <Icon className={`size-6 ${plan.iconColor}`} />
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription className="text-base">
                        {plan.description}
                      </CardDescription>
                      <div className="flex items-baseline gap-1 mt-4">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-slate-600">{plan.period}</span>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <Button
                        className="w-full mb-6"
                        variant={plan.popular ? "default" : "outline"}
                        disabled={isCurrentPlan || isUpdating}
                        onClick={() => handleSelectPlan(plan.id)}
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            {t("upgrading")}
                          </>
                        ) : isCurrentPlan ? (
                          t("currentPlan")
                        ) : (
                          t("selectPlan")
                        )}
                      </Button>

                      <div className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <div key={index} className="flex items-start gap-3">
                            {feature.included ? (
                              <Check className="size-5 text-green-600 shrink-0 mt-0.5" />
                            ) : (
                              <X className="size-5 text-slate-300 shrink-0 mt-0.5" />
                            )}
                            <span
                              className={`text-sm ${
                                feature.included
                                  ? "text-slate-700"
                                  : "text-slate-400"
                              }`}
                            >
                              {feature.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Features Section */}
            <div className="mt-20 max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">
                {tPlanDetails("featuresTitle")}
              </h2>

              <div className="grid gap-6 mb-12">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="size-5 text-purple-600" />
                      {t("featureDetails.teamCollaborationTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-3">
                      {t("featureDetails.teamCollaborationDescription")}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{t("planFree")}</span>
                        <Badge variant="outline">
                          {tPlanDetails("notAvailable")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>{t("planPro")}</span>
                        <Badge className="bg-green-100 text-green-800">
                          {tPlanDetails("upTo")} 5 {t("features.members")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>{t("planEnterprise")}</span>
                        <Badge className="bg-green-100 text-green-800">
                          {t("features.unlimitedMembers")}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className="size-5 text-blue-600" />
                      {t("featureDetails.autoSyncTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-3">
                      {t("featureDetails.autoSyncDescription")}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{t("planFree")}</span>
                        <Badge variant="outline">
                          {tPlanDetails("manualSyncOnly")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>{t("planPro")}</span>
                        <Badge className="bg-green-100 text-green-800">
                          {tPlanDetails("autoSyncEnabled")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>{t("planEnterprise")}</span>
                        <Badge className="bg-green-100 text-green-800">
                          {tPlanDetails("autoSyncPriority")}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="size-5 text-green-600" />
                      {t("featureDetails.prioritySupportTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-3">
                      {t("featureDetails.prioritySupportDescription")}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{t("planFree")}</span>
                        <Badge variant="outline">
                          {tPlanDetails("responseIn48h")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>{t("planPro")}</span>
                        <Badge className="bg-green-100 text-green-800">
                          {tPlanDetails("responseIn4h")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>{t("planEnterprise")}</span>
                        <Badge className="bg-green-100 text-green-800">
                          {tPlanDetails("responseIn1h")}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="size-5 text-orange-600" />
                      {t("featureDetails.rolesPermissionsTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-3">
                      {t("featureDetails.rolesPermissionsDescription")}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{t("planFree")}</span>
                        <Badge variant="outline">
                          {tPlanDetails("notAvailable")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>{t("planPro")}</span>
                        <Badge variant="outline">
                          {tPlanDetails("basicRoles")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>{t("planEnterprise")}</span>
                        <Badge className="bg-green-100 text-green-800">
                          {tPlanDetails("advancedManagement")}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-slate-50 rounded-md">
                      <p className="text-sm text-slate-700 font-medium mb-2">
                        {tPlanDetails("enterpriseFeatures")}
                      </p>
                      <ul className="text-xs text-slate-600 space-y-1">
                        <li>• {tPlanDetails("customRoles")}</li>
                        <li>• {tPlanDetails("granularPermissions")}</li>
                        <li>• {tPlanDetails("actionAudit")}</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code2 className="size-5 text-indigo-600" />
                      {t("featureDetails.dedicatedApiTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-3">
                      {t("featureDetails.dedicatedApiDescription")}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{t("planFree")}</span>
                        <Badge variant="outline">
                          {tPlanDetails("notAvailable")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>{t("planPro")}</span>
                        <Badge variant="outline">
                          {tPlanDetails("notAvailable")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>{t("planEnterprise")}</span>
                        <Badge className="bg-green-100 text-green-800">
                          API REST complète
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-slate-50 rounded-md">
                      <p className="text-sm text-slate-700 font-medium mb-2">
                        {tPlanDetails("apiFeatures")}
                      </p>
                      <ul className="text-xs text-slate-600 space-y-1">
                        <li>• {tPlanDetails("crudEndpoints")}</li>
                        <li>• {tPlanDetails("customWebhooks")}</li>
                        <li>• {tPlanDetails("adaptedRateLimiting")}</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="size-5 text-yellow-600" />
                      {t("featureDetails.slaGuaranteeTitle")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-3">
                      {t("featureDetails.slaGuaranteeDescription")}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{t("planFree")}</span>
                        <Badge variant="outline">
                          {tPlanDetails("noGuarantee")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>{t("planPro")}</span>
                        <Badge variant="outline">
                          {tPlanDetails("bestEffort")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>{t("planEnterprise")}</span>
                        <Badge className="bg-green-100 text-green-800">
                          99.9% {tPlanDetails("guaranteed")}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-slate-50 rounded-md">
                      <p className="text-sm text-slate-700 font-medium mb-2">
                        {tPlanDetails("slaIncludes")}
                      </p>
                      <ul className="text-xs text-slate-600 space-y-1">
                        <li>• {tPlanDetails("uptime247")}</li>
                        <li>• {tPlanDetails("downtimeCompensation")}</li>
                        <li>• {tPlanDetails("dedicatedTechSupport")}</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <h2 className="text-3xl font-bold text-center mb-8">
                {t("faq.title")}
              </h2>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("faq.changePlan")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">
                      {t("faq.changePlanAnswer")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("faq.exceedLimits")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">
                      {t("faq.exceedLimitsAnswer")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("faq.freeTrial")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{t("faq.freeTrialAnswer")}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
