import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: false,
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,gif,json}"],
        // The store screenshots are only read by the install UI, and the PWA
        // icons are already listed in includeAssets.
        globIgnores: [
          "**/*.pdf",
          "**/screenshot_*.png",
          "**/logo_test_large.png",
          "**/.DS_Store",
          // Lazily imported county outlines: fetched only if the user turns
          // the county overlay on, and runtime-cached below.
          "**/county-*.js",
        ],
        // Species distribution maps live on a CDN (see SPECIES_MAP_BASE) and
        // are opened one at a time from a download link, so cache them as they
        // are actually requested rather than up front.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => /\/species_map\/[^/]+\.png$/.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "species-maps",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => /\/assets\/county-[\w-]+\.js$/.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "county-geojson",
              expiration: { maxEntries: 2, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.hostname === "api.mapbox.com",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "mapbox-tiles",
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        maximumFileSizeToCacheInBytes: 10000000,
      },
      includeAssets: [
        "favicon.ico",
        "apple-touch-icon-180x180.png",
        "pwa-*.png",
        "logo_*.png",
        "bird_atlas_of_kenya.png",
        "maskable-icon-512x512.png",
      ],
      manifest: {
        name: "Kenya Bird Trends",
        description:
          "Visualisation of the distribution changes of birds in Kenya between 1980s and 2010s",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "screenshot_wide.png",
            sizes: "1748x996",
            type: "image/png",
            form_factor: "wide",
          },
          {
            src: "screenshot_long.png",
            sizes: "519x779",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  base: "/",
  test: {
    // store.js touches localStorage and window.location at import time.
    environment: "happy-dom",
    include: ["tests/**/*.test.js"],
  },
});
