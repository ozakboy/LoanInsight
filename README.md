# LoanInsight 智貸見解

現代化、高精準度的貸款試算與財務診斷 Web 應用。全前端靜態計算，零後端負擔，
專注於揭露「真正的貸款成本」並評估財務承載力。

## 核心功能

- **進階多參數輸入面板**：滑桿與數字框雙向綁定，含貸款金額（萬元）、年限、寬限期、開辦費用。
- **兩段式 / 階梯式利率**：可分別設定第一階段月數與利率、第二階段調升後利率。
- **真實 APR（總費用年百分率）**：以牛頓迭代法 (Newton-Raphson) 求解內部報酬率，
  將開辦費納入計算，揭露隱藏成本（`src/utils/finance.ts`）。
- **分階段收支動態診斷 (DSR)**：依可支配收入計算各階段月付比例，分級提示安全 / 警戒 / 紅線區。
- **雙銀行同屏 PK**：對比 APR、總利息、最高月付與總成本，並高亮推薦最省錢方案。
- **攤還曲線視覺化**：以 Chart.js 呈現剩餘本金遞減與累積利息曲線。

## 技術棧

| 層次 | 採用 |
| --- | --- |
| 前端框架 | Vue 3（Composition API）+ TypeScript |
| 建構工具 | Vite |
| 樣式 | Tailwind CSS |
| 圖表 | Chart.js / vue-chartjs |
| 部署 | GitHub Actions + GitHub Pages |

## 開發

```bash
npm install      # 安裝相依套件
npm run dev      # 本機開發（http://localhost:5173）
npm run build    # 型別檢查 + 生產打包至 dist/
npm run preview  # 預覽生產版本
npm run typecheck
```

## 部署到 GitHub Pages

推送到 `main` 分支時，`.github/workflows/deploy.yml` 會自動打包並部署。
請於 GitHub 倉庫 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**。

### Base 路徑

`vite.config.ts` 會依環境自動設定 `base`：

- 本機開發 / 自訂網域：`/`
- GitHub Actions 專案頁（`https://<user>.github.io/loaninsight/`）：`/loaninsight/`
- 可用環境變數 `VITE_BASE` 覆寫。

### 自訂網域

1. 在 `public/` 下建立 `CNAME` 檔，內容填入你的網域（如 `loaninsight.example.com`）。
2. 設定 base 為 `/`（自訂網域時設定 `VITE_BASE=/` 或移除工作流的專案頁路徑）。
3. 於 DNS 服務商新增指向 `<user>.github.io` 的 CNAME 紀錄。

### Google AdSense

- `public/ads.txt`：把 `pub-0000000000000000` 換成你的發布商 ID。
- `index.html`：解除 AdSense script 註解並填入 client ID。
- `src/components/AdSlot.vue`：將佔位容器替換為實際的 `<ins class="adsbygoogle">` 標籤。

## 免責聲明

所有計算皆於瀏覽器端完成，不蒐集任何個人資料。試算結果採等額本息法與牛頓迭代法估算，
僅供財務規劃參考，不構成任何貸款或投資建議。
