/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages 发布路径：/<仓库名>/
const BASE = '/Yoyo-s_Garden/'

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      // 新版本只在家长模式里提示更新，不自动刷新
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
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,mp3}'],
        navigateFallback: `${BASE}index.html`,
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
