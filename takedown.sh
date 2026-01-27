#!/bin/bash

# Zaggle Takedown Script
# Stops the backend and ngrok, deploys offline page

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$SCRIPT_DIR/.zaggle-pids"

echo ""
echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║        ZAGGLE TAKEDOWN                 ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if PID file exists
if [ ! -f "$PID_FILE" ]; then
    echo -e "${YELLOW}No running Zaggle instance found.${NC}"
    echo -e "Cleaning up any stray processes anyway..."
    pkill -f "ngrok http 8081" 2>/dev/null
    lsof -ti:8081 | xargs kill -9 2>/dev/null
    echo -e "${GREEN}Done!${NC}"
    exit 0
fi

# Load PIDs
source "$PID_FILE"

echo -e "${YELLOW}Shutting down Zaggle...${NC}"
echo ""

# Stop backend
echo -e "  • Stopping backend server (PID: $BACKEND_PID)..."
kill $BACKEND_PID 2>/dev/null
sleep 1
# Force kill if still running
kill -9 $BACKEND_PID 2>/dev/null

# Stop ngrok
echo -e "  • Stopping ngrok tunnel (PID: $NGROK_PID)..."
kill $NGROK_PID 2>/dev/null
pkill -f "ngrok http 8081" 2>/dev/null

# Clean up port
lsof -ti:8081 | xargs kill -9 2>/dev/null

# Enable maintenance mode and redeploy frontend
echo -e "  • Enabling maintenance mode..."

cd "$SCRIPT_DIR/frontend"

# Remove old MAINTENANCE_MODE env var if it exists, then add it as true
npx vercel env rm MAINTENANCE_MODE production --yes 2>/dev/null || true
echo "true" | npx vercel env add MAINTENANCE_MODE production --yes 2>/dev/null

# Redeploy to pick up the maintenance mode (env var is baked in at build time)
echo -e "  • Redeploying frontend in maintenance mode (this may take a minute)..."
npx vercel --prod --yes -e MAINTENANCE_MODE=true 2>&1 | tail -3

# Remove PID file
rm -f "$PID_FILE"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        ZAGGLE IS NOW OFFLINE                           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "   The public URL now shows an offline page."
echo -e "   ${YELLOW}Note:${NC} Users may need to refresh or clear browser cache."
echo ""
echo -e "   To go live again: ${CYAN}./golive-publicdemo.sh${NC}"
echo ""
