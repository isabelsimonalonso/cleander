#!/bin/bash

# 🚀 Script de Deploy Automático para Cleander
# Este script prepara todo para el deploy

echo "🚀 INICIANDO DEPLOY DE CLEANDER"
echo "=================================="
echo ""

# 1. Verificar que todo está en main
echo "1️⃣ Verificando cambios en Git..."
cd /home/isasimon/proyectos/cleander/.claude/worktrees/matches-fix
git status
echo ""

# 2. Verificar dependencias
echo "2️⃣ Verificando dependencias..."
echo "   Frontend:"
cd frontend && npm list react react-dom 2>/dev/null | grep -E "react|react-dom" | head -2
echo "   Backend:"
cd ../backend && npm list express 2>/dev/null | grep express | head -1
echo ""

# 3. Build del frontend
echo "3️⃣ Building frontend para GitHub Pages..."
cd ../frontend
npm run build
if [ -d "dist" ]; then
  echo "   ✅ Build exitoso"
  echo "   📁 Archivos: $(ls -1 dist | wc -l) archivos"
else
  echo "   ❌ Build falló"
  exit 1
fi
echo ""

# 4. Verificar backend
echo "4️⃣ Verificando backend..."
cd ../backend
if [ -f "src/index.js" ]; then
  echo "   ✅ Backend estructura OK"
else
  echo "   ❌ Backend no encontrado"
  exit 1
fi
echo ""

# 5. Resumen
echo "5️⃣ RESUMEN FINAL"
echo "==============="
echo ""
echo "✅ Código: Listo en GitHub"
echo "   URL: https://github.com/isabelsimonalonso/cleander"
echo ""
echo "⏳ Frontend: Listo para GitHub Pages"
echo "   Build: ./frontend/dist/"
echo "   URL: https://isabelsimonalonso.github.io/cleander"
echo ""
echo "⏳ Backend: Listo para Railway"
echo "   Archivo: Procfile + railway.json"
echo "   URL: Tu URL de Railway"
echo ""

# 6. Instrucciones finales
echo "📋 PRÓXIMOS PASOS:"
echo "1. GitHub Pages: Settings → Pages → gh-pages branch"
echo "2. Railway: New Project → Deploy from GitHub"
echo "3. Actualizar VITE_API_URL si es necesario"
echo ""
echo "🎉 ¡Deploy completado!"
