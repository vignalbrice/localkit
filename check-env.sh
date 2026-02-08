#!/bin/bash

# Script de vérification des variables d'environnement
# Usage: ./check-env.sh

echo "🔍 Vérification des variables d'environnement LocalKit"
echo "======================================================"
echo ""

# Charger les variables depuis .env.local
if [ -f .env.local ]; then
    source .env.local
else
    echo "❌ Fichier .env.local introuvable!"
    exit 1
fi

# Fonction pour vérifier une variable
check_var() {
    local var_name=$1
    local var_value="${!var_name}"
    
    if [ -z "$var_value" ]; then
        echo "❌ $var_name: NON DÉFINIE"
        return 1
    else
        # Masquer les valeurs sensibles
        local masked_value=$(echo "$var_value" | sed 's/./*/g')
        echo "✅ $var_name: ${masked_value:0:20}... (${#var_value} caractères)"
        return 0
    fi
}

# Vérifier les variables requises
echo "Variables d'authentification:"
check_var "AUTH_SECRET"
check_var "AUTH_GITHUB_ID"
check_var "AUTH_GITHUB_SECRET"
check_var "AUTH_URL"
check_var "NEXTAUTH_URL"

echo ""
echo "Variables de base de données:"
check_var "DATABASE_URL"

echo ""
echo "======================================================"

# Vérifications supplémentaires
echo ""
echo "🔍 Vérifications supplémentaires:"
echo ""

# Vérifier AUTH_URL sans slash final
if [[ "$AUTH_URL" == */ ]]; then
    echo "⚠️  WARNING: AUTH_URL se termine par un slash (/) - cela peut causer des erreurs"
    echo "   Valeur actuelle: $AUTH_URL"
    echo "   Devrait être: ${AUTH_URL%/}"
else
    echo "✅ AUTH_URL correctement formatée (sans slash final)"
fi

# Vérifier que AUTH_URL et NEXTAUTH_URL correspondent
if [ "$AUTH_URL" != "$NEXTAUTH_URL" ]; then
    echo "⚠️  WARNING: AUTH_URL et NEXTAUTH_URL sont différentes"
    echo "   AUTH_URL: $AUTH_URL"
    echo "   NEXTAUTH_URL: $NEXTAUTH_URL"
else
    echo "✅ AUTH_URL et NEXTAUTH_URL correspondent"
fi

# Vérifier le protocole
if [[ "$AUTH_URL" == http://* ]]; then
    echo "ℹ️  INFO: Utilisation de HTTP (développement)"
elif [[ "$AUTH_URL" == https://* ]]; then
    echo "✅ Utilisation de HTTPS (production)"
else
    echo "❌ ERROR: Protocole invalide dans AUTH_URL"
fi

echo ""
echo "======================================================"
echo "✅ Vérification terminée"
echo ""
echo "Pour appliquer les changements:"
echo "1. Arrêter le serveur (Ctrl+C)"
echo "2. Nettoyer le cache: rm -rf .next"
echo "3. Redémarrer: pnpm dev"
