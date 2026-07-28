# 騰元家系圖 AI 協助服務｜V6.1.1

## 最簡單的部署方式

### Windows
1. 解壓縮更新包。
2. 進入 `cloudflare-worker`。
3. 雙擊 `部署AI服務-Windows.bat`。
4. 瀏覽器登入 Cloudflare 後回到黑色視窗。
5. 部署完成會顯示 `https://...workers.dev` 網址。

### macOS
1. 安裝 Node.js LTS。
2. 對 `部署AI服務-macOS.command` 按右鍵開啟。
3. 登入 Cloudflare並等待部署完成。

## 部署後
1. 回到上一層開啟 `AI服務設定精靈.html`。
2. 貼上 workers.dev 網址並測試。
3. 下載 `ai-config.js`。
4. 把 `index.html` 與 `ai-config.js` 一起上傳到 GitHub Pages。

## 重要設定
- `wrangler.jsonc` 的 `ALLOWED_ORIGINS` 已預設為 `https://genesis-caotun.github.io,null`。
- 若改用其他網域，請把網域 Origin 加入清單，例如 `https://example.org`，不要包含路徑。
- `null` 是允許下載後以 `file://` 開啟的離線網頁呼叫 AI；不需要離線 AI 時可刪除。
- 每個瀏覽器識別碼每分鐘最多 6 次 AI 請求。
- Worker 不使用 KV、R2、D1 或 Durable Objects，程式也不記錄圖片本文。
- 第一次使用 Llama 3.2 Vision 時，Cloudflare可能要求接受 Meta 模型授權。

AI服務仍屬外部處理。正式個案圖片必須先遮蔽並符合機構規範。
