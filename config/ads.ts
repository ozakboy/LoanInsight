// Google AdSense 設定（單一來源真相）
// 主腳本載入於 index.html <head>，本檔僅提供 publisher / slot ID 給 AdSlot 元件使用。
export const adsConfig = {
  /** AdSense 發布商 ID（ca-pub-...） */
  publisherId: 'ca-pub-5488118663607574',
  /** 各版位對應的廣告單元 slot ID */
  slots: {
    /** 報表交界橫幅（內容區內，響應式） */
    banner: '7072801697',
    /** 右側留白區直立式（300×600，僅超寬螢幕顯示） */
    skyscraper: '6806728297',
  },
} as const

export type AdFormat = keyof typeof adsConfig.slots
