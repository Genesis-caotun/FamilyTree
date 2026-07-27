# 家系圖快速製作器 V4.0.0

發布日期：2026-07-27

## 部署到 GitHub Pages

將 `index.html`、`styles.css`、`app.js` 三個檔案一起放在 `FamilyTree` 儲存庫根目錄：

```text
FamilyTree/
├─ index.html
├─ styles.css
└─ app.js
```

GitHub：Settings → Pages → Deploy from a branch → `main` / `/(root)`。

## V4 重點

- 自動避障直角路由，降低關係線穿過人物節點。
- 關係線可新增與拖曳手動轉折點。
- 文字解析容錯與未辨識內容回報。
- SVG／PNG 依內容範圍動態裁切。
- 一鍵匿名化：代號或隱藏姓名，可同步隱藏備註。
- 局部圖層更新與輸入儲存防抖。
- 手機／平板長按拖曳與方向微調。
- CSS、JavaScript 與 HTML 拆分，便於版本控制。

## 個資提醒

JSON 專案會保留原始姓名與資料，即使畫布開啟匿名模式也一樣。請依單位規範妥善保存。
