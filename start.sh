#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting OneWorkstation..."

# Start backend server
echo "[1/2] Starting backend server on :3001 ..."
cd "$PROJECT_DIR/server"
npm run dev &
BACKEND_PID=$!

# Start frontend dev server
echo "[2/2] Starting frontend dev server on :5173 ..."
cd "$PROJECT_DIR"
npm run dev &
FRONTEND_PID=$!

# Wait a bit for servers to start
sleep 3

# Open browser
echo "Opening http://localhost:5173 ..."
open http://localhost:5173

echo ""
echo "Servers running:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for processes
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait