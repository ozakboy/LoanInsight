# AI.md — LoanInsight 專案實況指南

> 給 AI 代理人與開發者的「單一真實來源」。本檔以**實際程式碼**為準。
> 若 `README.md` 與本檔牴觸，以本檔為準。
> 最後校對：2026-06-07（對照 commit `96c19c7`）。

---

## 1. 專案是什麼

**LoanInsight 智貸見解** — 台灣市場導向的貸款試算與財務診斷工具。
全前端靜態計算、零後端、不蒐集個資。專注揭露「真實貸款成本（APR）」並評估財務承載力（DSR）。

- 線上站：<https://loaninsight.ozakboy.life>（自訂網域，`CNAME`）
- 部署：GitHub Actions → GitHub Pages，**從 `main` 分支**觸發（`.github/workflows/deploy.yml`）

## 2. 技術棧（實際，非 README 舊版）

| 層次 | 採用 |
| --- | --- |
| 框架 | **Nuxt 3**（`^3.15.4`），SSG 模式（`nuxt generate`） |
| 語言 | Vue 3（Composition API）+ TypeScript（`strict: true`） |
| 內容 | `@nuxt/content`（`content/blog/` 下 36 篇 Markdown 文章） |
| 樣式 | Tailwind CSS（`@nuxtjs/tailwindcss`） |
| 圖表 | Chart.js + vue-chartjs |
| PWA | `@vite-pwa/nuxt`（可安裝、離線、autoUpdate） |
| SEO | `@nuxtjs/sitemap` + 各頁 `useSeoMeta()` + JSON-LD |
| 分析 | `nuxt-gtag`（GA4 `G-RP8SWSM6L5`）+ Google Search Console 驗證 |
| 廣告 | Google AdSense（`ca-pub-5488118663607574`） |

> ⚠️ README 仍寫「Vue 3 + Vite、`src/utils/finance.ts`、`vite.config.ts`」——**那是 v1 舊版，已不存在**。實際是 Nuxt 3 v2.0.0，無 `src/` 目錄。

## 3. 目錄地圖

```
nuxt.config.ts            全站設定：head/SEO、PWA、sitemap、gtag、content
app.vue / layouts/        外層與預設版型
pages/
  index.vue               首頁：房貸試算 + 雙銀行 PK + DSR 診斷 + 攤還圖
  personal-loan.vue       信貸試算
  refinance.vue           房貸轉貸試算
  buy-vs-rent.vue         租買決策
  faq.vue                 FAQ 集中頁（含 FAQPage JSON-LD）
  blog/index.vue          文章列表
  blog/page/[n].vue       文章分頁（每頁 9 篇）
  blog/[...slug].vue      文章內頁
components/
  LoanInputPanel.vue      參數輸入面板（金額/年限/寬限期/兩段利率/開辦費/加碼還本）
  RangeInput.vue          滑桿 + 數字框雙向綁定（注意：目前無 +/− 微調鈕）
  BankComparison.vue      雙銀行對比表（APR/利息/最高月付/總成本，高亮較省方案）
  DiagnosisCard.vue       DSR 紅綠燈診斷卡（🟢🟡🔴）
  AmortizationChart.vue   攤還曲線（responsive，Y 軸以「萬」顯示）
  ShareActions.vue        複製分享連結
  BlogList.vue / AdSlot.vue
composables/
  useLoanCalculator.ts    包裝 finance 計算的反應式 composable
  useStateSync.ts         狀態持久化：localStorage + URL hash（base64url）
utils/
  finance.ts              ★核心：攤還表、APR(牛頓法)、DSR、格式化
  personalLoan.ts / refinance.ts / buyVsRent.ts  其餘三個計算器
config/ads.ts             AdSense 設定（自動 import，見 nuxt.config imports.dirs）
data/faqs.ts              FAQ 題庫（30+ 題，5 群組）
types/                    loan.ts / personalLoan.ts / refinance.ts / buyVsRent.ts
plugins/state-hash.client.ts  最早期抓 URL hash（避開 Router 清除時機）
server/api/__sitemap__/urls.ts  動態產生 sitemap 來源
```

## 4. 核心資料模型（`types/loan.ts`）

- `LoanInput`：單一銀行方案輸入。支援 `gracePeriodMonths`（寬限期）、
  `rateType: 'single' | 'dual'`（兩段/階梯式利率）、`originationFee`（開辦費）、
  `extraMonthlyPrincipal`（每月加碼還本）。
- `LoanResult`：含 `apr`（真實總費用年百分率）、`nominalRate`、`maxMonthlyPayment`、
  `totalCost`、`monthsSaved`/`interestSaved`（加碼還本效益）。
- `DsrDiagnosis`：`level: 'safe' | 'warning' | 'danger'` 對應紅綠燈。

## 5. 已實作功能清單（避免重做）

對照常見「改進建議」，以下**程式碼裡已經有**：

