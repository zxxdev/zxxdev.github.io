// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // User site on GitHub Pages: served from the root of this domain.
  site: "https://zxxdev.github.io",
  trailingSlash: "ignore",
  build: {
    format: "directory",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
