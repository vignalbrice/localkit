#!/bin/bash

# Script de vérification pré-déploiement
# Vérifie que tout est prêt avant de déployer sur Vercel

set -e

echo "🔍 Vérification pré-déploiement LocalKit"
echo "========================================"
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0

# 1. Vérifier Node version
echo "1️⃣  Vérification de Node.js..."
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -ge 20 ]; then
    echo -e "${GREEN}✅ Node.js version OK ($node_version)${NC}"
else
    echo -e "${RED}❌ Node.js version trop ancienne. Minimum requis: 20${NC}"
    ((errors++))
fi
echo ""

# 2. Vérifier pnpm
echo "2️⃣  Vérification de pnpm..."
if command -v pnpm &> /dev/null; then
    pnpm_version=$(pnpm -v)
    echo -e "${GREEN}✅ pnpm installé (v$pnpm_version)${NC}"
else
    echo -e "${RED}❌ pnpm n'est pas installé${NC}"
    ((errors++))
fi
echo ""

# 3. Vérifier les dépendances
echo "3️⃣  Vérification des dépendances..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules existe${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules manquant. Installation...${NC}"
    pnpm install
    ((warnings++))
fi
echo ""

# 4. Vérifier le fichier .env.local
echo "4️⃣  Vérification des variables d'environnement..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local existe${NC}"
    
    # Vérifier les variables critiques
    required_vars=("AUTH_SECRET" "AUTH_GITHUB_ID" "AUTH_GITHUB_SECRET" "DATABASE_URL")
    
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env.local; then
            echo -e "   ${GREEN}✓${NC} $var"
        else
            echo -e "   ${RED}✗${NC} $var manquant"
            ((errors++))
        fi
    done
else
    echo -e "${RED}❌ .env.local n'existe pas${NC}"
    echo "   Créez-le depuis .env.example"
    ((errors++))
fi
echo ""

# 5. Test TypeScript
echo "5️⃣  Vérification TypeScript..."
if pnpm tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Pas d'erreurs TypeScript${NC}"
else
    echo -e "${RED}❌ Erreurs TypeScript détectées${NC}"
    echo "   Exécutez: pnpm tsc --noEmit"
    ((errors++))
fi
echo ""

# 6. Test ESLint
echo "6️⃣  Vérification ESLint..."
if pnpm lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Pas d'erreurs ESLint${NC}"
else
    echo -e "${YELLOW}⚠️  Avertissements ESLint détectés${NC}"
    echo "   Exécutez: pnpm lint"
    ((warnings++))
fi
echo ""

# 7. Test Build
echo "7️⃣  Test de build..."
if pnpm build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build réussi${NC}"
else
    echo -e "${RED}❌ Erreur lors du build${NC}"
    echo "   Exécutez: pnpm build"
    ((errors++))
fi
echo ""

# 8. Vérifier les fichiers critiques
echo "8️⃣  Vérification des fichiers critiques..."
critical_files=("package.json" "next.config.ts" "auth.config.ts" "drizzle.config.ts")

for file in "${critical_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "   ${GREEN}✓${NC} $file"
    else
        echo -e "   ${RED}✗${NC} $file manquant"
        ((errors++))
    fi
done
echo ""

# 9. Vérifier la connexion Supabase
echo "9️⃣  Vérification de la connexion Supabase..."
if [ -f ".env.local" ] && grep -q "DATABASE_URL.*supabase" .env.local; then
    echo -e "${GREEN}✅ Configuration Supabase détectée${NC}"
    echo -e "${YELLOW}⚠️  Assurez-vous que les migrations sont exécutées${NC}"
    ((warnings++))
else
    echo -e "${YELLOW}⚠️  URL Supabase non détectée${NC}"
    ((warnings++))
fi
echo ""

# Résumé
echo "========================================"
echo "📊 Résumé de la vérification"
echo "========================================"

if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    echo -e "${GREEN}✅ Tout est OK ! Prêt pour le déploiement.${NC}"
    echo ""
    echo "Pour déployer sur Vercel, exécutez:"
    echo "  ./deploy-vercel.sh"
    exit 0
elif [ $errors -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $warnings avertissement(s) détecté(s)${NC}"
    echo -e "${GREEN}✅ Aucune erreur bloquante${NC}"
    echo ""
    echo "Vous pouvez déployer mais vérifiez les avertissements."
    exit 0
else
    echo -e "${RED}❌ $errors erreur(s) détectée(s)${NC}"
    echo -e "${YELLOW}⚠️  $warnings avertissement(s) détecté(s)${NC}"
    echo ""
    echo "Corrigez les erreurs avant de déployer."
    exit 1
fi
