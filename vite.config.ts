import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/index.ts',
      exportName: 'app',
      tsCompiler: 'esbuild',
      swcOptions: {}
    })
  ],
  server: {
    port: 3000,
    host: '0.0.0.0'
  },
  build: {
    target: 'node18',
    outDir: 'dist',
    ssr: true,
    rollupOptions: {
      input: 'src/index.ts',
      output: {
        format: 'esm'
      }
    }
  },
  optimizeDeps: {
    exclude: ['vite-plugin-node']
  },
  define: {
    global: 'globalThis'
  }
});
