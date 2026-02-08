"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface ProjectSidebarProps {
  locales: string[];
  namespaces: string[];
  selectedNamespace: string;
  filterIssues: string;
  isAddLanguageOpen: boolean;
  isAddNamespaceOpen: boolean;
  newLanguage: string;
  newNamespace: string;
  onSelectedNamespaceChange: (value: string) => void;
  onFilterIssuesChange: (value: string) => void;
  onAddLanguageOpenChange: (open: boolean) => void;
  onAddNamespaceOpenChange: (open: boolean) => void;
  onNewLanguageChange: (value: string) => void;
  onNewNamespaceChange: (value: string) => void;
  onAddLanguage: () => void;
  onAddNamespace: () => void;
  onDeleteLanguage: (lang: string) => void;
}

export default function ProjectSidebar({
  locales,
  namespaces,
  selectedNamespace,
  filterIssues,
  isAddLanguageOpen,
  isAddNamespaceOpen,
  newLanguage,
  newNamespace,
  onSelectedNamespaceChange,
  onFilterIssuesChange,
  onAddLanguageOpenChange,
  onAddNamespaceOpenChange,
  onNewLanguageChange,
  onNewNamespaceChange,
  onAddLanguage,
  onAddNamespace,
  onDeleteLanguage,
}: ProjectSidebarProps) {
  return (
    <div className="w-full lg:w-64 shrink-0 space-y-4">
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold">Langues</Label>
                <Dialog
                  open={isAddLanguageOpen}
                  onOpenChange={onAddLanguageOpenChange}
                >
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Plus className="size-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter une langue</DialogTitle>
                      <DialogDescription>
                        Ajouter une nouvelle langue à ce projet
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Code de langue</Label>
                        <Input
                          placeholder="ex: en, fr, de"
                          value={newLanguage}
                          onChange={(e) => onNewLanguageChange(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && onAddLanguage()
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => onAddLanguageOpenChange(false)}
                      >
                        Annuler
                      </Button>
                      <Button onClick={onAddLanguage}>Ajouter</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-1">
                {locales.map((lang) => (
                  <div
                    key={lang}
                    className="flex items-center justify-between group"
                  >
                    <Badge variant="outline" className="text-xs">
                      {lang}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      onClick={() => onDeleteLanguage(lang)}
                    >
                      <Trash2 className="size-3 text-red-600" />
                    </Button>
                  </div>
                ))}
                {locales.length === 0 && (
                  <p className="text-xs text-slate-500">Aucune langue</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold">Namespace</Label>
                <Dialog
                  open={isAddNamespaceOpen}
                  onOpenChange={onAddNamespaceOpenChange}
                >
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Plus className="size-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ajouter un namespace</DialogTitle>
                      <DialogDescription>
                        Ajouter un nouveau namespace pour organiser vos
                        traductions
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Nom du namespace</Label>
                        <Input
                          placeholder="ex: common, auth, errors"
                          value={newNamespace}
                          onChange={(e) => onNewNamespaceChange(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && onAddNamespace()
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => onAddNamespaceOpenChange(false)}
                      >
                        Annuler
                      </Button>
                      <Button onClick={onAddNamespace}>Ajouter</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Select
                value={selectedNamespace}
                onValueChange={onSelectedNamespaceChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les namespaces</SelectItem>
                  {namespaces.map((ns) => (
                    <SelectItem key={ns} value={ns}>
                      {ns}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">
                Filtrer les problèmes
              </Label>
              <Select value={filterIssues} onValueChange={onFilterIssuesChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les clés</SelectItem>
                  <SelectItem value="any">Tous les problèmes</SelectItem>
                  <SelectItem value="missing">
                    Traductions manquantes
                  </SelectItem>
                  <SelectItem value="placeholders">
                    Problèmes de placeholders
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
