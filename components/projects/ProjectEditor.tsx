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
import {
  Plus,
  Trash2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Search,
} from "lucide-react";

interface TranslationKey {
  namespace: string;
  dotKey: string;
  translations: Record<string, string>;
  issues: {
    missingLanguages: string[];
    placeholderMismatches: Record<string, string[]>;
  };
}

interface ProjectEditorProps {
  locales: string[];
  filteredKeys: TranslationKey[];
  translationKeys: TranslationKey[];
  searchQuery: string;
  selectedNamespace: string;
  isAddKeyOpen: boolean;
  namespaces: string[];
  newKeyNamespace: string;
  newKeyDotKey: string;
  onSearchQueryChange: (value: string) => void;
  onAddKeyOpenChange: (open: boolean) => void;
  onNewKeyNamespaceChange: (value: string) => void;
  onNewKeyDotKeyChange: (value: string) => void;
  onAddKey: () => void;
  onDeleteKey: (namespace: string, dotKey: string) => void;
  onUpdateEntry: (
    locale: string,
    namespace: string,
    dotKey: string,
    value: string,
  ) => void;
  onAddLanguageOpenChange: (open: boolean) => void;
}

export default function ProjectEditor({
  locales,
  filteredKeys,
  translationKeys,
  searchQuery,
  selectedNamespace,
  isAddKeyOpen,
  namespaces,
  newKeyNamespace,
  newKeyDotKey,
  onSearchQueryChange,
  onAddKeyOpenChange,
  onNewKeyNamespaceChange,
  onNewKeyDotKeyChange,
  onAddKey,
  onDeleteKey,
  onUpdateEntry,
  onAddLanguageOpenChange,
}: ProjectEditorProps) {
  return (
    <div className="flex-1">
      <Card>
        <CardContent className="pt-4">
          {/* Search and Add Key */}
          <div className="mb-4 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="pl-9"
              />
            </div>
            <Dialog open={isAddKeyOpen} onOpenChange={onAddKeyOpenChange}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  disabled={locales.length === 0}
                  className="w-full sm:w-auto"
                >
                  <Plus className="size-4 mr-2" />
                  <span className="sm:inline">Ajouter une clé</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une clé de traduction</DialogTitle>
                  <DialogDescription>
                    Créer une nouvelle clé pour toutes les langues
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Namespace</Label>
                    {namespaces.length > 0 ? (
                      <Select
                        value={newKeyNamespace}
                        onValueChange={onNewKeyNamespaceChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un namespace" />
                        </SelectTrigger>
                        <SelectContent>
                          {namespaces.map((ns) => (
                            <SelectItem key={ns} value={ns}>
                              {ns}
                            </SelectItem>
                          ))}
                          <SelectItem value="__new__">
                            + Créer un nouveau namespace
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        placeholder="ex: common, auth, errors"
                        value={newKeyNamespace}
                        onChange={(e) =>
                          onNewKeyNamespaceChange(e.target.value)
                        }
                      />
                    )}
                    {newKeyNamespace === "__new__" && (
                      <Input
                        placeholder="Nom du nouveau namespace"
                        onChange={(e) =>
                          onNewKeyNamespaceChange(e.target.value)
                        }
                        autoFocus
                      />
                    )}
                    <p className="text-xs text-slate-500">
                      {namespaces.length === 0
                        ? "Le namespace 'common' sera utilisé par défaut si vide"
                        : "Ou laissez vide pour utiliser 'common'"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Clé (notation point)</Label>
                    <Input
                      placeholder="ex: auth.login.title"
                      value={newKeyDotKey}
                      onChange={(e) => onNewKeyDotKeyChange(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && onAddKey()}
                    />
                    <p className="text-xs text-slate-500">
                      La clé sera créée vide pour les {locales.length} langue(s)
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => onAddKeyOpenChange(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={onAddKey}>Ajouter</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Translation Table */}
          {locales.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <AlertCircle className="size-10 sm:size-12 text-slate-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-2">
                Ajoutez des langues pour commencer à éditer les traductions
              </p>
              <Button
                variant="outline"
                onClick={() => onAddLanguageOpenChange(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="size-4 mr-2" />
                Ajouter une langue
              </Button>
            </div>
          ) : filteredKeys.length === 0 && translationKeys.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <AlertCircle className="size-10 sm:size-12 text-slate-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-2">
                Aucune clé de traduction. Ajoutez votre première clé pour
                commencer.
              </p>
              <Button
                variant="outline"
                onClick={() => onAddKeyOpenChange(true)}
                className="w-full sm:w-auto"
              >
                <Plus className="size-4 mr-2" />
                Ajouter une clé
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm sticky left-0 bg-slate-50 z-10 min-w-30 sm:min-w-50">
                        Clé
                      </th>
                      {selectedNamespace === "all" && (
                        <th className="text-left px-2 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm min-w-20 sm:min-w-30">
                          Namespace
                        </th>
                      )}
                      {locales.map((lang) => (
                        <th
                          key={lang}
                          className="text-left px-2 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm min-w-50 sm:min-w-62.5"
                        >
                          {lang}
                        </th>
                      ))}
                      <th className="text-center px-2 sm:px-4 py-2 sm:py-3 font-semibold text-xs sm:text-sm min-w-15 sm:min-w-25">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKeys.length === 0 ? (
                      <tr>
                        <td
                          colSpan={
                            locales.length +
                            (selectedNamespace === "all" ? 3 : 2)
                          }
                          className="text-center py-6 sm:py-8 text-sm text-slate-500"
                        >
                          Aucune clé trouvée
                        </td>
                      </tr>
                    ) : (
                      filteredKeys.map((tk) => (
                        <tr
                          key={`${tk.namespace}-${tk.dotKey}`}
                          className="border-b hover:bg-slate-50 group"
                        >
                          <td className="px-2 sm:px-4 py-2 sm:py-3 font-mono text-xs sm:text-sm sticky left-0 bg-white group-hover:bg-slate-50">
                            <div className="flex items-center justify-between gap-1 sm:gap-2">
                              <span className="truncate">{tk.dotKey}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 shrink-0"
                                onClick={() =>
                                  onDeleteKey(tk.namespace, tk.dotKey)
                                }
                              >
                                <Trash2 className="size-3 text-red-600" />
                              </Button>
                            </div>
                          </td>
                          {selectedNamespace === "all" && (
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <Badge variant="outline" className="text-xs">
                                {tk.namespace}
                              </Badge>
                            </td>
                          )}
                          {locales.map((lang) => {
                            const hasMissing =
                              tk.issues.missingLanguages.includes(lang);
                            const hasPlaceholderIssue =
                              tk.issues.placeholderMismatches[lang];

                            return (
                              <td
                                key={lang}
                                className="px-2 sm:px-4 py-2 sm:py-3"
                              >
                                <div className="relative">
                                  <Input
                                    value={tk.translations[lang] || ""}
                                    onChange={(e) =>
                                      onUpdateEntry(
                                        lang,
                                        tk.namespace,
                                        tk.dotKey,
                                        e.target.value,
                                      )
                                    }
                                    placeholder={hasMissing ? "Manquante" : ""}
                                    className={`text-xs sm:text-sm ${
                                      hasMissing
                                        ? "border-amber-300 bg-amber-50"
                                        : hasPlaceholderIssue
                                          ? "border-red-300 bg-red-50"
                                          : ""
                                    }`}
                                  />
                                  {hasPlaceholderIssue && (
                                    <div className="absolute -top-1 -right-1">
                                      <AlertTriangle className="size-3 sm:size-4 text-red-600" />
                                    </div>
                                  )}
                                </div>
                              </td>
                            );
                          })}
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center">
                            {tk.issues.missingLanguages.length === 0 &&
                            Object.keys(tk.issues.placeholderMismatches)
                              .length === 0 ? (
                              <CheckCircle2 className="size-4 sm:size-5 text-green-600 mx-auto" />
                            ) : (
                              <div className="flex items-center justify-center gap-1">
                                {tk.issues.missingLanguages.length > 0 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {tk.issues.missingLanguages.length}
                                  </Badge>
                                )}
                                {Object.keys(tk.issues.placeholderMismatches)
                                  .length > 0 && (
                                  <AlertTriangle className="size-3 sm:size-4 text-red-600" />
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
