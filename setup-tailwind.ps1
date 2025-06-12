Write-Host "Iniciando configuración de Tailwind CSS..."

# Verifica si tienes nvm
if (-not (Get-Command nvm -ErrorAction SilentlyContinue)) {
    Write-Host "No tienes 'nvm' instalado. Descárgalo de: https://github.com/coreybutler/nvm-windows/releases"
    exit
}

# Instala y usa Node.js 20
Write-Host "Instalando Node.js LTS (20)..."
nvm install 20
nvm use 20

# Muestra versión activa
$nodeVersion = node -v
Write-Host "Usando Node.js versión: $nodeVersion"

# Ir a la carpeta del script
Set-Location -Path "$PSScriptRoot"
Write-Host "Proyecto: $PWD"

# Limpiar
Write-Host "Limpiando proyecto..."
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue

# Instalar dependencias
Write-Host "Instalando dependencias..."
npm install

# Instalar TailwindCSS
Write-Host "Instalando TailwindCSS..."
npm install -D tailwindcss postcss autoprefixer

# Generar configuración
Write-Host "Generando archivos de configuración..."
npx tailwindcss init -p

Write-Host "TailwindCSS está listo para usarse"
