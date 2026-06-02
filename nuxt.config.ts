// https://nuxt.com/docs/api/configuration/nuxt-config
const siteUrl = 'https://loaninsight.ozakboy.life'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/content',
    'nuxt-gtag',
    '@nuxtjs/sitemap',
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
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
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
