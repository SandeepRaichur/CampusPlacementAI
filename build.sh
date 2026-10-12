#!/usr/bin/env bash
# exit on error
set -o errexit

echo "==> HireNexus Build Script"
echo "==> Current directory: $(pwd)"

# Ensure pip is up to date
pip install --upgrade pip

# Install backend dependencies
if [ -f "backend/requirements.txt" ]; then
  echo "==> Installing backend dependencies from backend/requirements.txt..."
  pip install -r backend/requirements.txt
elif [ -f "requirements.txt" ]; then
  echo "==> Installing backend dependencies from requirements.txt..."
  pip install -r requirements.txt
fi

# Build frontend if Node/npm is present
if [ -d "frontend" ] && command -v npm >/dev/null 2>&1; then
  echo "==> Building frontend application..."
  (cd frontend && npm install && npm run build)
  echo "==> Frontend built successfully!"
fi

echo "==> Build process completed successfully!"