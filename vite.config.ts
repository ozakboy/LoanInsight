import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 部署設定說明：
// - 本機開發 (dev) 使用 base '/'
// - 生產建構 (build) 預設使用相對路徑 './'，可同時相容於：
//     * GitHub Pages 專案頁 https://<user>.github.io/<Repo>/（不受 repo 大小寫影響）
//     * 自訂網域根目錄
// 如需固定絕對路徑，可用環境變數 VITE_BASE 覆寫（例：VITE_BASE=/）。
export default defineConfig(({ command }) => ({
  base: process.env.VITE_BASE ?? (command === 'build' ? './' : '/'),
  plugins: [vue()],
}))
