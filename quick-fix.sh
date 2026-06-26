#!/bin/bash
# Nexus Platform - Quick Fix Script
# Automatically fixes critical issues found in audit

echo "=========================================="
echo "NEXUS PLATFORM - CRITICAL FIXES"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if in project root
if [ ! -d "backend" ] || [ ! -d "Nexus" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    exit 1
fi

echo "🔍 Starting critical fixes..."
echo ""

# ========================================
# FIX 1: Create uploads directory
# ========================================
echo "📁 Fix 1: Creating uploads/ directory..."
if [ -d "backend/uploads" ]; then
    echo -e "${GREEN}   ✅ uploads/ directory already exists${NC}"
else
    mkdir -p backend/uploads
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}   ✅ Created backend/uploads/ directory${NC}"
        chmod 755 backend/uploads
    else
        echo -e "${RED}   ❌ Failed to create uploads directory${NC}"
        exit 1
    fi
fi
echo ""

# ========================================
# FIX 2: Enable mongoSanitize
# ========================================
echo "🔒 Fix 2: Enabling mongoSanitize middleware..."
if grep -q "^// app.use(mongoSanitize" backend/server.js; then
    # Uncomment mongoSanitize lines (72-77)
    sed -i.bak '72,77s|^// ||' backend/server.js

    # Remove the TEMPORARILY DISABLED comment lines
    sed -i.bak '/TEMPORARILY DISABLED - Fix compatibility issue/d' backend/server.js

    echo -e "${GREEN}   ✅ Enabled mongoSanitize${NC}"
else
    echo -e "${YELLOW}   ⚠️  mongoSanitize already enabled or not found${NC}"
fi
echo ""

# ========================================
# FIX 3: Enable xss-clean
# ========================================
echo "🔒 Fix 3: Enabling xss-clean middleware..."
if grep -q "^// app.use(xss" backend/server.js; then
    # Uncomment xss-clean line (around line 81)
    sed -i.bak '/^\/\/ app\.use(xss()/s|^// ||' backend/server.js

    echo -e "${GREEN}   ✅ Enabled xss-clean${NC}"
else
    echo -e "${YELLOW}   ⚠️  xss-clean already enabled or not found${NC}"
fi
echo ""

# ========================================
# FIX 4: Generate strong JWT secret
# ========================================
echo "🔑 Fix 4: Generating strong JWT secret..."
NEW_JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

if [ -f "backend/.env" ]; then
    CURRENT_SECRET=$(grep "^JWT_SECRET=" backend/.env | cut -d'=' -f2)

    if [ "$CURRENT_SECRET" == "nexus_super_secret_key_2026" ]; then
        # Replace weak secret with strong one
        sed -i.bak "s|^JWT_SECRET=.*|JWT_SECRET=$NEW_JWT_SECRET|" backend/.env
        echo -e "${GREEN}   ✅ Generated new strong JWT secret${NC}"
        echo -e "${YELLOW}   ⚠️  IMPORTANT: Users must re-login after this change${NC}"
    else
        echo -e "${YELLOW}   ⚠️  JWT secret already customized, not changing${NC}"
    fi
else
    echo -e "${RED}   ❌ backend/.env file not found${NC}"
fi
echo ""

# ========================================
# FIX 5: Verify .gitignore
# ========================================
echo "🙈 Fix 5: Verifying .gitignore..."
if [ -f "backend/.gitignore" ]; then
    if grep -q "^\.env" backend/.gitignore; then
        echo -e "${GREEN}   ✅ .env already in .gitignore${NC}"
    else
        echo ".env" >> backend/.gitignore
        echo ".env.local" >> backend/.gitignore
        echo ".env.production" >> backend/.gitignore
        echo -e "${GREEN}   ✅ Added .env to .gitignore${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  backend/.gitignore not found, creating...${NC}"
    cat > backend/.gitignore << EOF
node_modules/
.env
.env.local
.env.production
uploads/*
!uploads/.gitkeep
*.log
EOF
    echo -e "${GREEN}   ✅ Created backend/.gitignore${NC}"
fi
echo ""

# ========================================
# VERIFICATION
# ========================================
echo "=========================================="
echo "🧪 VERIFICATION"
echo "=========================================="
echo ""

ERRORS=0

# Check uploads directory
if [ -d "backend/uploads" ]; then
    echo -e "${GREEN}✅ uploads/ directory exists${NC}"
else
    echo -e "${RED}❌ uploads/ directory missing${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check mongoSanitize
if grep -q "^app.use(mongoSanitize" backend/server.js; then
    echo -e "${GREEN}✅ mongoSanitize enabled${NC}"
else
    echo -e "${RED}❌ mongoSanitize not enabled${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check xss-clean
if grep -q "^app.use(xss" backend/server.js; then
    echo -e "${GREEN}✅ xss-clean enabled${NC}"
else
    echo -e "${RED}❌ xss-clean not enabled${NC}"
    ERRORS=$((ERRORS+1))
fi

# Check JWT secret
if [ -f "backend/.env" ]; then
    JWT_SECRET=$(grep "^JWT_SECRET=" backend/.env | cut -d'=' -f2)
    if [ ${#JWT_SECRET} -ge 32 ]; then
        echo -e "${GREEN}✅ JWT secret is strong (${#JWT_SECRET} characters)${NC}"
    else
        echo -e "${YELLOW}⚠️  JWT secret may be weak (${#JWT_SECRET} characters)${NC}"
    fi
fi

# Check .gitignore
if grep -q "^\.env" backend/.gitignore 2>/dev/null; then
    echo -e "${GREEN}✅ .env in .gitignore${NC}"
else
    echo -e "${YELLOW}⚠️  .env may not be in .gitignore${NC}"
fi

echo ""
echo "=========================================="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CRITICAL FIXES APPLIED SUCCESSFULLY!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Test backend startup: cd backend && npm run dev"
    echo "2. Verify MongoDB connection"
    echo "3. Test document upload functionality"
    echo "4. Deploy to staging environment"
else
    echo -e "${RED}❌ $ERRORS error(s) found. Please review and fix manually.${NC}"
    exit 1
fi

echo ""
echo "🎉 Nexus platform is now ready for deployment!"
echo "=========================================="
