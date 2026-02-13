"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";

interface TranslationCellProps {
  locale: string;
  namespace: string;
  dotKey: string;
  value: string;
  hasMissing: boolean;
  hasPlaceholderIssue: boolean;
  onSave: (
    locale: string,
    namespace: string,
    dotKey: string,
    value: string,
  ) => void;
}

export default function TranslationCell({
  locale,
  namespace,
  dotKey,
  value,
  hasMissing,
  hasPlaceholderIssue,
  onSave,
}: TranslationCellProps) {
  // État draft local pour éviter les re-renders du parent
  const [draftValue, setDraftValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchroniser avec la valeur externe quand elle change (après refresh)
  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  const handleBlur = () => {
    // Sauvegarder seulement si la valeur a changé
    if (draftValue !== value) {
      onSave(locale, namespace, dotKey, draftValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur(); // Déclenche le blur qui sauvegarde
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={draftValue}
        onChange={(e) => setDraftValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
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
  );
}
