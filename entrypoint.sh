#!/bin/sh
set -e
mkdir -p /app/apps/backend/data
cd /app/apps/backend && node server.js &
exec nginx -g "daemon off;"
