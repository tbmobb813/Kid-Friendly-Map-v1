@echo off
REM Gradle wrapper script for the root directory (Windows)
REM This delegates to the actual gradlew.bat in the android\ directory

setlocal

REM Get the directory of this script
set SCRIPT_DIR=%~dp0
set ANDROID_DIR=%SCRIPT_DIR%android

REM Check if android directory exists
if not exist "%ANDROID_DIR%" (
    echo Error: android directory not found at %ANDROID_DIR%
    echo Run 'npx expo prebuild' to generate the android directory
    exit /b 1
)

REM Check if gradlew.bat exists in android directory
if not exist "%ANDROID_DIR%\gradlew.bat" (
    echo Error: gradlew.bat not found in android directory
    echo Run 'npx expo prebuild' to generate the android directory with gradle wrapper
    exit /b 1
)

REM Change to android directory and run gradlew.bat with all arguments
cd /d "%ANDROID_DIR%"
call gradlew.bat %*
exit /b %ERRORLEVEL%
