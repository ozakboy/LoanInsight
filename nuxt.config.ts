// https://nuxt.com/docs/api/configuration/nuxt-config
const siteUrl = 'https://loaninsight.ozakboy.life'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/content',
    'nuxt-gtag',
    '@nuxtjs/sitemap',
    '@vite-pwa/nuxt',
  ],

  // 全站開啟靜態生成（產出純 HTML，最利 SEO）
  ssr: true,
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/blog'],
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-TW' },
      meta: [
        { charset: 'UTF-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'google-adsense-account', content: 'ca-pub-5488118663607574' },
        // 預設 OG 圖片（個別頁可用 useSeoMeta 覆寫）
        { property: 'og:image', content: `${siteUrl}/og-image.png` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:image', content: `${siteUrl}/og-image.png` },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'theme-color', content: '#1e40af' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;700;900&display=swap',
        },
      ],
      script: [
        // Google AdSense
        {
          async: true,
          src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5488118663607574',
          crossorigin: 'anonymous',
        },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  // Tailwind CSS
  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: '~/tailwind.config.js',
  },

  // 文章內容（@nuxt/content）
  content: {
    documentDriven: false,
    highlight: {
      theme: 'github-light',
    },
    markdown: {
      anchorLinks: false,
    },
  },

  // Google Analytics 4（上線前把 ID 填入下方或設環境變數 NUXT_PUBLIC_GTAG_ID）
  gtag: {
    id: process.env.NUXT_PUBLIC_GTAG_ID || '',
    enabled: !!process.env.NUXT_PUBLIC_GTAG_ID,
  },

  // PWA：可安裝到手機主畫面、離線可用
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'LoanInsight 智貸見解',
      short_name: 'LoanInsight',
      description: '真實 APR 貸款試算與財務診斷工具',
      lang: 'zh-TW',
      theme_color: '#1e40af',
      background_color: '#0f172a',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      icons: [
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        {
          src: '/pwa-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      // HTML 與 JSON 都走 network，避免舊 HTML 索取已失效的 JSON 路徑
      globPatterns: ['**/*.{js,css,svg,png,ico,woff2}'],
      navigateFallback: null,
      // 新版 SW 立即啟用，覆寫舊快取（不必等使用者重開所有分頁）
      skipWaiting: true,
      clientsClaim: true,
      cleanupOutdatedCaches: true,
      // 對 navigation 與 API 走 network-first，文章內容更新即時反映
      runtimeCaching: [
        {
          urlPattern: ({ request }: { request: Request }) =>
            request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages-cache',
            networkTimeoutSeconds: 5,
          },
        },
        {
          urlPattern: /\/api\/_content\/.*/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'content-api-cache',
            networkTimeoutSeconds: 5,
          },
        },
      ],
    },
    client: {
      installPrompt: false,
    },
    devOptions: {
      enabled: false,
    },
  },

  // Sitemap
  site: {
    url: siteUrl,
    name: 'LoanInsight 智貸見解',
  },
  sitemap: {
    sources: ['/api/__sitemap__/urls'],
    autoLastmod: true,
  },

  // 部署到 GitHub Pages：產出檔案靜態化
  experimental: {
    payloadExtraction: false,
  },

  typescript: {
    strict: true,
  },

  // 自動匯入額外資料夾
  imports: {
    dirs: ['config'],
  },

  devtools: { enabled: false },
})
