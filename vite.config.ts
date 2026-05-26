import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 部署設定說明：
// - 本機開發 / 自訂網域 (custom domain) 時使用 base '/'
// - GitHub Pages 專案頁 (https://<user>.github.io/loaninsight/) 需要 '/loaninsight/'
// 可透過環境變數 VITE_BASE 覆寫；GitHub Actions 建構時自動套用專案頁路徑。
const base =
  process.env.VITE_BASE ??
  (process.env.GITHUB_ACTIONS ? '/loaninsight/' : '/')

export default defineConfig({
  base,
  plugins: [vue()],
})
