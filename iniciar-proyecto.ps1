# Ruta del proyecto
$proyecto = "C:\Proyectos\rifas-app"

# Ir a la carpeta del proyecto
Set-Location $proyecto

# Abrir Visual Studio Code (opcional)
code .

# Instalar dependencias si no existen
if (!(Test-Path "node_modules")) {
  Write-Host "Instalando dependencias..."
  npm install
}

# Ejecutar React
Start-Process powershell -ArgumentList "npm start"

# Abrir navegador
Start-Process "http://localhost:3000"