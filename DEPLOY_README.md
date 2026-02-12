[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vignalbrice/localkit)

# 🚀 Déploiement LocalKit sur Vercel + Supabase

## 📋 Guides Disponibles

- **[VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md)** - Guide rapide étape par étape
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guide complet de déploiement
- **[VERCEL_ENV_VARIABLES.md](./VERCEL_ENV_VARIABLES.md)** - Liste des variables d'environnement
- **[COMMANDS.md](./COMMANDS.md)** - Toutes les commandes utiles

## ⚡ Démarrage Rapide

### 1. Prérequis

- ✅ Compte [Vercel](https://vercel.com)
- ✅ Compte [Supabase](https://supabase.com)
- ✅ [GitHub OAuth App](https://github.com/settings/developers)
- ✅ Repository GitHub cloné

### 2. Déploiement en 3 étapes

```bash
# 1. Vérifier que tout est OK
pnpm check:deploy

# 2. Déployer sur Vercel
pnpm deploy

# 3. Configurer les variables d'environnement sur Vercel
# (voir VERCEL_ENV_VARIABLES.md)
```

### 3. Variables d'Environnement Requises

Sur Vercel Dashboard > Settings > Environment Variables, ajoutez :

| Variable              | Valeur                                            |
| --------------------- | ------------------------------------------------- |
| `AUTH_SECRET`         | Généré avec `openssl rand -base64 32`             |
| `AUTH_GITHUB_ID`      | ID de votre GitHub OAuth App                      |
| `AUTH_GITHUB_SECRET`  | Secret de votre GitHub OAuth App                  |
| `AUTH_URL`            | `https://votre-app.vercel.app` (SANS slash final) |
| `NEXTAUTH_URL`        | `https://votre-app.vercel.app`                    |
| `NEXT_PUBLIC_APP_URL` | `https://votre-app.vercel.app`                    |
| `DATABASE_URL`        | URL de connexion Supabase PostgreSQL              |

### 4. Configuration GitHub OAuth

1. [GitHub Developer Settings](https://github.com/settings/developers)
2. Mettez à jour :
   - **Homepage URL** : `https://votre-app.vercel.app`
   - **Callback URL** : `https://votre-app.vercel.app/api/auth/callback/github`

### 5. Migrations Base de Données

```bash
# Exécuter les migrations sur Supabase
pnpm db:push
```

Ou via SQL Editor dans Supabase Dashboard (exécutez les fichiers dans `drizzle/`).

## 🎯 Structure des Fichiers de Déploiement

```
📁 localkit/
├── 📄 VERCEL_QUICKSTART.md      # Guide rapide
├── 📄 DEPLOYMENT.md              # Guide complet
├── 📄 VERCEL_ENV_VARIABLES.md   # Variables d'environnement
├── 📄 COMMANDS.md                # Commandes utiles
├── 📄 vercel.json                # Configuration Vercel
├── 📄 .vercelignore              # Fichiers à ignorer
├── 📄 deploy-vercel.sh           # Script de déploiement
├── 📄 check-deployment.sh        # Script de vérification
└── 📄 package.json               # Scripts npm
```

## 🔧 Scripts Disponibles

```bash
# Vérification pré-déploiement
pnpm check:deploy

# Déploiement complet (avec vérifications)
pnpm deploy

# Déploiement production (direct)
pnpm deploy:prod

# Déploiement preview (branche)
pnpm deploy:preview
```

## 📊 Après le Déploiement

### Vérifications

- [ ] Application accessible sur `https://votre-app.vercel.app`
- [ ] Connexion GitHub OAuth fonctionne
- [ ] Création de projet fonctionne
- [ ] Connexion à la base de données OK
- [ ] Import/Export de fichiers fonctionne

### Monitoring

- **Logs** : `vercel logs --follow`
- **Dashboard** : [Vercel Dashboard](https://vercel.com/dashboard)
- **Supabase** : [Supabase Dashboard](https://supabase.com/dashboard)

## 🐛 Problèmes Courants

### "Route couldn't be rendered statically"

✅ **Résolu** : `export const dynamic = "force-dynamic"` ajouté

### "Database connection failed"

- Vérifiez `DATABASE_URL` sur Vercel
- Assurez-vous que les migrations sont exécutées

### "GitHub OAuth failed"

- Vérifiez les URLs de callback
- `AUTH_URL` ne doit PAS avoir de slash final

### Cron Jobs ne fonctionnent pas

- Nécessite un plan Vercel **Pro** ou supérieur
- Alternative : Upstash QStash, GitHub Actions

## 📚 Documentation Complète

Pour plus de détails, consultez :

1. **[VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md)** - Démarrage rapide
2. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guide détaillé
3. **[VERCEL_ENV_VARIABLES.md](./VERCEL_ENV_VARIABLES.md)** - Configuration
4. **[COMMANDS.md](./COMMANDS.md)** - Référence des commandes

## 🎉 Félicitations !

Votre application est maintenant déployée ! 🚀

---

**Support** : Pour toute question, ouvrez une [issue](https://github.com/vignalbrice/localkit/issues)
