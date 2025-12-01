#!/bin/bash

COMPOSE=${COMPOSE:-docker compose}
BASE_URL=${BASE_URL:-http://localhost:3000}

echo "🚀 Starting docker compose services..."
$COMPOSE up -d hotel-api guest-web admin-web web

echo "🧪 Running E2E tests locally..."
set +e
EXIT_CODE=0
cd tests/e2e
BASE_URL=$BASE_URL npm test || EXIT_CODE=$?
cd ../..
set -e

echo "🛑 Stopping all services..."
$COMPOSE down

echo ""
echo "📊 E2E Test Report:"
echo "   Open: tests/e2e/playwright-report/index.html"
echo ""

exit $EXIT_CODE

