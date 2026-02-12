# 🚀 Guide Rapide : Déploiement Vercel + Supabase

## 📋 Checklist Avant Déploiement

- [ ] Compte Vercel créé
- [ ] Projet Supabase créé et configuré
- [ ] Migrations DB exécutées sur Supabase
- [ ] GitHub OAuth App créée
- [ ] GitHub App créée (optionnel, pour l'intégration repo)

## 🎯 Étapes de Déploiement

### 1. Créer le Projet sur Vercel

```bash
# Option A : Interface Web
# Allez sur https://vercel.com/new
# Importez votre repo GitHub

# Option B : CLI
vercel
```

### 2. Configurer les Variables d'Environnement

Sur Vercel Dashboard > Settings > Environment Variables :

| Variable                 | Valeur                                     | Environnement                    |
| ------------------------ | ------------------------------------------ | -------------------------------- |
| `AUTH_SECRET`            | Généré avec `openssl rand -base64 32`      | Production, Preview, Development |
| `AUTH_GITHUB_ID`         | ID de votre GitHub OAuth App               | Production, Preview, Development |
| `AUTH_GITHUB_SECRET`     | Secret de votre GitHub OAuth App           | Production, Preview, Development |
| `AUTH_URL`               | `https://votre-app.vercel.app`             | Production                       |
| `NEXTAUTH_URL`           | `https://votre-app.vercel.app`             | Production                       |
| `NEXT_PUBLIC_APP_URL`    | `https://votre-app.vercel.app`             | Production                       |
| `DATABASE_URL`           | URL de connexion Supabase                  | Production, Preview, Development |
| `GITHUB_APP_ID`          | ID de votre GitHub App (optionnel)         | Production                       |
| `GITHUB_APP_PRIVATE_KEY` | Clé privée de votre GitHub App (optionnel) | Production                       |

**⚠️ Important** : Pas de slash final dans les URLs !

### 3. Configurer GitHub OAuth

Sur [GitHub Developer Settings](https://github.com/settings/developers) :

1. Sélectionnez votre OAuth App
2. Mettez à jour :
   - **Homepage URL** : `https://votre-app.vercel.app`
   - **Authorization callback URL** : `https://votre-app.vercel.app/api/auth/callback/github`

### 4. Configurer Supabase

Dans votre projet Supabase :

#### A. Exécuter les Migrations

```bash
# Localement
pnpm db:push

# Ou via SQL Editor dans Supabase Dashboard
# Exécutez les fichiers dans drizzle/ dans l'ordre
```

#### B. Vérifier la Configuration SSL

Assurez-vous que votre `DATABASE_URL` contient `?sslmode=require` ou que le client est configuré avec `ssl: "prefer"` (déjà fait dans `lib/db/client.ts`).

### 5. Déployer

```bash
# Méthode 1 : Script automatique
./deploy-vercel.sh

# Méthode 2 : CLI manuelle
vercel --prod

# Méthode 3 : Git Push
git push origin main
# Le déploiement se fait automatiquement
```

### 6. Post-Déploiement

#### Vérifications

- [ ] L'app se charge correctement
- [ ] La connexion fonctionne (GitHub OAuth)
- [ ] La création de projet fonctionne
- [ ] L'import/export fonctionne
- [ ] L'édition de traductions fonctionne

#### Configurer le Domaine Personnalisé (Optionnel)

1. Vercel Dashboard > Settings > Domains
2. Ajoutez votre domaine
3. Mettez à jour les variables d'environnement :
   - `AUTH_URL` → `https://votre-domaine.com`
   - `NEXTAUTH_URL` → `https://votre-domaine.com`
   - `NEXT_PUBLIC_APP_URL` → `https://votre-domaine.com`
4. Mettez à jour GitHub OAuth callback URL

## 🔧 Configuration Avancée

### Cron Jobs (Auto-sync)

**⚠️ Nécessite un plan Vercel Pro ou supérieur**

Le fichier `vercel.json` configure déjà le cron :

```json
{
  "crons": [
    {
      "path": "/api/auto-sync",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Alternative (Plan Hobby)** : Utilisez un service externe :

- [Upstash QStash](https://upstash.com/docs/qstash)
- [cron-job.org](https://cron-job.org)
- GitHub Actions

### Monitoring et Logs

1. Vercel Dashboard > Deployments > [Votre déploiement] > Logs
2. Vérifiez les erreurs runtime
3. Configurez les notifications d'erreur

### Performance

1. Activez Edge Middleware (déjà configuré dans Next.js)
2. Configurez le cache des routes statiques
3. Utilisez les Vercel Analytics (optionnel)

## 🐛 Dépannage

### Erreur : "Route couldn't be rendered statically"

✅ **Résolu** : `export const dynamic = "force-dynamic"` ajouté dans les pages utilisant `auth()`.

### Erreur : "Database connection failed"

Vérifiez :

1. `DATABASE_URL` est correctement configurée
2. Les migrations sont exécutées
3. Supabase autorise les connexions depuis Vercel

### Erreur : "GitHub OAuth failed"

Vérifiez :

1. Les URLs de callback correspondent exactement
2. `AUTH_URL` n'a pas de slash final
3. Les credentials GitHub sont valides
4. Le domaine est autorisé dans GitHub OAuth

### Cron Jobs ne fonctionnent pas

1. Vérifiez que vous avez un plan Vercel Pro+
2. Vérifiez les logs du cron dans Vercel Dashboard
3. Testez manuellement l'endpoint : `curl https://votre-app.vercel.app/api/auto-sync`

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase + Vercel](https://supabase.com/partners/integrations/vercel)
- [NextAuth Deployment](https://authjs.dev/getting-started/deployment)

## 💡 Conseils Pro

1. **Utilisez des branches de preview** : Chaque PR crée un déploiement de preview
2. **Configurez les variables par environnement** : Production vs Preview vs Development
3. **Activez la protection des branches** : Exigez des builds réussis avant merge
4. **Utilisez Vercel Analytics** : Pour suivre les performances
5. **Configurez les alertes** : Pour être notifié des erreurs

## 🎉 Félicitations !

Votre application LocalKit est maintenant déployée sur Vercel avec Supabase ! 🚀

**URL de votre app** : https://votre-app.vercel.app

---

Pour toute question, consultez [DEPLOYMENT.md](./DEPLOYMENT.md) ou ouvrez une issue.
