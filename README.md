# LocalKit - i18n Translation Management Tool

LocalKit est une application Next.js complète pour la gestion de traductions i18next avec support multi-projets, intégration GitHub et éditeur de traductions.

## ✨ Fonctionnalités

### Fonctionnalités de base

- 🔐 **Authentification GitHub** (NextAuth v5)
- 📦 **Multi-projets** avec isolation des données
- 📤 **Import/Export** : Support ZIP et JSON
  - **ZIP** : Import multiple de plusieurs locales/namespaces
  - **JSON** : Import ciblé d'un fichier JSON pour une locale/namespace
- ✏️ **Éditeur de traductions** avec filtres et recherche
- ➕ **Ajout de clés et locales** directement depuis l'interface
  - **Add Key** : Créer une nouvelle clé pour toutes les locales
  - **Add Locale** : Ajouter une langue avec toutes les clés existantes
- 🔄 **Intégration GitHub** pour création de Pull Requests
- 👁️ **Preview** avant import
- 🔀 **Modes merge/replace** pour l'import
- 🏷️ **Détection automatique** des placeholders ({{placeholder}}, {placeholder}, %(placeholder)s)
- 🌳 **Flattening automatique** des structures JSON imbriquées

### Fonctionnalités Pro

- 👥 **Collaboration d'équipe** : Jusqu'à 5 membres
- 🔄 **Synchronisation automatique GitHub** : Auto-sync toutes les 30 minutes
- ⚡ **Projets, langues et clés illimités**
- 🎯 **Support prioritaire** : Réponse sous 4h

### Fonctionnalités Entreprise

- 👨‍👩‍👧‍👦 **Membres d'équipe illimités**
- 🛡️ **Gestion des rôles et permissions** : Contrôle granulaire des accès
  - Rôles personnalisés
  - Permissions au niveau projet, namespace et langue
  - Audit trail complet
- 🔌 **API REST dédiée** : Automatisez vos workflows
  - Endpoints CRUD complets
  - Webhooks personnalisés
  - Rate limiting adapté (10,000 req/h)
- ⚡ **SLA garanti 99.9%** : Disponibilité maximale
  - Monitoring 24/7
  - Compensation en cas de downtime
  - Support dédié 24/7
- 🔐 **Sécurité avancée** : SSO, SCIM, SOC 2, RGPD

## 🚀 Démarrage rapide

### 1. Prérequis

- Node.js 20+
- pnpm 10+
- PostgreSQL 14+
- Compte GitHub (pour OAuth)

### 2. Installation

```bash
# Clone le repo
git clone <votre-repo>
cd localkit

# Installer les dépendances
pnpm install
```

### 3. Configuration

Suivez le guide détaillé dans **[CHECKLIST.md](./CHECKLIST.md)** ou :

```bash
# 1. Créer le fichier .env.local
cp .env.local.example .env.local

# 2. Générer AUTH_SECRET
openssl rand -base64 32

# 3. Éditer .env.local avec vos credentials
nano .env.local
```

Variables requises :

- `AUTH_SECRET` - Clé secrète NextAuth
- `AUTH_GITHUB_ID` - GitHub OAuth Client ID
- `AUTH_GITHUB_SECRET` - GitHub OAuth Client Secret
- `DATABASE_URL` - PostgreSQL connection string

### 4. Base de données

```bash
# Créer les tables
pnpm drizzle-kit push
```

### 5. Lancer le serveur

