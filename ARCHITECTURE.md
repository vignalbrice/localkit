# 🎨 Architecture de Déploiement LocalKit

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                          UTILISATEUR FINAL                              │
│                                                                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │ HTTPS
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                        VERCEL EDGE NETWORK                              │
│                     (CDN Global + SSL/TLS)                              │
│                                                                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                      NEXT.JS APPLICATION                                │
│                         (Serverless)                                    │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │              │  │              │  │              │                 │
│  │  Pages       │  │  API Routes  │  │  Middleware  │                 │
│  │  /dashboard  │  │  /api/auth   │  │  Auth Check  │                 │
│  │  /projects   │  │  /api/sync   │  │              │                 │
│  │  /settings   │  │  /api/...    │  │              │                 │
│  │              │  │              │  │              │                 │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                 │
│         │                 │                 │                          │
└─────────┼─────────────────┼─────────────────┼──────────────────────────┘
          │                 │                 │
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                      SERVICES EXTERNES                                  │
│                                                                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │                 │  │                 │  │                 │         │
│  │   SUPABASE      │  │   GITHUB        │  │   VERCEL        │         │
│  │   PostgreSQL    │  │   OAuth + API   │  │   Cron Jobs     │         │
│  │                 │  │                 │  │   (Pro Plan)    │         │
│  │   • Users       │  │   • Auth        │  │                 │         │
│  │   • Projects    │  │   • Repos       │  │   • Auto-sync   │         │
│  │   • Entries     │  │   • Pull Req.   │  │   (2h du matin) │         │
│  │   • Teams       │  │                 │  │                 │         │
│  │                 │  │                 │  │                 │         │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Flux de Déploiement

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          WORKFLOW DÉPLOIEMENT                           │
└─────────────────────────────────────────────────────────────────────────┘

  LOCAL DEVELOPMENT
       │
       │  git push origin main
       ▼
  ┌──────────────┐
  │   GITHUB     │
  │  Repository  │
  └──────┬───────┘
         │
         │  Webhook
         ▼
  ┌──────────────┐
  │   VERCEL     │
  │  Auto Build  │
  └──────┬───────┘
         │
         │  1. Install dependencies (pnpm install)
         │  2. Run build (pnpm build)
         │  3. Deploy to Edge Network
         ▼
  ┌──────────────┐
  │ PRODUCTION   │
  │   LIVE 🚀    │
  └──────────────┘
```

## 🔐 Flux d'Authentification

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AUTHENTIFICATION NEXTAUTH v5                       │
└─────────────────────────────────────────────────────────────────────────┘

  UTILISATEUR
       │
       │  Clic "Login with GitHub"
       ▼
  ┌──────────────┐
  │   NextAuth   │
  │  /api/auth   │
  └──────┬───────┘
         │
         │  Redirect to GitHub
         ▼
  ┌──────────────┐
  │   GITHUB     │
  │  OAuth Page  │
  └──────┬───────┘
         │
         │  User authorizes
         ▼
  ┌──────────────┐
  │   Callback   │
  │  /callback   │
  └──────┬───────┘
         │
         │  Create Session + JWT
         ▼
  ┌──────────────┐
  │  SUPABASE    │
  │ Save to DB   │
  └──────┬───────┘
         │
         │  Session Cookie
         ▼
  ┌──────────────┐
  │ DASHBOARD    │
  │  Logged In   │
  └──────────────┘
```

## 📊 Flux de Données

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    GESTION DES TRADUCTIONS                              │
└─────────────────────────────────────────────────────────────────────────┘

  USER ACTION
       │
       │  1. Upload ZIP/JSON
       ▼
  ┌──────────────┐
  │  API Route   │
  │  /api/import │
  └──────┬───────┘
         │
         │  2. Parse & Validate
         ▼
  ┌──────────────┐
  │  Validation  │
  │   + Preview  │
  └──────┬───────┘
         │
         │  3. User confirms
         ▼
  ┌──────────────┐
  │  SUPABASE    │
  │  Insert DB   │
  └──────┬───────┘
         │
         │  4. Success
         ▼
  ┌──────────────┐
  │  Dashboard   │
  │  Updated ✅  │
  └──────────────┘
```

## 🔄 Auto-Sync avec GitHub

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AUTO-SYNC CRON JOB                                 │
└─────────────────────────────────────────────────────────────────────────┘

  Tous les jours à 2h du matin (UTC)
       │
       │  Vercel Cron triggers
       ▼
  ┌──────────────┐
  │ /api/auto-   │
  │    sync      │
  └──────┬───────┘
         │
         │  Fetch projects with auto-sync enabled
         ▼
  ┌──────────────┐
  │  SUPABASE    │
  │  Query DB    │
  └──────┬───────┘
         │
         │  For each project:
         ▼
  ┌──────────────┐
  │  Pull from   │
  │  GitHub Repo │
  └──────┬───────┘
         │
         │  Compare & Merge
         ▼
  ┌──────────────┐
  │  Update DB   │
  │  if changed  │
  └──────┬───────┘
         │
         │  Success
         ▼
  ┌──────────────┐
  │  Logs        │
  │  Complete ✅ │
  └──────────────┘

⚠️  Note: Nécessite un plan Vercel Pro ou supérieur
```

## 🌐 Déploiement Multi-Environnement

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ENVIRONNEMENTS VERCEL                                │
└─────────────────────────────────────────────────────────────────────────┘

  ┌────────────────────────────────────────────────────────┐
  │  PRODUCTION                                            │
  │  ├─ Branch: main                                       │
  │  ├─ URL: https://localkit.vercel.app                   │
  │  └─ Vars: Production environment variables             │
  └────────────────────────────────────────────────────────┘

  ┌────────────────────────────────────────────────────────┐
  │  PREVIEW                                               │
  │  ├─ Branch: feature/*                                  │
  │  ├─ URL: https://localkit-git-feature-xyz.vercel.app   │
  │  └─ Vars: Preview environment variables                │
  └────────────────────────────────────────────────────────┘

  ┌────────────────────────────────────────────────────────┐
  │  DEVELOPMENT                                           │
  │  ├─ Local: localhost:3001                              │
  │  ├─ Command: vercel dev                                │
  │  └─ Vars: Development environment variables            │
  └────────────────────────────────────────────────────────┘
```

## 🔒 Sécurité & Headers

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SECURITY HEADERS (vercel.json)                     │
└─────────────────────────────────────────────────────────────────────────┘

  Request
     │
     ▼
  ┌─────────────────────────────────────────┐
  │  X-Content-Type-Options: nosniff        │
  │  X-Frame-Options: DENY                  │
  │  X-XSS-Protection: 1; mode=block        │
  │  Referrer-Policy: strict-origin         │
  └─────────────────────────────────────────┘
     │
     ▼
  Application
```

---

**Cette architecture garantit :**

- 🚀 Performance globale via CDN
- 🔐 Sécurité avec HTTPS + Headers
- 📊 Scalabilité automatique
- 🔄 Déploiements continus
- 💾 Persistence avec Supabase
- 🔐 Auth sécurisée avec NextAuth
