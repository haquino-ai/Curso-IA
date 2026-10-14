#!/usr/bin/env bash
# instalar.sh — respaldo: instala lo que el Codespace instala solo.
# Úselo únicamente si 'claude' o 'npm run dev' dan error de "no encontrado".
# Uso, en la raíz del proyecto (donde está package.json):   bash instalar.sh
set -e
if [ ! -f package.json ]; then
  echo "No veo package.json aquí. Entre a la carpeta del proyecto y repita."
  exit 1
fi
echo "1/2  Instalando el proyecto..."
npm install
echo "2/2  Instalando a su ayudante (Claude Code) y Vercel..."
npm install -g @anthropic-ai/claude-code vercel
echo ""
echo "Listo. Ahora escriba:"
echo '  export ANTHROPIC_API_KEY="LA-CLAVE"'
echo "  npm run dev"
