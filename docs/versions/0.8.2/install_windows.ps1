# SmartWrite Companion Installer (Windows)
# v0.7.0

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "   SmartWrite Companion Installer (Windows)" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Cyan

# 1. Detect Vaults
Write-Host "`n🔍 Scanning for Obsidian Vaults..." -ForegroundColor Yellow
$configPath = "$env:APPDATA\Obsidian\obsidian.json"
$vaults = @()

if (Test-Path $configPath) {
    try {
        $json = Get-Content $configPath -Raw | ConvertFrom-Json
        foreach ($vault in $json.vaults.PSObject.Properties) {
            $path = $vault.Value.path
            if ($path) {
                $vaults += $path
            }
        }
    } catch {
        Write-Host "⚠️  Could not parse obsidian.json. You may need to enter path manually." -ForegroundColor Yellow
    }
}

if ($vaults.Count -eq 0) {
    Write-Host "❌ No vaults found automatically." -ForegroundColor Red
} else {
    Write-Host "✅ Found $($vaults.Count) vault(s)." -ForegroundColor Green
}

# 2. Select Vault
Write-Host "`n📂 Where should we install the plugin?" -ForegroundColor Cyan
$selection = $null
$targetVault = $null

for ($i = 0; $i -lt $vaults.Count; $i++) {
    Write-Host "[$($i+1)] $($vaults[$i])"
}
Write-Host "[$($vaults.Count + 1)] Custom Path"

do {
    $inputStr = Read-Host "Select a number"
    if ($inputStr -match '^\d+$') {
        $index = [int]$inputStr - 1
        if ($index -ge 0 -and $index -lt $vaults.Count) {
            $targetVault = $vaults[$index]
        } elseif ($index -eq $vaults.Count) {
            $targetVault = Read-Host "Enter full path to vault"
        }
    }
} while ($null -eq $targetVault)

if (-not (Test-Path $targetVault)) {
    Write-Host "❌ Error: Directory does not exist: $targetVault" -ForegroundColor Red
    exit 1
}

Write-Host "Selected: $targetVault" -ForegroundColor Yellow

# 3. Install Plugin
$pluginDir = Join-Path $targetVault ".obsidian\plugins\smartwrite-companion"
Write-Host "`n📦 Installing plugin files to: $pluginDir" -ForegroundColor Cyan

if (-not (Test-Path $pluginDir)) {
    New-Item -ItemType Directory -Force -Path $pluginDir | Out-Null
}

$files = @("main.js", "manifest.json", "styles.css")
$missing = $false

foreach ($file in $files) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $pluginDir -Force
    } else {
        Write-Host "❌ Missing file: $file. Run 'npm run build' first." -ForegroundColor Red
        $missing = $true
    }
}

if ($missing) { exit 1 }
Write-Host "✅ Plugin installed successfully." -ForegroundColor Green

# 4. Ollama Setup
Write-Host "`n🤖 Checking AI Environment..." -ForegroundColor Cyan

if (Get-Command ollama -ErrorAction SilentlyContinue) {
    Write-Host "✅ Ollama is installed." -ForegroundColor Green
    
    # Check if running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:11434" -Method Head -ErrorAction Stop
    } catch {
        Write-Host "⚠️  Ollama is not running. Starting it..." -ForegroundColor Yellow
        Start-Process "ollama" "serve" -WindowStyle Hidden
        Start-Sleep -Seconds 5
    }

    # 5. Model Setup
    $model = "qwen2.5:latest"
    Write-Host "`n🧠 Checking for model: $model..." -ForegroundColor Cyan
    
    $models = ollama list
    if ($models -match "qwen2.5") {
        Write-Host "✅ Model $model is ready." -ForegroundColor Green
    } else {
        Write-Host "📉 Model not found. Downloading $model..." -ForegroundColor Yellow
        ollama pull $model
    }

} else {
    Write-Host "⚠️  Ollama not found." -ForegroundColor Yellow
    $install = Read-Host "Do you want to try installing via Winget? (y/n)"
    if ($install -eq 'y') {
        winget install ollama
        Write-Host "Please restart this script after installation completes." -ForegroundColor Yellow
    } else {
        Write-Host "Please install Ollama manually: https://ollama.ai" -ForegroundColor Yellow
    }
}

Write-Host "`n==============================================" -ForegroundColor Cyan
Write-Host "🎉 Installation Complete!" -ForegroundColor Green
Write-Host "1. Open Obsidian"
Write-Host "2. Enable 'SmartWrite Companion' in Community Plugins"
Write-Host "==============================================" -ForegroundColor Cyan
Read-Host "Press Enter to exit..."
