# LoanInsight 智貸見解

現代化、高精準度的貸款試算與財務診斷 Web 應用。全前端靜態計算，零後端負擔、不蒐集個資，
專注於揭露「真正的貸款成本（APR）」並評估財務承載力（DSR）。

> 📌 開發者與 AI 代理人請先讀 [`AI.md`](./AI.md) — 那是專案實況的單一真實來源。

線上站：<https://loaninsight.ozakboy.life>

## 核心功能

- **房貸試算 + 雙銀行 PK**：對比 APR、總利息、最高月付與總成本，高亮較省方案。
- **兩段式 / 階梯式利率**：分別設定第一階段月數與利率、第二階段調升後利率。
- **寬限期與加碼還本**：支援寬限期（只繳息）與每月加碼還本，計算提早還清月數與省息。
- **真實 APR（總費用年百分率）**：以牛頓迭代法求解內部報酬率，將開辦費納入計算
  （`utils/finance.ts`）。
- **分階段 DSR 收支診斷**：依可支配收入計算月付比例，以紅綠燈分級提示安全／警戒／紅線。
- **攤還曲線視覺化**：以 Chart.js 呈現剩餘本金遞減與累積利息曲線。
- **分享連結 + 自動儲存**：方案以 URL hash 編碼，可複製傳給配偶／代書；並自動存入
  localStorage，重整不遺失。
- **多工具**：信貸試算、房貸轉貸試算、租買決策、FAQ 與 36 篇貸款知識庫文章。

## 技術棧

| 層次 | 採用 |
| --- | --- |
| 框架 | Nuxt 3（SSG，`nuxt generate`） |
| 語言 | Vue 3（Composition API）+ TypeScript |
| 內容 | @nuxt/content（`content/blog/`） |
| 樣式 | Tailwind CSS |
| 圖表 | Chart.js / vue-chartjs |
| PWA | @vite-pwa/nuxt（可安裝、離線、autoUpdate） |
| SEO | @nuxtjs/sitemap + 各頁 useSeoMeta + JSON-LD |
| 分析 | nuxt-gtag（GA4）+ Google Search Console |
| 部署 | GitHub Actions + GitHub Pages |

## 開發

```bash
npm install      # 安裝相依套件（postinstall 自動 nuxt prepare）
npm run dev      # 本機開發
npm run generate # 型別檢查 + SSG 靜態打包至 .output/public
npm run preview  # 預覽生產版本
npm run typecheck
```

## 部署到 GitHub Pages

推送到 `main` 分支時，`.github/workflows/deploy.yml` 會自動 `npm run generate` 並部署。
請於 GitHub 倉庫 **Settings → Pages → Source** 選擇 **GitHub Actions**。

自訂網域由根目錄 `CNAME`（`loaninsight.ozakboy.life`）指定。

> ⚠️ PWA 注意：Service Worker 可能讓返客短暫看到舊快取版本。實測線上站時，
> 請先在 DevTools → Application → Service Workers 點 Unregister 並硬重整（Ctrl+Shift+R）。

## 免責聲明

所有計算皆於瀏覽器端完成，不蒐集任何個人資料。試算結果採等額本息法與牛頓迭代法估算，
僅供財務規劃參考，不構成任何貸款或投資建議；實際貸款條件以銀行核貸為準。
