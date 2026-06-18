import { defineConfig, externalizeDepsPlugin } from "electron-vite"
import { resolve } from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "tailwindcss"
import autoprefixer from "autoprefixer"
import type { Plugin } from "vite"

/**
 * @shikijs/themes only ships one ayu variant (ayu-dark) and the renderer
 * transitively requests non-existent subpaths like 'ayu-mirage' / 'ayu-light'
 * during dep-resolution. Vite's `resolve.alias` is evaluated AFTER the
 * package-exports check, so a missing `./ayu-mirage` specifier fails before
 * the alias runs. This resolveId hook sits before that check and returns
 * the ayu-dark module for any missing @shikijs/themes/<name> request.
 */
function shikijsThemeFallback(): Plugin {
  const fallback = "@shikijs/themes/ayu-dark"
  return {
    name: "halotec-shikijs-theme-fallback",
    enforce: "pre",
    resolveId(source: string) {
      if (source === fallback) return null
      if (source.startsWith("@shikijs/themes/")) {
        // Map ANY subpath to ayu-dark; @shikijs/themes/ayu-dark passes through
        return fallback
      }
      return null
    },
  }
}

const isDev = process.env.NODE_ENV !== "production"

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin({
        // Don't externalize these - bundle them instead
        exclude: ["superjson", "trpc-electron", "gray-matter", "async-mutex"],
      }),
    ],
    build: {
      lib: {
        entry: resolve(__dirname, "src/main/index.ts"),
      },
      rollupOptions: {
        external: [
          "electron",
          "better-sqlite3",
          "@prisma/client",
          "@anthropic-ai/claude-agent-sdk", // ESM module - must use dynamic import
        ],
        output: {
          format: "cjs",
        },
      },
    },
  },
  preload: {
    plugins: [
      externalizeDepsPlugin({
        exclude: ["trpc-electron"],
      }),
    ],
    build: {
      lib: {
        entry: resolve(__dirname, "src/preload/index.ts"),
      },
      rollupOptions: {
        external: ["electron"],
        output: {
          format: "cjs",
        },
      },
    },
  },
  renderer: {
    plugins: [
      // Must be first — intercepts missing @shikijs/themes/<name> requests
      // before Vite's package-exports check rejects them.
      shikijsThemeFallback(),
      react({
        // In dev mode, use WDYR as JSX import source to track ALL component re-renders
        jsxImportSource: isDev
          ? "@welldone-software/why-did-you-render"
          : undefined,
      }),
    ],
    resolve: {
      alias: [
        { find: "@", replacement: resolve(__dirname, "src/renderer") },
        // @shikijs/themes only ships one ayu variant (ayu-dark). Transitive
        // deps may request 'ayu-light', 'ayu-mirage', or any other theme
        // not in this package. Map any missing subpath to ayu-dark so the
        // build never fails on a missing theme specifier.
        {
          find: /^@shikijs\/themes\/.+/,
          replacement: "@shikijs/themes/ayu-dark",
        },
      ],
    },
    optimizeDeps: {
      // Skip prebundling — alias above handles subpath requests.
      exclude: ["@shikijs/themes"],
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "src/renderer/index.html"),
          login: resolve(__dirname, "src/renderer/login.html"),
        },
      },
    },
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    },
  },
})
