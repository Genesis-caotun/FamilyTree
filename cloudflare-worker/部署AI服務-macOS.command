#!/bin/bash
cd "$(dirname "$0")"
echo "家系圖 AI 服務部署精靈（Cloudflare）"
if ! command -v node >/dev/null 2>&1; then
  echo "尚未安裝 Node.js，請先安裝 LTS 版本。"
  read -p "按 Enter 結束"
  exit 1
fi
npx wrangler@latest login && npx wrangler@latest deploy
echo "部署完成後，複製 https://...workers.dev 網址，再開啟 AI服務設定精靈.html。"
read -p "按 Enter 結束"
