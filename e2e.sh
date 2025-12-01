#!/bin/bash

COMPOSE=${COMPOSE:-docker compose}
BASE_URL=${BASE_URL:-http://localhost:3000}

echo "🧹 Cleaning up existing services..."
$COMPOSE down


echo "🚀 Starting docker compose services..."
$COMPOSE up --build -d hotel-api guest-web admin-web web

echo "⏳ Waiting for services to be ready..."
MAX_WAIT=90
WAIT_COUNT=0

# Function to check if a URL is accessible
check_url() {
  local url=$1
  if command -v curl > /dev/null 2>&1; then
    curl -f -s --max-time 2 "$url" > /dev/null 2>&1
  elif command -v wget > /dev/null 2>&1; then
    wget -q --spider --timeout=2 "$url" > /dev/null 2>&1
  else
    # Fallback: try to connect to port (works on most systems)
    local port=$(echo "$url" | sed -n 's|.*:\([0-9]*\).*|\1|p')
    if [ -n "$port" ]; then
      timeout 1 bash -c "cat < /dev/null > /dev/tcp/localhost/$port" 2>/dev/null
    else
      return 1
    fi
  fi
}

echo "   Checking web server (port 3000)..."
while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
  if check_url "http://localhost:3000"; then
    echo "   ✅ Web server is ready"
    break
  fi
  if [ $((WAIT_COUNT % 10)) -eq 0 ] && [ $WAIT_COUNT -gt 0 ]; then
    echo "   Still waiting... ($WAIT_COUNT/$MAX_WAIT seconds)"
  fi
  sleep 2
  WAIT_COUNT=$((WAIT_COUNT + 2))
done

# Reset counter for API check
WAIT_COUNT=0
echo "   Checking API server (port 8080)..."
while [ $WAIT_COUNT -lt 30 ]; do
  if check_url "http://localhost:8080" || check_url "http://localhost:8080/api/admin/rooms"; then
    echo "   ✅ API server is ready"
    break
  fi
  sleep 2
  WAIT_COUNT=$((WAIT_COUNT + 2))
done

# Give services a bit more time to fully stabilize
echo "   ⏳ Allowing services to stabilize..."
sleep 5
echo "✅ Services are ready for testing!"

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

