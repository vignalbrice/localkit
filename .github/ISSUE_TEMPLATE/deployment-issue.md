---
name: Problème de Déploiement Vercel
about: Signalez un problème lors du déploiement sur Vercel
title: "[DEPLOY] "
labels: deployment, vercel
assignees: ""
---

## 🚨 Description du Problème

<!-- Décrivez brièvement le problème rencontré lors du déploiement -->

## 🔍 Environnement

- **Plateforme** : Vercel
- **Plan Vercel** : [ ] Hobby / [ ] Pro / [ ] Enterprise
- **Base de données** : Supabase
- **Node version** :
- **Branche** :

## 📋 Étapes pour Reproduire

1.
2.
3.

## ❌ Comportement Actuel

<!-- Que se passe-t-il actuellement ? -->

## ✅ Comportement Attendu

<!-- Que devrait-il se passer ? -->

## 📸 Captures d'Écran / Logs

<!-- Si applicable, ajoutez des captures d'écran ou des logs -->

```
Collez les logs ici
```

## ✅ Checklist de Vérification

Avez-vous vérifié :

- [ ] Les variables d'environnement sont configurées sur Vercel
- [ ] `AUTH_URL` n'a PAS de slash final
- [ ] Les URLs de callback GitHub OAuth sont correctes
- [ ] Les migrations DB sont exécutées sur Supabase
- [ ] Le build fonctionne en local (`pnpm build`)
- [ ] Le script de vérification passe (`pnpm check:deploy`)
- [ ] Consulté [DEPLOYMENT.md](../DEPLOYMENT.md)
- [ ] Consulté [VERCEL_QUICKSTART.md](../VERCEL_QUICKSTART.md)
- [ ] Vérifié les logs Vercel (`vercel logs`)

## 📝 Informations Supplémentaires

<!-- Toute autre information utile -->

## 🔗 Liens Utiles

- Vercel Deployment URL :
- Logs Vercel :
- Supabase Dashboard :

---

**Note** : Assurez-vous de ne PAS partager vos secrets (AUTH_SECRET, tokens, etc.) dans cette issue !
