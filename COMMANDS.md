# 📚 Commandes Utiles - LocalKit

## 🚀 Déploiement

```bash
# Vérifier que tout est prêt avant le déploiement
pnpm check:deploy

# Déployer sur Vercel (production)
pnpm deploy

# Déployer en preview (branche de test)
pnpm deploy:preview

# Déployer directement en production (sans script)
pnpm deploy:prod
```

## 💻 Développement

```bash
# Démarrer le serveur de développement
pnpm dev

# Build de production en local
pnpm build

# Démarrer le serveur de production
pnpm start

# Linter le code
pnpm lint
```

## 🗄️ Base de Données

```bash
# Pousser le schéma vers la DB (sans générer de migration)
pnpm db:push

# Générer les fichiers de migration
pnpm db:generate

# Exécuter les migrations
pnpm db:migrate

# Ouvrir Drizzle Studio (interface visuelle de la DB)
pnpm db:studio

# Vérifier les migrations
pnpm db:check
```

## 🔧 Vercel CLI

```bash
# Installer Vercel CLI
pnpm add -g vercel

# Se connecter à Vercel
vercel login

# Lier le projet à Vercel
vercel link

# Déployer en preview
vercel

# Déployer en production
vercel --prod

# Voir les logs
vercel logs

# Voir les environnements variables
vercel env ls

# Ajouter une variable d'environnement
vercel env add NOM_VARIABLE production

# Retirer une variable d'environnement
vercel env rm NOM_VARIABLE production

# Télécharger les variables d'environnement
vercel env pull .env.vercel.local

# Lancer le serveur dev avec les variables Vercel
vercel dev
```

## 🔐 Configuration Auth

```bash
# Générer un AUTH_SECRET
openssl rand -base64 32

# Ou avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 🐛 Débogage

```bash
# Vérifier les erreurs TypeScript
pnpm tsc --noEmit

# Build verbose
pnpm build --debug

# Voir les logs Vercel en temps réel
vercel logs --follow

# Inspecter une fonction spécifique
vercel logs /api/auto-sync --follow
```

## 📦 Gestion des Dépendances

```bash
# Installer toutes les dépendances
pnpm install

# Ajouter une dépendance
pnpm add nom-package

# Ajouter une dépendance de développement
pnpm add -D nom-package

# Mettre à jour toutes les dépendances
pnpm update

# Vérifier les dépendances obsolètes
pnpm outdated

# Nettoyer node_modules et réinstaller
rm -rf node_modules && pnpm install
```

## 🧪 Tests et Qualité

```bash
# TypeScript check
pnpm tsc --noEmit

# ESLint
pnpm lint

# Build test
pnpm build

# Tout vérifier avant commit
pnpm tsc --noEmit && pnpm lint && pnpm build
```

## 🔄 Git

```bash
# Vérifier le statut
git status

# Ajouter tous les fichiers
git add .

# Commit
git commit -m "description des changements"

# Push vers GitHub
git push origin main

# Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# Push une nouvelle branche
git push -u origin feature/nouvelle-fonctionnalite
```

## 🌍 Gestion des Environnements

```bash
# Développement local
cp .env.example .env.local
# Éditer .env.local avec vos valeurs

# Voir les variables d'environnement Vercel
vercel env ls

# Synchroniser les variables Vercel localement
vercel env pull .env.vercel.local
```

## 📊 Monitoring Vercel

```bash
# Voir les déploiements
vercel ls

# Voir les détails d'un déploiement
vercel inspect URL_DU_DEPLOIEMENT

# Annuler un déploiement
vercel rm URL_DU_DEPLOIEMENT

# Promouvoir un déploiement preview en production
vercel promote URL_DU_DEPLOIEMENT
```

## 🗃️ Supabase

```bash
# Se connecter à Supabase via psql
psql "postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"

# Exporter la base de données
pg_dump "postgresql://..." > backup.sql

# Importer une base de données
psql "postgresql://..." < backup.sql

# Via Drizzle (recommandé)
pnpm db:push
```

## 🔍 Utilitaires

```bash
# Voir la taille du build
du -sh .next

# Analyser les dépendances Next.js
ANALYZE=true pnpm build

# Nettoyer les caches
rm -rf .next node_modules/.cache

# Vérifier les ports utilisés
lsof -i :3000
```

## 🎯 Workflow Complet de Déploiement

```bash
# 1. Vérifier que tout fonctionne
pnpm tsc --noEmit
pnpm lint
pnpm build

# 2. Vérifier avec le script
pnpm check:deploy

# 3. Commit les changements
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main

# 4. Déployer sur Vercel
pnpm deploy

# 5. Vérifier les logs
vercel logs --follow
```

## 🚨 Commandes d'Urgence

```bash
# Rollback rapide (revenir au déploiement précédent)
vercel rollback

# Annuler les migrations DB (DANGER!)
# Restaurer depuis un backup

# Réinitialiser complètement
rm -rf .next node_modules .vercel
pnpm install
pnpm build
```

## 📱 Raccourcis Pratiques

```bash
# Alias à ajouter dans ~/.zshrc ou ~/.bashrc
alias dev="pnpm dev"
alias deploy="pnpm deploy"
alias check="pnpm check:deploy"
alias vl="vercel logs --follow"
alias vd="vercel dev"

# Recharger les alias
source ~/.zshrc
```

---

💡 **Astuce** : Ajoutez ces commandes en favoris dans votre terminal !
