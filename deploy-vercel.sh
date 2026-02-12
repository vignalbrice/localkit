#!/bin/bash

# Script de déploiement rapide sur Vercel
# Usage: ./deploy-vercel.sh

set -e

echo "🚀 Déploiement de LocalKit sur Vercel"
echo ""

# Vérifier que vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé."
    echo "📦 Installation de Vercel CLI..."
    pnpm add -g vercel
fi

echo "✅ Vercel CLI détecté"
echo ""

# Vérifier les variables d'environnement critiques
echo "🔍 Vérification des variables d'environnement..."

required_vars=(
    "AUTH_SECRET"
    "AUTH_GITHUB_ID"
    "AUTH_GITHUB_SECRET"
    "DATABASE_URL"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "⚠️  Variables d'environnement manquantes dans .env.local:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "💡 Assurez-vous de configurer ces variables sur Vercel :"
    echo "   https://vercel.com/docs/concepts/projects/environment-variables"
    echo ""
fi

# Vérifier que le build fonctionne
echo "🔨 Test du build en local..."
pnpm build

if [ $? -eq 0 ]; then
    echo "✅ Build local réussi !"
else
    echo "❌ Erreur lors du build local. Corrigez les erreurs avant de déployer."
    exit 1
fi

echo ""
echo "📝 Notes importantes pour Vercel :"
echo "1. Configurez toutes les variables d'environnement sur Vercel"
echo "2. Mettez à jour AUTH_URL avec votre URL Vercel de production"
echo "3. Mettez à jour les URLs de callback GitHub OAuth"
echo "4. Assurez-vous que les migrations DB sont exécutées sur Supabase"
echo ""

read -p "Voulez-vous déployer maintenant ? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Déploiement en cours..."
    vercel --prod
    echo ""
    
    if [ $? -eq 0 ]; then
        # Afficher le message de succès
        chmod +x ./show-deployment-success.sh
        ./show-deployment-success.sh
    else
        echo "❌ Erreur lors du déploiement."
        echo "Consultez les logs avec: vercel logs"
    fi
else
    echo "❌ Déploiement annulé."
fi
