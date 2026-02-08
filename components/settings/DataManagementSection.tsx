"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert.dialog";

interface DataManagementSectionProps {
  onClearData: () => void;
}

export function DataManagementSection({
  onClearData,
}: DataManagementSectionProps) {
  const t = useTranslations();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.dataManagement.title")}</CardTitle>
        <CardDescription>
          {t("settings.dataManagement.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              {t("settings.dataManagement.clearAll")}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("settings.dataManagement.clearConfirm")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("settings.dataManagement.clearNote")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={onClearData}>
                {t("actions.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <p className="text-xs text-slate-500 mt-2">
          {t("settings.dataManagement.clearNote")}
        </p>
      </CardContent>
    </Card>
  );
}
