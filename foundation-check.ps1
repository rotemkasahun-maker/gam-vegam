$ErrorActionPreference = 'Stop'

$source = Get-Content -Raw (Join-Path $PSScriptRoot 'script.js')
$required = @(
  'const dispatch =',
  'const render =',
  'const navigate =',
  'const writeLocation =',
  'const boot =',
  'const initializeState =',
  'const restoreRouteAndContext ='
)
foreach ($token in $required) {
  if ([regex]::Matches($source, [regex]::Escape($token)).Count -ne 1) {
    throw "Expected exactly one owner: $token"
  }
}

$forbidden = @('page(', 'basePage', 'oldPage', 'window.page', 'renderFix', 'bind(', 'bindFix', 'suppressLegacy', 'stopImmediatePropagation', 'capture')
foreach ($token in $forbidden) {
  if ($source.Contains($token)) { throw "Forbidden legacy ownership token found: $token" }
}
if ($source -match '(?i)\bqa\b') { throw 'QA route detected in production shell' }
if ($source.Contains("'hashchange'")) { throw 'Competing hashchange navigation owner detected' }

$automationDiff = git -c safe.directory="$PSScriptRoot" diff --name-only -- automation
if ($automationDiff) { throw "Protected automation changed: $automationDiff" }

Write-Output 'FOUNDATION_STATIC_CHECK=PASS'
