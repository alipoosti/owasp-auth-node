#!/bin/bash
set -e

echo "Waiting for app to start..."
sleep 2  # small wait to ensure Fastify is up

# 🔍 Make GET request to /ping
RESPONSE=$(curl --silent http://127.0.0.1:3000/ping)

# ✅ Check if response includes "pong":true
if [[ "$RESPONSE" == *'"pong":true'* ]]; then
  echo "✅ /ping endpoint returned pong"
  exit 0
else
  echo "❌ /ping endpoint check failed"
  echo "Response: $RESPONSE"
  exit 1
fi
