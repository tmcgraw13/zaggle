#!/bin/bash

# Zaggle Public Demo Script
# - Deploys your LOCAL frontend code to Vercel
# - Creates ngrok tunnel for backend
# - Keeps running after terminal closes
# - Use takedown.sh to stop everything

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$SCRIPT_DIR/.zaggle-pids"

echo ""
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║      ${BOLD}ZAGGLE PUBLIC DEMO MODE${NC}${CYAN}          ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${RED}Error: ngrok is not installed${NC}"
    echo "Install it with: brew install ngrok"
    echo "Then add your auth token: ngrok config add-authtoken YOUR_TOKEN"
    exit 1
fi

# Check if npm is installed (for npx vercel)
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    echo "Install Node.js from https://nodejs.org"
    exit 1
fi

# Check if already running
if [ -f "$PID_FILE" ]; then
    echo -e "${YELLOW}Zaggle appears to be already running.${NC}"
    echo -e "Run ${CYAN}./takedown.sh${NC} first to stop it."
    exit 1
fi

# Kill any existing processes
echo -e "${YELLOW}[1/4]${NC} Cleaning up old processes..."
pkill -f "ngrok http 8081" 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
sleep 2

# Start backend in background
echo -e "${YELLOW}[2/4]${NC} Starting backend server..."
cd "$SCRIPT_DIR/backend"
nohup python3 main.py > /tmp/zaggle-backend.log 2>&1 &
BACKEND_PID=$!
cd "$SCRIPT_DIR"
sleep 3

# Verify backend started
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}Error: Backend failed to start${NC}"
    echo "Check /tmp/zaggle-backend.log for details"
    exit 1
fi

# Start ngrok tunnel in background
echo -e "${YELLOW}[3/4]${NC} Creating public tunnel for backend..."
nohup ngrok http 8081 --log=stdout > /tmp/ngrok-backend.log 2>&1 &
NGROK_PID=$!
sleep 5

# Get the ngrok backend URL
BACKEND_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "
import sys,json
try:
    data=json.load(sys.stdin)
    tunnels=data.get('tunnels',[])
    # Find the HTTPS tunnel (ngrok creates both http and https)
    for t in tunnels:
        if t['public_url'].startswith('https://'):
            print(t['public_url'])
            break
    else:
        # Fallback: use first tunnel but force https
        if tunnels:
            url = tunnels[0]['public_url']
            print(url.replace('http://', 'https://'))
except:
    pass
" 2>/dev/null)

if [ -z "$BACKEND_URL" ]; then
    echo -e "${RED}Error: Failed to get ngrok URL${NC}"
    echo "Check if ngrok is running properly"
    kill $BACKEND_PID 2>/dev/null
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

echo -e "     Backend tunnel: ${CYAN}$BACKEND_URL${NC}"
echo ""

# Deploy frontend to Vercel with the backend URL
echo -e "${YELLOW}[4/4]${NC} Deploying your local frontend to Vercel..."
cd "$SCRIPT_DIR/frontend"

# Remove maintenance mode if it was set
echo -e "     Disabling maintenance mode..."
npx vercel env rm MAINTENANCE_MODE production --yes 2>/dev/null || true

# Remove old environment variable and set new one
echo -e "     Updating Vercel environment variable..."
npx vercel env rm NEXT_PUBLIC_SERVER_URL production --yes 2>/dev/null || true
npx vercel env rm NEXT_PUBLIC_SERVER_URL preview --yes 2>/dev/null || true
npx vercel env rm NEXT_PUBLIC_SERVER_URL development --yes 2>/dev/null || true
echo "$BACKEND_URL" | npx vercel env add NEXT_PUBLIC_SERVER_URL production --yes 2>/dev/null

# Deploy to Vercel with the ngrok backend URL and disable maintenance mode
VERCEL_OUTPUT=$(npx vercel --prod --yes -e NEXT_PUBLIC_SERVER_URL="$BACKEND_URL" -e MAINTENANCE_MODE=false 2>&1)
DEPLOYMENT_URL=$(echo "$VERCEL_OUTPUT" | grep -E "https://.*\.vercel\.app" | tail -1)

if [ -z "$DEPLOYMENT_URL" ]; then
    echo -e "${RED}Error: Failed to deploy to Vercel${NC}"
    echo "$VERCEL_OUTPUT"
    kill $BACKEND_PID 2>/dev/null
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

# Save PIDs and URLs to file for takedown script
cat > "$PID_FILE" << EOF
BACKEND_PID=$BACKEND_PID
NGROK_PID=$NGROK_PID
BACKEND_URL=$BACKEND_URL
DEPLOYMENT_URL=$DEPLOYMENT_URL
EOF

cd "$SCRIPT_DIR"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                        ║${NC}"
echo -e "${GREEN}║   ${BOLD}ZAGGLE IS LIVE!${NC}${GREEN}                                    ║${NC}"
echo -e "${GREEN}║                                                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BOLD}   SHARE THIS LINK:${NC}"
echo ""
echo -e "   ${CYAN}${BOLD}$DEPLOYMENT_URL${NC}"
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "   ${YELLOW}Details:${NC}"
echo -e "   • Frontend: $DEPLOYMENT_URL"
echo -e "   • Backend:  $BACKEND_URL"
echo ""
echo -e "   ${YELLOW}Status:${NC}"
echo -e "   • Backend PID: $BACKEND_PID"
echo -e "   • Ngrok PID: $NGROK_PID"
echo -e "   • Logs: /tmp/zaggle-backend.log"
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "   ${BOLD}Zaggle will keep running after you close this terminal.${NC}"
echo -e "   To stop: ${CYAN}./takedown.sh${NC}"
echo ""
