@echo off
echo Starting Blue Carbon Registry...
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found. Installing dependencies...
call "C:\Program Files\nodejs\npm.cmd" install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    echo Trying alternative method...
    call npm install
    if %errorlevel% neq 0 (
        echo ERROR: Still failed. Please check your internet connection and try again.
        pause
        exit /b 1
    )
)

echo Dependencies installed successfully!
echo.
echo Starting the application...
echo The app will open in your browser at http://localhost:3000
echo.
echo Press Ctrl+C to stop the application
echo.

call "C:\Program Files\nodejs\npm.cmd" start
if %errorlevel% neq 0 (
    call npm start
)

pause




