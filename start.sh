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

# 2. Build + démarrage du backend
echo "==> Build et démarrage du backend..."
cd "$ROOT/histoMeca-back"
[ ! -d node_modules ] && npm install
npm run build:ts
npm run start &
BACK_PID=$!

# 3. Build + preview du frontend
echo "==> Build du frontend..."
cd "$ROOT/histoMeca-front"
[ ! -d node_modules ] && npm install
npm run build
echo "==> Démarrage du preview frontend..."
npm run preview &
FRONT_PID=$!

echo ""
echo "Services disponibles :"
echo "  API       -> http://localhost:3000"
echo "  Frontend  -> http://localhost:4173"
echo "  Mongo UI  -> http://localhost:8081"
echo ""
echo "Ctrl+C pour tout arrêter."

wait "$BACK_PID" "$FRONT_PID"
