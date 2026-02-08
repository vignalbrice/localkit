"use client";

import { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Github } from "lucide-react";
import type { GitHubConnection } from "../../app/projects/[projectId]/types";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface GitHubDialogProps {
  isOpen: boolean;
  githubConnection: GitHubConnection | null;
  hasGithubAuth: boolean;
  projectId: string;
  onOpenChange: (open: boolean) => void;
  onConnect: (repository: string, branch: string) => void;
  onDisconnect: () => void;
}

interface Repository {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  description: string | null;
}

interface Branch {
  name: string;
  protected: boolean;
}

export default function GitHubDialog({
  isOpen,
  githubConnection,
  hasGithubAuth,
  onOpenChange,
  onConnect,
  onDisconnect,
}: GitHubDialogProps) {
  const t = useTranslations();
  const [githubRepo, setGithubRepo] = useState("");
  const [githubBranch, setGithubBranch] = useState("main");
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const loadGithubRepositories = useCallback(async () => {
    setLoadingRepos(true);
    try {
      const res = await fetch("/api/github/repositories");
      if (res.ok) {
        const data = await res.json();
        setRepositories(data.repositories || []);
      } else {
        toast.error(t("projects.github.errorLoadingRepos"));
      }
    } catch (error) {
      console.error("Error loading repositories:", error);
      toast.error(t("projects.github.errorLoadingRepos"));
    } finally {
      setLoadingRepos(false);
    }
  }, [t]);

  useEffect(() => {
    if (
      isOpen &&
      hasGithubAuth &&
      !githubConnection &&
      repositories.length === 0
    ) {
      loadGithubRepositories();
    }
  }, [
    isOpen,
    hasGithubAuth,
    githubConnection,
    repositories.length,
    loadGithubRepositories,
  ]);

  useEffect(() => {
    if (githubConnection) {
      const repo = `${githubConnection.repoOwner}/${githubConnection.repoName}`;
      setGithubRepo(repo);
      setGithubBranch(githubConnection.defaultBranch);
    }
  }, [githubConnection]);

  const loadGithubBranches = async (fullName: string) => {
    const [owner, repo] = fullName.split("/");
    if (!owner || !repo) return;

    setLoadingBranches(true);
    try {
      const res = await fetch(
        `/api/github/repositories/${owner}/${repo}/branches`,
      );
      if (res.ok) {
        const data = await res.json();
        setBranches(data.branches || []);
        const defaultBranch =
          repositories.find((r) => r.fullName === fullName)?.defaultBranch ||
          "main";
        setGithubBranch(defaultBranch);
      } else {
        toast.error(t("projects.github.errorLoadingBranches"));
      }
    } catch (error) {
      console.error("Error loading branches:", error);
      toast.error(t("projects.github.errorLoadingBranches"));
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleRepoChange = (fullName: string) => {
    setGithubRepo(fullName);
    setBranches([]);
    setGithubBranch("main");
    if (fullName) {
      loadGithubBranches(fullName);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {githubConnection ? "Connexion GitHub" : "Connecter à GitHub"}
          </DialogTitle>
          <DialogDescription>
            {githubConnection
              ? "Gérer la connexion GitHub de ce projet"
              : "Connecter ce projet à un dépôt GitHub pour la synchronisation"}
          </DialogDescription>
        </DialogHeader>
        {githubConnection ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Dépôt connecté</Label>
              <div className="flex items-center gap-2 p-3 border rounded-lg bg-slate-50">
                <Github className="size-5 text-slate-600" />
                <span className="font-mono text-sm">
                  {githubConnection.repoOwner}/{githubConnection.repoName}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Branche</Label>
              <Input
                value={githubConnection.defaultBranch}
                disabled
                className="bg-slate-50"
              />
            </div>
            <div className="space-y-2">
              <Label>Chemin des locales</Label>
              <Input
                value={githubConnection.localesPath}
                disabled
                className="bg-slate-50"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fermer
              </Button>
              <Button variant="destructive" onClick={onDisconnect}>
                Déconnecter
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {loadingRepos ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-600">
                  Chargement des dépôts...
                </p>
              </div>
            ) : repositories.length > 0 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="github-repo">Dépôt GitHub</Label>
                  <Select value={githubRepo} onValueChange={handleRepoChange}>
                    <SelectTrigger id="github-repo">
                      <SelectValue placeholder="Sélectionnez un dépôt" />
                    </SelectTrigger>
                    <SelectContent>
                      {repositories.map((repo) => (
                        <SelectItem key={repo.id} value={repo.fullName}>
                          <div className="flex flex-col items-start">
                            <span className="font-mono text-sm">
                              {repo.fullName}
                            </span>
                            {repo.description && (
                              <span className="text-xs text-slate-500 truncate max-w-60">
                                {repo.description}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    Sélectionnez le dépôt à connecter à ce projet
                  </p>
                </div>
                {githubRepo && (
                  <div className="space-y-2">
                    <Label htmlFor="github-branch">Branche</Label>
                    {loadingBranches ? (
                      <div className="flex items-center gap-2 p-2 text-sm text-slate-600">
                        <span>Chargement des branches...</span>
                      </div>
                    ) : branches.length > 0 ? (
                      <Select
                        value={githubBranch}
                        onValueChange={setGithubBranch}
                      >
                        <SelectTrigger id="github-branch">
                          <SelectValue placeholder="Sélectionnez une branche" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch.name} value={branch.name}>
                              <div className="flex items-center gap-2">
                                <span>{branch.name}</span>
                                {branch.protected && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    protégée
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="github-branch"
                        placeholder="main"
                        value={githubBranch}
                        onChange={(e) => setGithubBranch(e.target.value)}
                      />
                    )}
                    <p className="text-xs text-slate-500">
                      Branche à utiliser pour la synchronisation
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="github-repo">Dépôt GitHub</Label>
                  <Input
                    id="github-repo"
                    placeholder="owner/repository"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                  />
                  <p className="text-xs text-slate-500">
                    Format: propriétaire/nom-du-dépôt
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github-branch">Branche</Label>
                  <Input
                    id="github-branch"
                    placeholder="main"
                    value={githubBranch}
                    onChange={(e) => setGithubBranch(e.target.value)}
                  />
                  <p className="text-xs text-slate-500">
                    Branche par défaut du dépôt
                  </p>
                </div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button
                onClick={() => onConnect(githubRepo, githubBranch)}
                disabled={!githubRepo.trim()}
              >
                Connecter
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
