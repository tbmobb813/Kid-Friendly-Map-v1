param(
    [string]$GradleTask = "app:assembleDebug",
    [string]$OutDir = ".."
)

# Timestamp used for the logfile name (sortable and unique)
$timestamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
$logName = "gradle_build_$timestamp.log"
$logPath = Join-Path -Path (Resolve-Path $OutDir).Path -ChildPath $logName

"=== Gradle build started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" | Out-File -FilePath $logPath -Encoding utf8

# Change to android directory (script is in scripts/)
Push-Location (Join-Path $PSScriptRoot "..\android")
try {
    # Run Gradle and tee output to log file (captures all streams)
    $flags = @('-x','lint','-x','test','--stacktrace','--info','--console=plain')
    Write-Output "Running: .\gradlew.bat $GradleTask $($flags -join ' ')"
    & .\gradlew.bat $GradleTask @flags *>&1 | Tee-Object -FilePath $logPath -Append
    $rc = $LastExitCode
} finally {
    Pop-Location
}

"=== Gradle build finished: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') (exit code: $rc) ===" | Out-File -FilePath $logPath -Append -Encoding utf8

if ($rc -ne 0) {
    Write-Error "Build failed (exit code $rc). Log: $logPath"
    exit $rc
} else {
    Write-Output "Build succeeded. Log: $logPath"
}
