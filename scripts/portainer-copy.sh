#!/bin/bash
# Helper script to prepare Level Up Live for Portainer deployment

set -e

echo "=========================================="
echo "Level Up Live - Portainer Setup Helper"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}Project Root: $PROJECT_ROOT${NC}"
echo ""

# Check if files exist
echo -e "${BLUE}Checking required files...${NC}"

FILES_TO_CHECK=(
  "Dockerfile"
  ".dockerignore"
  "docker-compose.portainer.yml"
  ".env.portainer"
)

MISSING=0
for file in "${FILES_TO_CHECK[@]}"; do
  if [ -f "$PROJECT_ROOT/$file" ]; then
    echo -e "${GREEN}✓ $file${NC}"
  else
    echo -e "${RED}✗ $file (MISSING)${NC}"
    MISSING=$((MISSING + 1))
  fi
done

echo ""

if [ $MISSING -gt 0 ]; then
  echo -e "${RED}Error: Missing $MISSING file(s)${NC}"
  exit 1
fi

echo -e "${GREEN}All required files present!${NC}"
echo ""

# Show next steps
echo -e "${BLUE}========== NEXT STEPS ==========${NC}"
echo ""
echo "1. Open your browser and go to:"
echo -e "   ${YELLOW}http://umbrel.local:9000${NC} (Portainer)"
echo ""
echo "2. Navigate to: Stacks → + Add Stack"
echo ""
echo "3. Name: ${YELLOW}level-up-live${NC}"
echo ""
echo "4. In 'Web Editor', paste the content of:"
echo -e "   ${YELLOW}docker-compose.portainer.yml${NC}"
echo ""
echo "   To copy the file content, run:"
echo -e "   ${BLUE}cat $PROJECT_ROOT/docker-compose.portainer.yml${NC}"
echo ""
echo "5. Click 'Deploy the stack'"
echo ""
echo "6. Wait 2-3 minutes for build and startup"
echo ""
echo "7. Access the app at:"
echo -e "   ${YELLOW}http://umbrel.local:8881${NC}"
echo ""
echo -e "${BLUE}=============================\n${NC}"

echo -e "${YELLOW}Optional: Change security settings${NC}"
echo "In Portainer Stack Environment Variables, add:"
echo -e "${BLUE}POSTGRES_PASSWORD=your_secure_password_here${NC}"
echo ""

# Offer to copy to clipboard (if xclip is available)
if command -v xclip &> /dev/null; then
  echo -e "${BLUE}Quick copy options:${NC}"
  read -p "Copy docker-compose.portainer.yml to clipboard? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    cat "$PROJECT_ROOT/docker-compose.portainer.yml" | xclip -selection clipboard
    echo -e "${GREEN}✓ Copied to clipboard!${NC}"
  fi
  echo ""
else
  echo -e "${YELLOW}Tip: Install xclip for one-command clipboard copy${NC}"
  echo "     apt install xclip"
  echo ""
fi

echo -e "${GREEN}Setup helper complete!${NC}"
echo ""
echo -e "${BLUE}For more detailed instructions, see:${NC}"
echo "  - docs/PORTAINER_SETUP.md (Complete guide)"
echo "  - PORTAINER_QUICK_START.md (Quick reference)"
echo ""
