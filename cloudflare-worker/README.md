# Cloudflare Worker AI 協助端點

1. 安裝 Node.js 與 Wrangler：`npm install -g wrangler`
2. 登入：`wrangler login`
3. 進入本資料夾後執行：`wrangler deploy`
4. 首次使用 Llama 3.2 Vision 前，依 Cloudflare 官方文件接受 Meta 模型授權。
5. 將部署後的 `https://...workers.dev` 網址貼到家系圖 V6.1 的「Cloudflare Worker 端點」。
6. 正式使用請把 `ALLOWED_ORIGIN` 從 `*` 改成你的 GitHub Pages 網址，例如 `https://genesis-caotun.github.io`。

注意：Worker 端點不應記錄請求本文或圖片；請勿另外寫入 KV、R2、D1 或日誌。免費額度與模型供應可能調整，請以 Cloudflare 當下公告為準。
