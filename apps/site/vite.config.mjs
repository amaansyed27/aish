import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        downloads: resolve(__dirname, 'downloads/index.html')
      }
    }
  },
  plugins: [
    {
      name: 'aish-react-entry',
      transformIndexHtml() {
        return [
          {
            tag: 'meta',
            attrs: { name: 'theme-color', content: '#090807' },
            injectTo: 'head'
          },
          {
            tag: 'script',
            attrs: { type: 'module', src: '/src/main.jsx' },
            injectTo: 'body'
          }
        ];
      }
    }
  ]
});
