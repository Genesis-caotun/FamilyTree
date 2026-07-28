@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo =========================================
echo  家系圖 AI 服務部署精靈（Cloudflare）
echo =========================================
where node >nul 2>nul
if errorlevel 1 (
  echo 尚未安裝 Node.js。請先到 https://nodejs.org 安裝 LTS 版本。
  pause
  exit /b 1
)
echo 即將開啟瀏覽器登入 Cloudflare；完成後回到此視窗。
call npx wrangler@latest login
if errorlevel 1 goto :fail
call npx wrangler@latest deploy
if errorlevel 1 goto :fail
echo.
echo 部署完成。請複製上方顯示的 https://...workers.dev 網址，
echo 再開啟上一層的「AI服務設定精靈.html」。
pause
exit /b 0
:fail
echo 部署未完成，請依上方錯誤訊息檢查。
pause
exit /b 1
