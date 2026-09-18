param(
  [string]$BaseUrl = "https://gam-vegam.rotemka.chatgpt.site",
  [string]$NodePath = "C:\Users\gaya\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe",
  [string]$PlaywrightNodeModules = "C:\Users\gaya\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules"
)

$ErrorActionPreference = 'Stop'
$env:BASE_URL = $BaseUrl
$env:PLAYWRIGHT_NODE_MODULES = $PlaywrightNodeModules
& $NodePath (Join-Path $PSScriptRoot 'browser-smoke.mjs')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
