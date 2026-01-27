#!/bin/bash

# Zaggle Local Network Play Script
# Starts both backend and frontend for local network play

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get local IP address
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}')

echo -e "${CYAN}================================${NC}"
echo -e "${CYAN}   Zaggle Local Network Play    ${NC}"
echo -e "${CYAN}================================${NC}"
echo ""

# Kill any existing processes on our ports
echo -e "${YELLOW}Cleaning up old processes...${NC}"
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
sleep 1

# Start backend
echo -e "${YELLOW}Starting backend server...${NC}"
cd "$(dirname "$0")/backend"
python3 main.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 2

# Start frontend
echo -e "${YELLOW}Starting frontend server...${NC}"
cd "$(dirname "$0")/frontend"
npm run dev -- --hostname 0.0.0.0 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 3

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}       Servers Running!         ${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "Your local IP: ${CYAN}${LOCAL_IP}${NC}"
echo ""
echo -e "${GREEN}Play on this computer:${NC}"
echo -e "  http://localhost:3000"
echo ""
echo -e "${GREEN}Play on other devices (share this with your wife):${NC}"
echo -e "  ${CYAN}http://${LOCAL_IP}:3000${NC}"
echo ""
echo -e "${YELLOW}Instructions:${NC}"
echo -e "  1. Both open the link above"
echo -e "  2. One person creates a game"
echo -e "  3. Share the game code with the other"
echo -e "  4. Have fun!"
echo ""
echo -e "Press ${CYAN}Ctrl+C${NC} to stop both servers"
echo ""

# Handle cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
