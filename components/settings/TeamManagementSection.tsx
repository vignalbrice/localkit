"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Users, UserPlus, Trash2, Shield, Crown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert.dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface TeamMember {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: "owner" | "admin" | "member";
  addedAt: Date;
}

interface TeamManagementSectionProps {
  teamMembers: TeamMember[];
  currentUserPlan: "free" | "pro" | "enterprise";
  maxTeamMembers: number;
  onInviteMember: (
    email: string,
    role: string,
  ) => Promise<{ success: boolean; message: string }>;
  onRemoveMember: (
    memberId: string,
  ) => Promise<{ success: boolean; message: string }>;
  onUpdateRole: (
    memberId: string,
    newRole: string,
  ) => Promise<{ success: boolean; message: string }>;
}

export function TeamManagementSection({
  teamMembers,
  currentUserPlan,
  maxTeamMembers,
  onInviteMember,
  onRemoveMember,
  onUpdateRole,
}: TeamManagementSectionProps) {
  const t = useTranslations();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [isInviting, setIsInviting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  const canInviteMore =
    maxTeamMembers === -1 || teamMembers.length < maxTeamMembers;
  const isProOrEnterprise =
    currentUserPlan === "pro" || currentUserPlan === "enterprise";

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast.error(t("settings.team.invalidEmail"));
      return;
    }

    if (!canInviteMore) {
      toast.error(t("settings.team.limitReached"));
      return;
    }

    setIsInviting(true);
    try {
      const result = await onInviteMember(inviteEmail, inviteRole);
      if (result.success) {
        toast.success(result.message);
        setInviteEmail("");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error(t("settings.team.inviteFailed"));
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    try {
      const result = await onRemoveMember(memberId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error(t("settings.team.removeFailed"));
    } finally {
      setMemberToRemove(null);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const result = await onUpdateRole(memberId, newRole);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error(t("settings.team.updateRoleFailed"));
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4" />;
      case "admin":
        return <Shield className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (!isProOrEnterprise) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>{t("settings.team.title")}</CardTitle>
          </div>
          <CardDescription>{t("settings.team.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">
              {t("settings.team.upgradeRequired")}
            </p>
            <Button variant="default">{t("settings.team.upgradeToPro")}</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>{t("settings.team.title")}</CardTitle>
          </div>
          <CardDescription>
            {t("settings.team.description")}
            {maxTeamMembers !== -1 && (
              <span className="ml-2 text-sm font-medium">
                ({teamMembers.length}/{maxTeamMembers}{" "}
                {t("settings.team.members")})
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulaire d'invitation */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">
              {t("settings.team.inviteNewMember")}
            </h4>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder={t("settings.team.emailPlaceholder")}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={!canInviteMore || isInviting}
                className="flex-1"
              />
              <Select
                value={inviteRole}
                onValueChange={(value) =>
                  setInviteRole(value as "admin" | "member")
                }
                disabled={!canInviteMore || isInviting}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">
                    {t("settings.team.roles.member")}
                  </SelectItem>
                  <SelectItem value="admin">
                    {t("settings.team.roles.admin")}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleInvite}
                disabled={!canInviteMore || isInviting}
                className="gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {t("settings.team.invite")}
              </Button>
            </div>
            {!canInviteMore && (
              <p className="text-sm text-orange-600">
                {t("settings.team.limitReachedMessage")}
              </p>
            )}
          </div>

          {/* Liste des membres */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">
              {t("settings.team.currentMembers")}
            </h4>
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={member.image}
                        alt={member.name || member.email}
                      />
                      <AvatarFallback>
                        {(member.name || member.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.name || member.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant={getRoleBadgeVariant(member.role)}
                      className="gap-1"
                    >
                      {getRoleIcon(member.role)}
                      {t(`settings.team.roles.${member.role}`)}
                    </Badge>

                    {member.role !== "owner" && (
                      <div className="flex items-center gap-2">
                        <Select
                          value={member.role}
                          onValueChange={(value) =>
                            handleRoleChange(member.id, value)
                          }
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">
                              {t("settings.team.roles.member")}
                            </SelectItem>
                            <SelectItem value="admin">
                              {t("settings.team.roles.admin")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setMemberToRemove(member.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Informations sur la synchronisation auto */}
          {currentUserPlan === "pro" || currentUserPlan === "enterprise" ? (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900">
                    {t("settings.team.autoSyncEnabled")}
                  </p>
                  <p className="text-sm text-blue-700">
                    {t("settings.team.autoSyncDescription")}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={() => setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("settings.team.removeConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("settings.team.removeConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToRemove && handleRemove(memberToRemove)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("common.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
