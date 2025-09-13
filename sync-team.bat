@echo off
echo 🔄 SISTEMA DE SINCRONIZACION SIMPLE

echo.
echo Selecciona una opcion:
echo 1. EXPORTAR mis cambios (para compartir con compañeros)
echo 2. IMPORTAR cambios de compañeros
echo 3. Ver instrucciones completas
echo.

set /p opcion="Tu opcion (1-3): "

if "%opcion%"=="1" goto exportar
if "%opcion%"=="2" goto importar
if "%opcion%"=="3" goto instrucciones

:exportar
echo.
echo 📤 EXPORTANDO tu base de datos...
echo.
echo ⚠️  INSTRUCCIONES PARA EXPORTAR EN HEIDI:
echo 1. Abrir HeidiSQL
echo 2. Conectar a tu base de datos 'gift-card'
echo 3. Click derecho en base de datos → Export database as SQL
echo 4. Guardar como: bd-actualizada-FECHA.sql
echo 5. Compartir archivo con compañeros via WhatsApp/Drive/etc
echo.
pause
goto menu

:importar
echo.
echo 📥 IMPORTANDO cambios de compañeros...
echo.
echo ⚠️  INSTRUCCIONES PARA IMPORTAR EN HEIDI:
echo 1. Descargar archivo bd-actualizada-FECHA.sql del compañero
echo 2. Abrir HeidiSQL
echo 3. File → Load SQL file... → seleccionar archivo descargado
echo 4. Click en "Execute" (F9) para ejecutar
echo 5. ✅ Tu base de datos estará sincronizada
echo.
pause
goto menu

:instrucciones
echo.
echo 📋 INSTRUCCIONES COMPLETAS DE SINCRONIZACION
echo.
echo 🔄 FLUJO DE TRABAJO PARA EL EQUIPO:
echo.
echo 1. CUANDO HAGAS CAMBIOS:
echo    - Exportar BD completa desde HeidiSQL
echo    - Nombrar archivo con fecha: bd-2025-09-12.sql
echo    - Enviar por WhatsApp al grupo
echo.
echo 2. CUANDO RECIBAS CAMBIOS:
echo    - Descargar archivo SQL
echo    - Importar en HeidiSQL (Load SQL file)
echo    - Ejecutar con F9
echo.
echo 3. ALTERNATIVA - SOLO CAMBIOS NUEVOS:
echo    - Usar archivo migrations/20250912_add_tipo_column.sql
echo    - Cada compañero ejecuta SOLO esa migración
echo.
echo 📁 ARCHIVOS IMPORTANTES:
echo    - gift-card.sql = Base de datos completa
echo    - migrations/ = Solo los cambios nuevos
echo    - SOLUCION-BD-COMPARTIDA.md = Opciones avanzadas
echo.
pause

:menu
echo.
echo ¿Quieres hacer algo más? (s/n)
set /p continuar=""
if /i "%continuar%"=="s" goto inicio
if /i "%continuar%"=="n" exit

:inicio
cls
goto inicio