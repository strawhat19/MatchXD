param([switch]$Web, [switch]$Clear, [int]$Port = 8081)
$ErrorActionPreference = 'Stop'
$projectDirectory = Split-Path -Parent $PSScriptRoot
$runtimeNode = (Get-Command node -ErrorAction SilentlyContinue).Source
$compatible = $false
if ($runtimeNode) {
    $runtimeVersion = [Version]((& $runtimeNode --version).TrimStart('v'))
    $compatible = ($runtimeVersion.Major -eq 20 -and $runtimeVersion -ge [Version]'20.19.4') -or ($runtimeVersion.Major -eq 22 -and $runtimeVersion -ge [Version]'22.13.0') -or ($runtimeVersion -ge [Version]'24.3.0')
}
if (-not $compatible) {
    $bundledNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
    if (-not (Test-Path -LiteralPath $bundledNode)) { throw 'Install Node 24 LTS, Then Run npm install And npm start' }
    $runtimeNode = $bundledNode
}
$expoEntry = Join-Path $projectDirectory 'node_modules\expo\bin\cli'
if (-not (Test-Path -LiteralPath $expoEntry)) { throw 'Dependencies Missing: Run npm install With Supported Node First' }
$env:Path = (Split-Path -Parent $runtimeNode) + ';' + $env:Path
$expoArguments = @('start', '--lan', '--port', $Port)
if ($Web) { $expoArguments += '--web' }
if ($Clear) { $expoArguments += '--clear' }
Write-Output ('Starting MatchXD With Node ' + (& $runtimeNode --version))
Push-Location -LiteralPath $projectDirectory
try { & $runtimeNode $expoEntry @expoArguments }
finally { Pop-Location }