- ✅ PWA / Service Worker / 離線（`nuxt.config.ts:90-149`）
- ✅ 兩段式 / 階梯式利率（`utils/finance.ts:41-47`）
- ✅ 寬限期只付利息（`utils/finance.ts:60-69`）
- ✅ 提早部分還款（`utils/finance.ts:85-92`）
- ✅ 雙銀行對比表（`components/BankComparison.vue`）
- ✅ 千分位 + 萬元標註（`utils/finance.ts:236` `toLocaleString('zh-TW')`）
- ✅ DSR 紅綠燈視覺診斷（`components/DiagnosisCard.vue`）
- ✅ 分享連結（URL hash）+ localStorage 自動儲存（`composables/useStateSync.ts`）
- ✅ `lang="zh-TW"` + 全中文 Title/Meta（`nuxt.config.ts:26`、各頁 `useSeoMeta`）
- ✅ Sitemap、robots.txt、GA4、Search Console 驗證
- ✅ FAQ 頁 + FAQPage JSON-LD 結構化資料（`pages/faq.vue:14-35`）
- ✅ 36 篇知識庫文章（`content/blog/`）
- ✅ 攤還明細 **CSV 匯出 + 列印/存 PDF**（`utils/export.ts`、`components/ExportActions.vue`、`@media print`）
- ✅ **關於 / 專業聲明頁**（`pages/about.vue`，含 AboutPage/Organization JSON-LD）
- ✅ 滑桿 **+/− 微調鈕**（`components/RangeInput.vue`）
- ✅ **台銀參考利率自動同步架構**（見第 6 節，cron 爬蟲 + `data/rates.json` + `components/RateReference.vue`）

## 6. 利率自動同步（架構已建，待首跑驗證）

- 資料檔：`data/rates.json`（`auto: false` 表尚未經爬蟲驗證、為播種參考值）。
- 爬蟲：`scripts/update-rates.mjs`（Node 內建 fetch，**故障安全**：解析失敗不覆蓋、不讓 CI 失敗）。
- 排程：`.github/workflows/update-rates.yml`（每週 cron + `workflow_dispatch`，有變動才 commit 回 `main` → 觸發 Pages 重新部署）。
- 顯示：`components/RateReference.vue`（首頁「市場參考利率」區塊）。
- ⚠️ **沙箱連不到台銀（host allowlist），爬蟲選擇器尚未經真實 HTML 驗證**。
  請到 GitHub Actions 手動 `workflow_dispatch` 跑一次 `Update reference rates`，
  依 log 調整 `parseBaseLendingRate()`。成功後 `data/rates.json` 的 `auto` 會變 `true`。

## 7. 仍未實作（真正可做的待辦）

- ⚠️ **持久化僅 localStorage**，無 IndexedDB、無「多組歷史紀錄」清單（僅保存當前表單狀態）。
  評估：與既有的分享連結 + A/B PK 高度重疊，需求待確認再做。
- 🔧 **參考利率「一鍵套用」到試算欄位**：目前 `RateReference` 為唯讀顯示。
  套用到哪個方案/哪一階段是產品決策，待確認。
- 🔧 **擴充爬蟲來源**：目前僅解析台銀基準放款利率；定儲指數、央行重貼現率仍為播種值。

## 8. 重要陷阱（務必先讀）

- 🔥 **PWA 舊快取會餵舊版**：曾發生 Service Worker 預快取舊 HTML/JS，導致使用者
  看到的是好幾版之前的內容（commit `651ce45`）。**「線上實測」前務必硬重整或
  Unregister SW**，否則你看到的可能不是最新部署。現行設定已對 HTML/JSON 走
  NetworkFirst + `skipWaiting` + `cleanupOutdatedCaches` 緩解，但返客首次仍需一次重整。
- URL hash 狀態必須在 Router 清除前抓取——這就是 `plugins/state-hash.client.ts` 存在的原因，
  改動分享/狀態邏輯時別破壞它。
- 部署只認 `main`。功能合進 `main` 才會上線。
- `config/` 會被自動 import（`nuxt.config.ts` `imports.dirs`），新增檔案注意命名衝突。

## 9. 常用指令

```bash
npm install      # 安裝（postinstall 會跑 nuxt prepare）
npm run dev      # 本機開發
npm run generate # SSG 靜態打包到 .output/public（部署用）
npm run preview  # 預覽
npm run typecheck
```

## 10. 給 AI 代理人的工作原則

1. **先對照本檔再批評/動工**，別對著舊 README 或被快取的線上版開藥方。
2. 改計算邏輯 → 動 `utils/*.ts` 與對應 `types/*.ts`，UI 在 `components/`。
3. 改 SEO/PWA/全站 head → `nuxt.config.ts`；改單頁 meta → 該頁 `useSeoMeta()`。
4. 新增文章 → `content/blog/*.md`（會自動進列表、sitemap、首頁精選）。
5. 完成後更新本檔「已實作 / 待辦」兩節，保持與程式碼同步。
