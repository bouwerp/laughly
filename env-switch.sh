#!/bin/bash

ENV=$1

if [ "$ENV" == "local" ]; then
  echo "🚀 Switching to LOCAL environment..."
  cp env.local .env
  
  # Optional: Automatic IP detection for Android/Physical devices
  # IP=$(ipconfig getifaddr en0) # macOS specific
  # sed -i '' "s/127.0.0.1/$IP/g" .env
  
elif [ "$ENV" == "production" ]; then
  echo "🌍 Switching to PRODUCTION environment..."
  cp env.production .env
else
  echo "❌ Error: Please specify 'local' or 'production'"
  exit 1
fi

echo "✅ .env updated successfully."
