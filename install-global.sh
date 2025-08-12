#!/usr/bin/env bash
set -e
# Instalación global automática del proyecto
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$npm_lifecycle_event" = "postinstall" ]; then
  # Ejecutado automáticamente tras `npm install -g`
  npm run build >/dev/null 2>&1 || true
else
  # Instalación manual desde el repositorio
  npm install --silent >/dev/null 2>&1
  npm run build >/dev/null 2>&1 || true
  npm install -g "$DIR" --silent >/dev/null 2>&1
fi

echo "Instalación global completada"
