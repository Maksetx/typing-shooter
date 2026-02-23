#!/bin/bash
# Deploy script for DigitalOcean Droplet
set -e

echo "=== Pulling latest code ==="
cd /var/www/typing-shooter
git pull origin main

echo "=== Installing dependencies ==="
npm install

echo "=== Building ==="
npm run build

echo "=== Reloading nginx ==="
systemctl reload nginx

echo "=== Done! ==="
