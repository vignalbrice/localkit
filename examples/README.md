# 📁 Examples - Fichiers de Test

Ce dossier contient des fichiers exemples pour tester les fonctionnalités d'import de LocalKit.

## Fichiers disponibles

### 1. `en-common.json` - Anglais

Fichier de traduction en anglais pour le namespace "common".

**Utilisation** :

1. Aller sur la page d'un projet
2. Onglet "Import"
3. Sélectionner "📄 JSON File"
4. Remplir :
   - Locale : `en`
   - Namespace : `common`
   - Fichier : Sélectionner `en-common.json`
5. Mode : Merge ou Replace
6. Cliquer sur "Preview" puis "Import"

### 2. `fr-common.json` - Français

Traduction française équivalente.

**Utilisation** : Même processus, avec locale = `fr`

## Structure des fichiers

Les fichiers JSON utilisent une **structure imbriquée** pour une meilleure lisibilité :

```json
{
  "welcome": "Welcome",
  "user": {
    "name": "Name",
    "email": "Email"
  }
}
```

Cette structure est automatiquement **flattened** à l'import :

- `welcome` → `welcome`
- `user.name` → `user.name`
- `user.email` → `user.email`

## Placeholders détectés

Les fichiers contiennent plusieurs formats de placeholders :

| Format            | Exemple                    | Fichier               |
| ----------------- | -------------------------- | --------------------- |
| `{{placeholder}}` | `"Hello {{name}}!"`        | `messages.greeting`   |
| `{placeholder}`   | `"You have {count} items"` | `messages.item_count` |
| `%(placeholder)s` | `"Error: %(error)s"`       | `messages.error`      |

Tous ces formats sont **automatiquement détectés** et stockés dans la colonne `placeholders` de la base de données.

## Workflow de test complet

### Test 1 : Import initial en anglais

```bash
# 1. Créer un nouveau projet (via UI)
# 2. Import en-common.json
Locale: en
Namespace: common
Mode: Merge
```

**Résultat attendu** : 15 clés importées (après flattening)

### Test 2 : Ajouter le français

```bash
# Import fr-common.json
Locale: fr
Namespace: common
Mode: Merge
```

**Résultat attendu** : 15 nouvelles clés (locale = fr)

### Test 3 : Vérifier dans l'éditeur

Aller dans l'onglet "Editor" et vérifier :

- Filtrer par namespace "common"
- Voir les 2 colonnes "en" et "fr"
- Vérifier que les clés avec placeholders sont correctes

### Test 4 : Export puis re-import

```bash
# 1. Exporter le projet en ZIP
# 2. Vérifier la structure :
#    locales/en/common.json
#    locales/fr/common.json
# 3. Supprimer toutes les entrées (mode Replace)
# 4. Re-importer le ZIP
```

**Résultat attendu** : Données restaurées à l'identique

## Créer vos propres fichiers

Pour créer un nouveau fichier de test :

```json
{
  "section": {
    "key1": "value1",
    "key2": "value with {{placeholder}}"
  }
}
```

**Conseils** :

- Utilisez des structures imbriquées pour la clarté
- Ajoutez des placeholders pour tester la détection
- Testez avec différents formats : `{{}}`, `{}`, `%()`
- Gardez des noms de clés cohérents entre locales

## Structure flattened attendue

Après import de `en-common.json`, vous devriez avoir ces clés dans la DB :

```
welcome
user.name
user.email
user.password
navigation.home
navigation.projects
navigation.settings
navigation.logout
messages.greeting (placeholders: ["name"])
messages.item_count (placeholders: ["count"])
messages.success
messages.error (placeholders: ["error"])
actions.save
actions.cancel
actions.delete
actions.confirm
```

Total : **16 clés**

---

**Note** : Ces fichiers sont des exemples et peuvent être modifiés selon vos besoins de test.
