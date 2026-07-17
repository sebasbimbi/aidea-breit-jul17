import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── yachai design system (app dark) ─────────────────────────────
        brand: {
          green: "#27F3A9",
          outline: "#30463C",
          gray: "#888888",
          subtle: "#555555",
          ink: "#000000",
          surface: "#0a0a0a",
          surface2: "#111111",
        },
        // ── semantic tokens (re-skinned dark) ───────────────────────────
        // Names kept so existing components keep compiling; values flipped
        // to the dark palette. `ink` now resolves to the outline color so
        // any stray `border-ink` still renders a correct dark hairline.
        ink: "#30463C",
        paper: "#0a0a0a",
        panel: "#111111",
        line: "#30463C",
        muted: "#9ca3af",
        // achievement ramp — gris → verde marca (legible sobre fondo oscuro)
        nl: "#3f3f46", // No logrado · gris neutro (texto claro)
        n1: "#1d5c4f", // Nivel 1 · verde apagado (texto blanco ~7.7:1 AA)
        n2: "#0e7a5e", // Nivel 2 · verde medio (texto blanco ~5.3:1 AA)
        n3: "#27F3A9", // Nivel 3 · verde marca (texto oscuro: text-brand-ink)
        alert: "#f43f5e", // rosa de error — alineado a yachai
        mark: "#27F3A9", // acento (cualquier bg-mark restante cae en verde marca)
      },
      fontFamily: {
        display: [
          "'YDYoonche L'",
          "'YDYoonche M'",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      boxShadow: {
        glow: "0px 6px 24px 6px rgba(39, 243, 169, 0.15)",
        glowStrong: "0px 6px 32px 8px rgba(39, 243, 169, 0.22)",
      },
    },
  },
  plugins: [],
} satisfies Config;
