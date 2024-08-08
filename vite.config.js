import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue2";
//import { createVuePlugin as vue } from "vite-plugin-vue2";
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
        globPatterns: ["**/*.{js,css,html,vue,png,svg,json}"],
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
});
