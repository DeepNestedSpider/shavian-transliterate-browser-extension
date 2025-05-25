@echo off
setlocal

echo Running Bun build...
bun run build:dist
if %errorlevel% neq 0 (
    echo Bun build failed. Exiting.
    exit /b %errorlevel%
)

echo Packaging up at 'shavian-transliterate-browser-extension'

if not exist "shavian-transliterate-browser-extension" (
    echo Creating folder 'shavian-transliterate-browser-extension'
    mkdir "shavian-transliterate-browser-extension"
)

echo Purging 'shavian-transliterate-browser-extension' folder contents
rd /s /q "shavian-transliterate-browser-extension\*" 2>nul
echo Copying contents of './dist' to './shavian-transliterate-browser-extension'
xcopy /s /e /y /i ".\dist" ".\shavian-transliterate-browser-extension\"

echo Purging './releases' folder contents
rd /s /q ".\releases\*" 2>nul
mkdir ".\releases" 2>nul

echo Compressing to *.tar.gz and storing in 'releases'
"C:\Program Files\Git\usr\bin\tar.exe" -cvzf ".\releases\shavian-transliterate-browser-extension.tar.gz" ".\shavian-transliterate-browser-extension"
if %errorlevel% neq 0 (
    echo tar.exe failed. Make sure Git Bash or a compatible tar utility is in your PATH, or specify its full path. Exiting.
    exit /b %errorlevel%
)

echo Compressing to *.zip and storing in 'releases'
powershell -command "& {Add-Type -A 'System.IO.Compression.FileSystem'; [IO.Compression.ZipFile]::CreateFromDirectory('.\shavian-transliterate-browser-extension', '.\releases\shavian-transliterate-browser-extension.zip');}"
if %errorlevel% neq 0 (
    echo PowerShell zip creation failed. Exiting.
    exit /b %errorlevel%
)

echo All done
endlocal
