/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages 发布路径：/<仓库名>/
const BASE = '/Yoyo-s_Garden/'

export default defineConfig({
  base: BASE,
  // 开发时把 /yoyo-words/ 转到本地的 YoYo Words（python3 serve.py），和线上一样同源，默写页才能嵌进来
  server: {
    proxy: {
      '/yoyo-words': { target: 'http://localhost:8377', rewrite: (path) => path.replace(/^\/yoyo-words/, '') },
    },
  },
  plugins: [
    react(),
    VitePWA({
      // 新版本在刚打开 / 切回前台时自动换上（见 app/pwa.ts），家长模式里也能手动更新
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: '小花园成长计划',
        short_name: '小花园',
        description: '完成每天的任务，经营自己的小花园',
        lang: 'zh-CN',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        orientation: 'landscape',
        background_color: '#FFF9F5',
        theme_color: '#FF9EC0',
        icons: [
          { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,woff2,mp3}'],
        // 英文录音有上千个：不放进更新包（一个下载失败整次更新就作废），点到哪句下哪句，下过的存着离线也能放
        globIgnores: ['**/audio/en/**'],
        navigateFallback: `${BASE}index.html`,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/audio/en/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'en-audio',
              expiration: { maxEntries: 3000 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
