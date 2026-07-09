#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Moving into backend directory..."
cd backend

echo "Installing dependencies from local path..."
pip install --upgrade pip
pip install -r requirements.txt