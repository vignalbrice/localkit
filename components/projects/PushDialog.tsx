"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GitCommit, GitPullRequest } from "lucide-react";
import type { GitHubConnection } from "../../app/projects/[projectId]/types";
import { useTranslations } from "next-intl";

interface PushDialogProps {
  isOpen: boolean;
  githubConnection: GitHubConnection | null;
  stats: {
    locales: number;
    namespaces: number;
  };
  onOpenChange: (open: boolean) => void;
  onPush: (commitMessage: string, createPullRequest: boolean) => Promise<void>;
}

export default function PushDialog({
  isOpen,
  githubConnection,
  stats,
  onOpenChange,
  onPush,
}: PushDialogProps) {
  const t = useTranslations();
  const [commitMessage, setCommitMessage] = useState("");
  const [isPushing, setIsPushing] = useState(false);

  const handlePush = async (createPullRequest: boolean) => {
    setIsPushing(true);
    try {
      await onPush(commitMessage, createPullRequest);
      setCommitMessage("");
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("projects.github.pushDialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("projects.github.pushDialogDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="commit-message">
              {t("projects.github.commitMessageLabel")}
            </Label>
            <Input
              id="commit-message"
              placeholder={t("projects.github.commitMessagePlaceholder")}
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              disabled={isPushing}
            />
          </div>
          {githubConnection && (
            <div className="bg-slate-50 rounded-lg p-3 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Repository:</span>
                <span className="font-mono text-xs">
                  {githubConnection.repoOwner}/{githubConnection.repoName}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Branch:</span>
                <span className="font-mono text-xs">
                  {githubConnection.defaultBranch}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Files:</span>
                <span className="text-xs">
                  {stats.locales} × {stats.namespaces} ={" "}
                  {stats.locales * stats.namespaces} files
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => handlePush(false)}
            disabled={!commitMessage.trim() || isPushing}
            className="w-full"
          >
            <GitCommit className="size-4 mr-2" />
            {isPushing
              ? t("projects.github.pushing")
              : t("projects.github.directPush")}
          </Button>
          <Button
            onClick={() => handlePush(true)}
            disabled={!commitMessage.trim() || isPushing}
            variant="outline"
            className="w-full"
          >
            <GitPullRequest className="size-4 mr-2" />
            {t("projects.github.createPR")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