```bash
pnpm dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

| Fichier                                                                  | Description                                        |
| ------------------------------------------------------------------------ | -------------------------------------------------- |
| **[CHECKLIST.md](./CHECKLIST.md)**                                       | ✅ Checklist complète de démarrage                 |
| **[SETUP_ENV.md](./SETUP_ENV.md)**                                       | 🔧 Configuration des variables d'environnement     |
| **[PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md)**                 | 🏗️ Architecture complète du projet                 |
| **[MIGRATION_SQLITE_TO_POSTGRES.md](./MIGRATION_SQLITE_TO_POSTGRES.md)** | 📊 Migration SQLite → PostgreSQL                   |
| **[MIGRATION_NEXTAUTH_V4_TO_V5.md](./MIGRATION_NEXTAUTH_V4_TO_V5.md)**   | 🔐 Migration NextAuth v4 → v5                      |
| **[TEAM_COLLABORATION.md](./TEAM_COLLABORATION.md)**                     | 👥 Guide de collaboration d'équipe                 |
| **[AUTO_SYNC_SETUP.md](./AUTO_SYNC_SETUP.md)**                           | 🔄 Configuration de la synchronisation automatique |
| **[ENTERPRISE_FEATURES.md](./ENTERPRISE_FEATURES.md)**                   | 🏢 Fonctionnalités Entreprise détaillées           |
| **[ENTERPRISE_MIGRATION_GUIDE.md](./ENTERPRISE_MIGRATION_GUIDE.md)**     | 📈 Guide de migration vers Entreprise              |

## 🏗️ Stack technique

- **Framework** : Next.js 16.1.1 (App Router)
- **Runtime** : React 19.2.3
- **Language** : TypeScript 5
- **Database** : PostgreSQL + Drizzle ORM
- **Auth** : NextAuth v5 (Auth.js)
- **Styling** : Tailwind CSS 4
- **Package Manager** : pnpm 10

## 📁 Structure du projet

```
localkit/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── projects/         # Routes project-scoped
│   │   │   └── [projectId]/  # Routes par projet
│   │   ├── entries/          # (Déprécié) Route globale
│   │   └── ...               # Autres routes dépréciées
│   ├── dashboard/            # Dashboard utilisateur
│   ├── projects/             # Pages projets
│   │   └── [projectId]/      # Page détail projet
│   └── login/                # Page de connexion
├── lib/                      # Bibliothèques utilitaires
│   ├── db/                   # Database
│   │   ├── client.ts         # Client Drizzle
│   │   └── schema.ts         # Schéma PostgreSQL
│   ├── auth.ts               # Configuration NextAuth
│   ├── security.ts           # Helpers sécurité
│   └── ...                   # Autres utilitaires
├── middleware.ts             # Middleware NextAuth
├── auth.config.ts            # Config NextAuth
└── ...
```

## 🔌 API Routes

### Projets

- `GET /api/projects` - Liste des projets
- `POST /api/projects` - Créer un projet
- `GET /api/projects/[id]` - Détails d'un projet

### Entrées de traduction

- `GET /api/projects/[id]/entries` - Toutes les entrées
- `POST /api/projects/[id]/update-entry` - Modifier une entrée
- `POST /api/projects/[id]/delete-key` - Supprimer une clé
- `POST /api/projects/[id]/rename-key` - Renommer une clé

### Import/Export

- `POST /api/projects/[id]/import-zip` - Importer ZIP
- `POST /api/projects/[id]/preview-zip` - Prévisualiser ZIP
- `GET /api/projects/[id]/export` - Exporter en ZIP

### GitHub

- `GET /api/projects/[id]/git/connection` - Statut connexion
- `POST /api/projects/[id]/git/connect` - Connecter un repo
- `POST /api/projects/[id]/git/create-pr` - Créer une PR

### Collaboration (Pro/Entreprise)

- `GET /api/projects/[id]/team` - Liste des membres
- `POST /api/projects/[id]/team/invite` - Inviter un membre
- `DELETE /api/projects/[id]/team/[userId]` - Retirer un membre
- `PATCH /api/projects/[id]/team/[userId]` - Modifier le rôle

### Auto-sync (Pro/Entreprise)

- `POST /api/auto-sync` - Déclencher la synchronisation automatique
- `GET /api/projects/[id]/auto-sync/config` - Configuration auto-sync

### API REST (Entreprise uniquement)

Documentation complète : [ENTERPRISE_FEATURES.md](./ENTERPRISE_FEATURES.md)

- `GET /v1/projects` - Liste des projets
- `GET /v1/projects/{id}/translations` - Toutes les traductions
- `PUT /v1/projects/{id}/translations/{locale}/{namespace}/{key}` - Modifier
- `POST /v1/webhooks` - Configurer un webhook
- `GET /v1/webhooks` - Liste des webhooks

## 🎨 Interface utilisateur

### Dashboard (`/dashboard`)

- Liste de tous vos projets
- Bouton "Create Project"
- Affichage des informations projets

### Page Projet (`/projects/[projectId]`)

**3 onglets principaux :**

1. **Import**
   - Upload de fichier ZIP
   - Preview des entrées avant import
   - Mode merge (fusion) ou replace (remplacement)

2. **Editor**
   - Table éditable de toutes les traductions
   - Filtres : locale, namespace, recherche
   - Édition inline

3. **GitHub**
   - Formulaire de connexion GitHub
   - Bouton création de Pull Request
   - Statut de la connexion

## 🔒 Sécurité

- ✅ Authentification obligatoire (NextAuth v5)
- ✅ Isolation des projets par utilisateur
- ✅ Vérification de propriété (ownerUserId)
- ✅ Protection des routes via middleware
- ✅ Type-safe avec TypeScript et Drizzle ORM

## 🧪 Tests

```bash
# Vérification TypeScript
pnpm tsc --noEmit

# Linter
pnpm lint

# Build production
pnpm build
```

## 🚢 Déploiement

### Vercel (Recommandé)

1. Connectez votre repo GitHub à Vercel
2. Configurez les variables d'environnement :
   - `AUTH_SECRET`
   - `AUTH_GITHUB_ID`
   - `AUTH_GITHUB_SECRET`
   - `DATABASE_URL` (Vercel Postgres)
3. Déployez !

### Variables d'environnement production

```env
AUTH_SECRET=your-production-secret
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret
DATABASE_URL=postgresql://user:pass@host:5432/db
```

**Important :** Mettez à jour l'URL de callback GitHub pour la production :

```
https://votre-domaine.com/api/auth/callback/github
```

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez une branche (`git checkout -b feature/amélioration`)
3. Commit vos changements (`git commit -m 'Ajout d'une fonctionnalité'`)
4. Push vers la branche (`git push origin feature/amélioration`)
5. Ouvrez une Pull Request

## 📄 Licence

MIT

## 🙏 Remerciements

- Next.js
- NextAuth (Auth.js)
- Drizzle ORM
- Tailwind CSS
- i18next

## 📞 Support

Pour toute question ou problème :

1. Consultez la [CHECKLIST.md](./CHECKLIST.md)
2. Lisez la section "Problèmes courants"
3. Ouvrez une issue GitHub

---

Fait avec ❤️ par Brice Vignal
