# Configuration Vercel - Variables d'Environnement

Ce fichier liste toutes les variables d'environnement à configurer sur Vercel.

## 🔐 Variables Requises

### Auth (NextAuth v5)

```bash
# Générer avec: openssl rand -base64 32
AUTH_SECRET="MSU0fRbzJ4C0AURxMohdLj+n4S2om2OFvcYNt+e6QSo="

# GitHub OAuth App credentials
AUTH_GITHUB_ID="Ov23lihfgkUa8mO3708I"
AUTH_GITHUB_SECRET="efce67d366846554c352fdec43978d3a0106ff3d"
```

### URLs Production

⚠️ **IMPORTANT** : Remplacez par votre véritable URL Vercel (SANS slash final !)

```bash
AUTH_URL="https://votre-app.vercel.app"
NEXTAUTH_URL="https://votre-app.vercel.app"
NEXT_PUBLIC_APP_URL="https://votre-app.vercel.app"
```

### Base de Données (Supabase)

```bash
DATABASE_URL="postgresql://postgres:IzYtheTlYo5hEPsN@db.derexyuoaqttkyawgluw.supabase.co:5432/postgres"
```

## 🔧 Variables Optionnelles

### GitHub App (Intégration Repo)

```bash
GITHUB_APP_ID="123456"
GITHUB_APP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GITHUB_APP_SLUG="your-app-slug"
```

### Google OAuth

```bash
AUTH_GOOGLE_ID="votre-google-client-id"
AUTH_GOOGLE_SECRET="votre-google-client-secret"
```

### Admin Credentials

```bash
AUTH_ADMIN_EMAIL="admin@example.com"
AUTH_ADMIN_PASSWORD="votre-mot-de-passe-securise"
```

## 📝 Comment Ajouter sur Vercel

### Méthode 1 : Interface Web (Recommandée)

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Settings** > **Environment Variables**
4. Cliquez sur **Add New**
5. Ajoutez chaque variable :
   - **Key** : Nom de la variable (ex: `AUTH_SECRET`)
   - **Value** : Valeur de la variable
   - **Environment** : Sélectionnez Production, Preview, Development selon vos besoins

**Variables à ajouter obligatoirement :**
- `AUTH_SECRET` → Générez avec `openssl rand -base64 32`
- `AUTH_GITHUB_ID` → Depuis votre GitHub OAuth App
- `AUTH_GITHUB_SECRET` → Depuis votre GitHub OAuth App
- `AUTH_URL` → URL de votre app Vercel (ex: `https://localkit.vercel.app`) **SANS slash final**
- `NEXTAUTH_URL` → Même URL que AUTH_URL **SANS slash final**
- `NEXT_PUBLIC_APP_URL` → Même URL que AUTH_URL **SANS slash final**
- `DATABASE_URL` → URL de connexion Supabase PostgreSQL

### Méthode 2 : CLI Vercel

```bash
# Ajouter une variable
vercel env add AUTH_SECRET production

# Importer depuis .env.local (attention aux valeurs sensibles !)
vercel env pull .env.vercel.local
```

### ⚠️ Note sur vercel.json

Le fichier `vercel.json` ne contient plus de référence aux variables d'environnement.
Toutes les variables doivent être configurées directement dans Vercel Dashboard.

## 🎯 Configuration par Environnement

### Production

- Variables utilisées pour le déploiement en production
- URL : `https://votre-app.vercel.app`

### Preview

- Variables utilisées pour les déploiements de branches/PRs
- URLs : `https://localkit-git-feature-branch-username.vercel.app`

### Development

- Variables utilisées pour `vercel dev` en local
- URL : `http://localhost:3000`

## ✅ Checklist de Configuration

- [ ] `AUTH_SECRET` (généré avec openssl)
- [ ] `AUTH_GITHUB_ID` (depuis GitHub OAuth App)
- [ ] `AUTH_GITHUB_SECRET` (depuis GitHub OAuth App)
- [ ] `AUTH_URL` (URL Vercel de production, SANS slash final)
- [ ] `NEXTAUTH_URL` (URL Vercel de production, SANS slash final)
- [ ] `NEXT_PUBLIC_APP_URL` (URL Vercel de production, SANS slash final)
- [ ] `DATABASE_URL` (depuis Supabase)
- [ ] `GITHUB_APP_ID` (optionnel, si intégration repo)
- [ ] `GITHUB_APP_PRIVATE_KEY` (optionnel, si intégration repo)
- [ ] `GITHUB_APP_SLUG` (optionnel, si intégration repo)

## 🔒 Sécurité

### Variables Secrètes

⚠️ **NE JAMAIS** commiter ces variables dans Git :

- `AUTH_SECRET`
- `AUTH_GITHUB_SECRET`
- `AUTH_GOOGLE_SECRET`
- `DATABASE_URL` (contient le mot de passe)
- `GITHUB_APP_PRIVATE_KEY`
- `AUTH_ADMIN_PASSWORD`

### Variables Publiques

✅ Ces variables peuvent être exposées côté client (préfixe `NEXT_PUBLIC_`) :

- `NEXT_PUBLIC_APP_URL`

### Rotation des Secrets

Recommandé tous les 90 jours :

1. Générer un nouveau `AUTH_SECRET`
2. Mettre à jour sur Vercel
3. Redéployer l'application

## 📚 Références

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [NextAuth Environment Variables](https://authjs.dev/reference/core#environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

Dernière mise à jour : 12 février 2026
