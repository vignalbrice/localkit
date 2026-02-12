# 🚀 Guide de déploiement Vercel

## Prérequis

- Compte Vercel
- Compte GitHub
- Base de données Supabase (déjà configurée ✅)

## Étapes de déploiement

### 1. Créer un nouveau projet sur Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Cliquez sur "Add New Project"
3. Importez votre repository GitHub `vignalbrice/localkit`
4. Sélectionnez la branche `main`

### 2. Configurer les variables d'environnement

Dans les paramètres du projet Vercel, ajoutez ces variables d'environnement :

#### Auth (NextAuth v5)

```env
AUTH_SECRET=MSU0fRbzJ4C0AURxMohdLj+n4S2om2OFvcYNt+e6QSo=
AUTH_GITHUB_ID=Ov23lihfgkUa8mO3708I
AUTH_GITHUB_SECRET=efce67d366846554c352fdec43978d3a0106ff3d
```

⚠️ **IMPORTANT** : Pour `AUTH_URL`, `NEXTAUTH_URL`, et `NEXT_PUBLIC_APP_URL`, utilisez votre URL de production Vercel :

```env
# Remplacez par votre véritable URL Vercel (sans slash final !)
AUTH_URL=https://votre-app.vercel.app
NEXTAUTH_URL=https://votre-app.vercel.app
NEXT_PUBLIC_APP_URL=https://votre-app.vercel.app
```

#### Base de données Supabase

```env
DATABASE_URL=postgresql://postgres:IzYtheTlYo5hEPsN@db.derexyuoaqttkyawgluw.supabase.co:5432/postgres
```

#### GitHub App (pour l'intégration repo)

```env
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
GITHUB_APP_SLUG=your-app-slug
```

#### Optionnel : Google OAuth

Si vous utilisez Google OAuth, ajoutez :

```env
AUTH_GOOGLE_ID=votre-google-client-id
AUTH_GOOGLE_SECRET=votre-google-client-secret
```

#### Optionnel : Credentials Admin

```env
AUTH_ADMIN_EMAIL=admin@example.com
AUTH_ADMIN_PASSWORD=votre-mot-de-passe-admin
```

### 3. Configurer GitHub OAuth pour production

1. Allez sur [GitHub Developer Settings](https://github.com/settings/developers)
2. Sélectionnez votre OAuth App ou créez-en une nouvelle
3. Mettez à jour les URLs :
   - **Homepage URL** : `https://votre-app.vercel.app`
   - **Authorization callback URL** : `https://votre-app.vercel.app/api/auth/callback/github`

### 4. Configurer la GitHub App (pour les repos)

1. Allez sur [GitHub Apps Settings](https://github.com/settings/apps)
2. Sélectionnez votre GitHub App
3. Mettez à jour les URLs :
   - **Homepage URL** : `https://votre-app.vercel.app`
   - **Callback URL** : `https://votre-app.vercel.app/api/github/callback`
   - **Webhook URL** : `https://votre-app.vercel.app/api/github/webhook` (si utilisé)

### 5. Configuration Vercel spécifique

#### Build Settings

Ces paramètres devraient être détectés automatiquement :

- **Framework Preset** : Next.js
- **Build Command** : `pnpm build` ou `pnpm run build`
- **Output Directory** : `.next`
- **Install Command** : `pnpm install`

#### Node Version

Assurez-vous d'utiliser Node.js 20+ dans `package.json` :

```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### 6. Migrations de base de données

Avant le premier déploiement, assurez-vous que vos tables Supabase sont créées :

```bash
# En local
pnpm db:push
```

Ou exécutez directement les migrations SQL dans Supabase :

1. Allez sur votre dashboard Supabase
2. SQL Editor
3. Exécutez les fichiers dans `drizzle/` :
   - `0000_mature_miss_america.sql`
   - `0001_add_plans.sql`
   - `0002_add_foreign_keys_cascade.sql`
   - `0003_add_auto_sync.sql`

### 7. Déployer !

1. Cliquez sur "Deploy" dans Vercel
2. Attendez que le build se termine
3. Vérifiez que l'application fonctionne sur votre URL Vercel

### 8. Configuration post-déploiement

#### Cron Jobs (Auto-sync)

Votre `vercel.json` configure déjà un cron job :

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

⚠️ **Note** : Les Cron Jobs Vercel nécessitent un plan **Pro** ou supérieur.

Si vous êtes sur le plan Hobby, utilisez une alternative :

- Upstash QStash
- GitHub Actions
- Service externe comme cron-job.org

#### Domaine personnalisé (optionnel)

1. Dans Vercel, allez sur "Settings" > "Domains"
2. Ajoutez votre domaine personnalisé
3. Mettez à jour les variables d'environnement :
   - `AUTH_URL=https://votre-domaine.com`
   - `NEXTAUTH_URL=https://votre-domaine.com`
   - `NEXT_PUBLIC_APP_URL=https://votre-domaine.com`
4. Mettez à jour les URLs GitHub OAuth et GitHub App

## ✅ Checklist de vérification

Après le déploiement, vérifiez :

- [ ] L'application se charge correctement
- [ ] La connexion GitHub fonctionne
- [ ] La connexion à la base de données fonctionne
- [ ] Les projets peuvent être créés
- [ ] L'import/export de fichiers fonctionne
- [ ] Les traductions peuvent être éditées
- [ ] L'intégration GitHub (PR) fonctionne
- [ ] Les cron jobs sont actifs (si plan Pro+)

## 🐛 Dépannage

### Erreur : "Route couldn't be rendered statically"

✅ Déjà corrigé ! Ajout de `export const dynamic = "force-dynamic"` dans les pages utilisant `auth()`.

### Erreur de connexion à la base de données

Vérifiez que :

- `DATABASE_URL` est correctement configurée
- Les migrations sont exécutées
- Les paramètres SSL de Supabase sont corrects

### OAuth GitHub ne fonctionne pas

Vérifiez que :

- Les URLs de callback sont correctes
- `AUTH_URL` correspond exactement à votre URL Vercel (sans slash final)
- Les credentials GitHub sont valides

### Auto-sync ne fonctionne pas

- Vérifiez que vous avez un plan Vercel Pro+
- Ou configurez une alternative (voir section Cron Jobs)

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [NextAuth.js Deployment](https://authjs.dev/getting-started/deployment)
- [Supabase Guides](https://supabase.com/docs)

## 🎉 Félicitations !

Votre application LocalKit est maintenant déployée sur Vercel avec Supabase ! 🚀
