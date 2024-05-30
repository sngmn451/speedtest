import { defineConfig } from "astro/config"
import MillionLint from "@million/lint"
import million from "million/compiler"
import react from "@astrojs/react"
import tailwind from "@astrojs/tailwind"
import cloudflare from "@astrojs/cloudflare"

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
      tailwind({
      applyBaseStyles: false
    }),
    million.vite({
      mode: "react",
      server: true,
      auto: true
    }),
    MillionLint.vite()
  ],
  output: "server",
  adapter: cloudflare(),
  devToolbar: {
    enabled: false
  }
})
