/// <reference types="vitest" />
import { PluginOption, defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [react(), dts({ rollupTypes: true }) as unknown as PluginOption],
  build: {
    lib: {
      entry: resolve(__dirname, "lib/useLocalStorage.ts"),
      formats: ["es"],
    },
    rollupOptions: {
      external: ["react"],
      output: {
        globals: {
          react: "react",
        },
      },
    },
  },
  test: {
    environment: "happy-dom",
  },
});
