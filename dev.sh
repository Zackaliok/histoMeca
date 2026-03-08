#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Nettoyage à l'arrêt (Ctrl+C)
cleanup() {
  echo ""
  echo "Arrêt des services..."
  kill "$BACK_PID" "$FRONT_PID" 2>/dev/null || true
  docker compose -f "$ROOT/docker-compose.yml" stop
  exit 0
}
trap cleanup INT TERM

# 1. Conteneurs Docker
echo "==> Démarrage des conteneurs (MongoDB + Mongo Express)..."
docker compose -f "$ROOT/docker-compose.yml" up -d

# 2. Backend
echo "==> Démarrage du backend (Fastify dev)..."
cd "$ROOT/histoMeca-back"
[ ! -d node_modules ] && npm install
npm run dev &
BACK_PID=$!

# 3. Frontend
echo "==> Démarrage du frontend (Vite dev)..."
cd "$ROOT/histoMeca-front"
[ ! -d node_modules ] && npm install
npm run dev &
FRONT_PID=$!

echo ""
echo "Services disponibles :"
echo "  API       -> http://localhost:3000"
echo "  Frontend  -> http://localhost:5173"
echo "  Mongo UI  -> http://localhost:8081"
echo ""
echo "Ctrl+C pour tout arrêter."

wait "$BACK_PID" "$FRONT_PID"
