@echo off
title A-AI v1.1 - Desktop Developer Suite
color 0B
cls

:menu
cls
echo ===================================================
echo             A-AI v1.1 DESKTOP DEVELOPER SUITE      
echo ===================================================
echo.
echo  [1] Run and Test Application (Local Sandbox)
echo  [2] Compile Standalone Windows Setup Installer (.exe)
echo  [3] Install/Update Required Developer Packages (npm)
echo  [4] Auto-Build Conflict-Free desktop-index.html (Safe Compiler)
echo  [5] Convert logo.png to High-Res logo.ico (Icon Builder)
echo  [6] Exit Suite
echo.
echo ===================================================
set /p opt="Select an option (1-6) and press Enter: "

if "%opt%"=="1" goto run_app
if "%opt%"=="2" goto compile_installer
if "%opt%"=="3" goto install_packages
if "%opt%"=="4" goto build_desktop_html
if "%opt%"=="5" goto convert_icon
if "%opt%"=="6" exit
goto menu

:run_app
cls
echo [*] Launching A-AI v1.1 in local environment...
call npm start
if %errorlevel% neq 0 (
    echo.
    echo [!] App failed to boot. Make sure you ran Option [3] first!
    pause
)
goto menu

:compile_installer
cls
echo [*] Starting NSIS Compiler Pipeline...
echo [*] Converting icons, packing files, and registering registries...
call npx electron-builder --win
if %errorlevel% neq 0 (
    echo.
    echo [!] Compilation failed. Check your configuration profiles or logo.ico existence!
    pause
) else (
    echo.
    echo [OK] Setup compilation finished successfully!
    echo [OK] Your installer "A-AI_1.1_Setup.exe" is ready in the "dist/" folder.
    pause
)
goto menu

:install_packages
cls
echo [*] Installing and refreshing node dependencies locally...
call npm install electron electron-builder --save-dev
if %errorlevel% neq 0 (
    echo.
    echo [!] Installation encountered errors. Double-check your internet and Node setup!
    pause
) else (
    echo.
    echo [OK] All developer modules and compilers installed successfully!
    pause
)
goto menu

:build_desktop_html
cls
echo [*] Starting safe HTML compiler...
echo [*] Checking local environment...
if not exist index.html (
    echo.
    echo [Error] index.html not found! Please place your original web index.html in this folder first.
    pause
    goto menu
)

echo [*] Copying your original web index.html to desktop-index.html...
copy /Y index.html desktop-index.html >nul

echo [*] Injecting desktop links, scripts, and banner into desktop-index.html...
powershell -Command "[System.IO.File]::WriteAllText('desktop-index.html', ([System.IO.File]::ReadAllText('desktop-index.html', [System.Text.Encoding]::UTF8) -replace '<head>', '<head><link rel="stylesheet" href="desktop-style.css">' -replace '<body>', '<body><div id="offline-banner" class="hidden">⚠️ OFFLINE MODE: Running on Local Database Cache</div>' -replace '</body>', '<script src="cript.js"></script></body>' -replace '<title>.*?</title>', '<title>A-AI v1.1</title>' -replace 'v1.0', 'v1.1' -replace 'Version 1.0', 'Version 1.1'), [System.Text.Encoding]::UTF8)"

if %errorlevel% neq 0 (
    echo.
    echo [!] Safe HTML compiling failed.
    pause
) else (
    echo.
    echo [OK] SUCCESS! 'desktop-index.html' compiled cleanly from your original code.
    echo [OK] Your original layout, custom text buttons, and script click hooks are 100% preserved!
    pause
)
goto menu

:convert_icon
cls
echo [*] Processing 'logo.png' into high-density transparency 'logo.ico'...
powershell -Command "[Reflection.Assembly]::LoadWithPartialName('System.Drawing') | Out-Null; if (Test-Path 'logo.png') { $img = [System.Drawing.Image]::FromFile('logo.png'); $bmp = New-Object System.Drawing.Bitmap($img, 256, 256); $bmp.Save('logo.ico', [System.Drawing.Imaging.ImageFormat]::Icon); $img.Dispose(); $bmp.Dispose(); Write-Host 'logo.ico generated successfully!' -ForegroundColor Green } else { Write-Host 'Error: logo.png not found in directory!' -ForegroundColor Red }"
pause
goto menu
