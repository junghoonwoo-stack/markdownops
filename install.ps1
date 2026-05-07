# MarkdownOps — install + build every MCP server (Windows / PowerShell).
# Usage:
#   .\install.ps1                       install all servers
#   .\install.ps1 github jira           install only the listed servers

param(
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$RequestedServers = @()
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$allServers = @("github", "gitlab", "jira", "linear", "notion")

if ($RequestedServers.Count -gt 0) {
    $servers = $RequestedServers
} else {
    $servers = $allServers
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is required but not installed. Install Node.js (>=18): https://nodejs.org/"
    exit 1
}

foreach ($s in $servers) {
    $dir = Join-Path $root "mcp-servers\$s"
    if (-not (Test-Path $dir)) {
        Write-Warning "Skipping unknown server '$s' (no $dir)"
        continue
    }
    Write-Host ""
    Write-Host "==> install mcp-servers/$s"
    Push-Location $dir
    try {
        npm install --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { throw "npm install failed for $s" }
        npm run build
        if ($LASTEXITCODE -ne 0) { throw "npm run build failed for $s" }
    } finally {
        Pop-Location
    }
}

Write-Host ""
Write-Host "Done."
Write-Host "Each MCP server binary is at: mcp-servers/<name>/dist/index.js"
Write-Host "Wire into your runtime — see runners/<your-runtime>.md."
